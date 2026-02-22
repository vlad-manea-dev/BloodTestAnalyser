import json
import logging
from pathlib import Path
from rapidfuzz import process, utils, fuzz

from app.models import (
    AnalysisResult,
    Biomarker,
    BiomarkerStatus,
    ExtractedBiomarker,
)
from app.services.pdf_parser import extract_text_from_pdf, extract_biomarkers_regex, normalize_unit
from app.services.llm_service import extract_biomarkers_llm, analyze_biomarkers
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

ENABLE_REGEX_EXTRACTION = os.getenv("ENABLE_REGEX_EXTRACTION", "false").lower() == "true"

DATA_DIR = Path(__file__).parent.parent / "data"
REFERENCE_RANGES = json.loads((DATA_DIR / "reference_ranges.json").read_text())

# Pre-compute search map for faster lookups and better fuzzy matching
def _build_search_map():
    mapping = {}
    for key, ref in REFERENCE_RANGES.items():
        # Clean the primary key
        clean_key = utils.default_process(key)
        if clean_key:
            mapping[clean_key] = key
        
        # Clean and add all aliases
        for alias in ref.get("aliases", []):
            clean_alias = utils.default_process(alias)
            if clean_alias:
                mapping[clean_alias] = key
    return mapping

SEARCH_MAP = _build_search_map()
SEARCH_CHOICES = list(SEARCH_MAP.keys())

def find_reference_range(biomarker_name: str) -> dict | None:
    name_clean = utils.default_process(biomarker_name)
    if not name_clean:
        return None

    # 1. Direct match on processed names for speed
    if name_clean in SEARCH_MAP:
        return _get_ref_data(SEARCH_MAP[name_clean])

    # 2. Fuzzy match using WRatio (better for varying word orders and partial matches)
    match = process.extractOne(
        name_clean, 
        SEARCH_CHOICES, 
        scorer=fuzz.WRatio, 
        score_cutoff=85
    )
    
    if match:
        best_match_key, score, _ = match
        original_key = SEARCH_MAP[best_match_key]
        logger.info(f"Fuzzy matched '{biomarker_name}' to '{original_key}' (score: {score:.1f})")
        return _get_ref_data(original_key)

    return None

def _get_ref_data(key: str) -> dict:
    ref = REFERENCE_RANGES[key]
    ranges = ref["ranges"].get("default", list(ref["ranges"].values())[0])
    return {
        "low": ranges["low"],
        "high": ranges["high"],
        "unit": ref["unit"],
        "description": ref["description"]
    }

def determine_status(value: float, ref_low: float, ref_high: float) -> BiomarkerStatus:
    if value < ref_low:
        return BiomarkerStatus.LOW
    elif value > ref_high:
        return BiomarkerStatus.HIGH
    return BiomarkerStatus.NORMAL

def merge_biomarkers(regex_results: list[ExtractedBiomarker], llm_results: list[ExtractedBiomarker]) -> list[ExtractedBiomarker]:
    merged = list(regex_results)
    
    for llm_b in llm_results:
        llm_name_clean = utils.default_process(llm_b.name)
        if not llm_name_clean:
            continue
            
        # Check for fuzzy match in already merged biomarkers
        is_duplicate = False
        for existing_b in merged:
            existing_name_clean = utils.default_process(existing_b.name)
            if existing_name_clean == llm_name_clean:
                is_duplicate = True
                break
            
            # Fuzzy check for very similar names
            score = fuzz.ratio(existing_name_clean, llm_name_clean)
            if score >= 90:
                is_duplicate = True
                break
        
        if not is_duplicate:
            merged.append(llm_b)
    
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
    if ENABLE_REGEX_EXTRACTION:
        logger.info("Extracting biomarkers with regex...")
        regex_biomarkers = extract_biomarkers_regex(raw_text)
        logger.info(f"Regex found {len(regex_biomarkers)} biomarkers")
    else:
        logger.info("Regex extraction disabled, skipping...")
        regex_biomarkers = []
    
    # Use LLM for additional extraction
    logger.info("Using LLM for comprehensive extraction...")
    try:
        llm_biomarkers = await extract_biomarkers_llm(raw_text)
        # Normalize units for LLM results
        for b in llm_biomarkers:
            b.unit = normalize_unit(b.unit)
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
            value = biomarker.value
            # Basic unit conversion (e.g., g/L to g/dL for hemoglobin/protein)
            if biomarker.unit == "g/L" and ref["unit"] == "g/dL":
                value = value / 10.0
            elif biomarker.unit == "g/dL" and ref["unit"] == "g/L":
                value = value * 10.0
                
            status = determine_status(value, ref["low"], ref["high"])
            biomarkers_for_analysis.append({
                "name": biomarker.name,
                "value": value,
                "unit": ref["unit"],
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
    # Use fuzzy matching to map explanations back to biomarkers
    explanation_list = analysis.get("biomarker_explanations", [])
    explanation_names = [utils.default_process(exp["name"]) for exp in explanation_list]
    
    final_biomarkers = []
    for b in biomarkers_for_analysis:
        b_name_clean = utils.default_process(b["name"])
        exp = {}
        
        # Try exact match first
        if b_name_clean in explanation_names:
            idx = explanation_names.index(b_name_clean)
            exp = explanation_list[idx]
        else:
            # Fuzzy match
            match = process.extractOne(b_name_clean, explanation_names, score_cutoff=85)
            if match:
                _, _, idx = match
                exp = explanation_list[idx]
        
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

