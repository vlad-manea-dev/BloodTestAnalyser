import json
import logging
from pathlib import Path

from app.models import (
    AnalysisResult,
    Biomarker,
    BiomarkerStatus,
    ExtractedBiomarker,
)
from app.services.pdf_parser import extract_text_from_pdf, extract_biomarkers_regex
from app.services.llm_service import extract_biomarkers_llm, analyze_biomarkers

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent / "data"
REFERENCE_RANGES = json.loads((DATA_DIR / "reference_ranges.json").read_text())

def find_reference_range(biomarker_name: str) -> dict | None:
    name_lower = biomarker_name.lower().strip()
    
    # Direct match
    if name_lower in REFERENCE_RANGES:
        ref = REFERENCE_RANGES[name_lower]
        ranges = ref["ranges"].get("default", list(ref["ranges"].values())[0])
        return {
            "low": ranges["low"],
            "high": ranges["high"],
            "unit": ref["unit"],
            "description": ref["description"]
        }
    
    # Check aliases
    for key, ref in REFERENCE_RANGES.items():
        if name_lower in [a.lower() for a in ref.get("aliases", [])]:
            ranges = ref["ranges"].get("default", list(ref["ranges"].values())[0])
            return {
                "low": ranges["low"],
                "high": ranges["high"],
                "unit": ref["unit"],
                "description": ref["description"]
            }
    
    return None

def determine_status(value: float, ref_low: float, ref_high: float) -> BiomarkerStatus:
    if value < ref_low:
        return BiomarkerStatus.LOW
    elif value > ref_high:
        return BiomarkerStatus.HIGH
    return BiomarkerStatus.NORMAL

def merge_biomarkers(regex_results: list[ExtractedBiomarker], llm_results: list[ExtractedBiomarker]) -> list[ExtractedBiomarker]:
    seen_names = {b.name.lower() for b in regex_results}
    merged = list(regex_results)
    
    for biomarker in llm_results:
        if biomarker.name.lower() not in seen_names:
            merged.append(biomarker)
            seen_names.add(biomarker.name.lower())
    
    return merged

async def analyze_blood_test(pdf_bytes: bytes) -> AnalysisResult:
    """
    Full analysis pipeline:
    1. Extract text from PDF
    2. Extract biomarkers (regex + LLM fallback)
    3. Compare to reference ranges
    4. Generate explanations and recommendations via LLM
    """
    # Step 1: Extract text
    logger.info("Extracting text from PDF...")
    raw_text = extract_text_from_pdf(pdf_bytes)
    
    if not raw_text.strip():
        raise ValueError("Could not extract text from PDF. The file may be image-based or corrupted.")
    
    # Step 2: Extract biomarkers
    logger.info("Extracting biomarkers with regex...")
    regex_biomarkers = extract_biomarkers_regex(raw_text)
    logger.info(f"Regex found {len(regex_biomarkers)} biomarkers")
    
    # Use LLM for additional extraction
    logger.info("Using LLM for comprehensive extraction...")
    try:
        llm_biomarkers = await extract_biomarkers_llm(raw_text)
        logger.info(f"LLM found {len(llm_biomarkers)} biomarkers")
    except Exception as e:
        logger.warning(f"LLM extraction failed or timed out: {e}. Proceeding with regex results only.")
        llm_biomarkers = []
    
    # Merge results
    all_biomarkers = merge_biomarkers(regex_biomarkers, llm_biomarkers)
    logger.info(f"Total unique biomarkers: {len(all_biomarkers)}")
    
    if not all_biomarkers:
        raise ValueError("No biomarkers could be extracted from the PDF.")
    
    # Step 3: Compare to reference ranges
    biomarkers_for_analysis = []
    for biomarker in all_biomarkers:
        ref = find_reference_range(biomarker.name)
        if ref:
            status = determine_status(biomarker.value, ref["low"], ref["high"])
            biomarkers_for_analysis.append({
                "name": biomarker.name,
                "value": biomarker.value,
                "unit": biomarker.unit,
                "reference_low": ref["low"],
                "reference_high": ref["high"],
                "status": status.value,
                "description": ref["description"]
            })
        else:
            # Unknown biomarker - include without reference
            biomarkers_for_analysis.append({
                "name": biomarker.name,
                "value": biomarker.value,
                "unit": biomarker.unit,
                "reference_low": None,
                "reference_high": None,
                "status": "unknown",
                "description": "Reference range not available"
            })
    
    # Step 4: Generate analysis via LLM
    logger.info("Generating analysis with LLM...")
    try:
        analysis = await analyze_biomarkers(biomarkers_for_analysis)
    except Exception as e:
        logger.error(f"LLM analysis failed or timed out: {e}")
        analysis = {
            "summary": "AI analysis could not be completed due to a service timeout. Please review the extracted biomarkers below.",
            "biomarker_explanations": [],
            "concerns": [],
            "recommendations": ["Consult with a healthcare provider regarding your results."]
        }
    
    # Step 5: Build final result
    explanation_map = {
        exp["name"].lower(): exp 
        for exp in analysis.get("biomarker_explanations", [])
    }
    
    final_biomarkers = []
    for b in biomarkers_for_analysis:
        exp = explanation_map.get(b["name"].lower(), {})
        
        # Handle unknown reference ranges
        ref_low = b["reference_low"] if b["reference_low"] is not None else 0
        ref_high = b["reference_high"] if b["reference_high"] is not None else 999
        status = BiomarkerStatus(b["status"]) if b["status"] != "unknown" else BiomarkerStatus.NORMAL
        
        final_biomarkers.append(Biomarker(
            name=b["name"].title(),
            value=b["value"],
            unit=b["unit"],
            reference_low=ref_low,
            reference_high=ref_high,
            status=status,
            explanation=exp.get("explanation", b["description"]),
            recommendation=exp.get("recommendation")
        ))
    
    # Extract concerns and ensure they're strings
    concerns = analysis.get("concerns", [])
    # Handle if LLM returned concerns as objects instead of strings
    if concerns and isinstance(concerns[0], dict):
        concerns = [c.get("name", str(c)) for c in concerns]

    return AnalysisResult(
        summary=analysis.get("summary", "Analysis complete. Review your results below."),
        biomarkers=final_biomarkers,
        concerns=concerns,
        recommendations=analysis.get("recommendations", []),
        disclaimer="This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider about any questions you may have regarding your health or medical results."
    )

