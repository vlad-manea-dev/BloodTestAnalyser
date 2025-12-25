import fitz
import re 
from app.models import ExtractedBiomarker

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def extract_biomarkers_regex(text: str) -> list[ExtractedBiomarker]:
    biomarkers = []
    
    # Common patterns found in blood test reports
    patterns = [
        # Hemoglobin variants
        (r"(?:Hemoglobin|HGB|Hgb|Hb)\s*[:\-]?\s*(\d+\.?\d*)\s*(g/dL|g/L)", "hemoglobin"),
        # Hematocrit
        (r"(?:Hematocrit|HCT|Hct)\s*[:\-]?\s*(\d+\.?\d*)\s*(%)", "hematocrit"),
        # WBC
        (r"(?:White Blood Cell|WBC|Leukocytes)\s*[:\-]?\s*(\d+\.?\d*)\s*(x10\^9/L|K/uL|x10E9/L|thou/uL)", "white blood cell"),
        # RBC
        (r"(?:Red Blood Cell|RBC|Erythrocytes)\s*[:\-]?\s*(\d+\.?\d*)\s*(x10\^12/L|M/uL|x10E12/L|mil/uL)", "red blood cell"),
        # Platelets
        (r"(?:Platelet|PLT|Thrombocytes)\s*[:\-]?\s*(\d+\.?\d*)\s*(x10\^9/L|K/uL|x10E9/L|thou/uL)", "platelet"),
        # Glucose
        (r"(?:Glucose|Blood Sugar|Fasting Glucose)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|mmol/L)", "glucose"),
        # Cholesterol
        (r"(?:Total Cholesterol|Cholesterol)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|mmol/L)", "cholesterol"),
        # LDL
        (r"(?:LDL|LDL Cholesterol|LDL-C)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|mmol/L)", "ldl cholesterol"),
        # HDL
        (r"(?:HDL|HDL Cholesterol|HDL-C)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|mmol/L)", "hdl cholesterol"),
        # Triglycerides
        (r"(?:Triglycerides|TG|Trigs)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|mmol/L)", "triglycerides"),
        # Creatinine
        (r"(?:Creatinine|Creat)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|umol/L)", "creatinine"),
        # BUN
        (r"(?:BUN|Blood Urea Nitrogen|Urea)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|mmol/L)", "blood urea nitrogen"),
        # Sodium
        (r"(?:Sodium|Na)\s*[:\-]?\s*(\d+\.?\d*)\s*(mEq/L|mmol/L)", "sodium"),
        # Potassium
        (r"(?:Potassium|K)\s*[:\-]?\s*(\d+\.?\d*)\s*(mEq/L|mmol/L)", "potassium"),
        # Iron
        (r"(?:Iron|Fe|Serum Iron)\s*[:\-]?\s*(\d+\.?\d*)\s*(mcg/dL|ug/dL|umol/L)", "iron"),
        # Ferritin
        (r"(?:Ferritin)\s*[:\-]?\s*(\d+\.?\d*)\s*(ng/mL|ug/L|pmol/L)", "ferritin"),
        # Vitamin D
        (r"(?:Vitamin D|25-OH|25-Hydroxy)\s*[:\-]?\s*(\d+\.?\d*)\s*(ng/mL|nmol/L)", "vitamin d"),
        # TSH
        (r"(?:TSH|Thyroid Stimulating)\s*[:\-]?\s*(\d+\.?\d*)\s*(mIU/L|uIU/mL)", "thyroid stimulating hormone"),
        # ALT
        (r"(?:ALT|SGPT|Alanine Aminotransferase)\s*[:\-]?\s*(\d+\.?\d*)\s*(U/L|IU/L)", "alanine aminotransferase"),
        # AST
        (r"(?:AST|SGOT|Aspartate Aminotransferase)\s*[:\-]?\s*(\d+\.?\d*)\s*(U/L|IU/L)", "aspartate aminotransferase"),
        # HbA1c
        (r"(?:HbA1c|A1C|Hemoglobin A1c|Glycated)\s*[:\-]?\s*(\d+\.?\d*)\s*(%)", "hemoglobin a1c"),
        # Calcium
        (r"(?:Calcium|Ca)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg/dL|mmol/L)", "calcium"),
        # B12
        (r"(?:Vitamin B12|B12|Cobalamin)\s*[:\-]?\s*(\d+\.?\d*)\s*(pg/mL|pmol/L)", "vitamin b12"),
    ]
    
    for pattern, name in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value_str, unit = match.groups()
            try:
                value = float(value_str)
                biomarkers.append(ExtractedBiomarker(name=name, value=value, unit=unit))
            except ValueError:
                continue
    
    return biomarkers


def normalize_unit(unit: str) -> str:
    unit_map = {
        "g/l": "g/dL",  # Convert if needed
        "k/ul": "x10^9/L",
        "thou/ul": "x10^9/L",
        "m/ul": "x10^12/L",
        "mil/ul": "x10^12/L",
        "uiu/ml": "mIU/L",
        "iu/l": "U/L",
    }
    return unit_map.get(unit.lower(), unit)