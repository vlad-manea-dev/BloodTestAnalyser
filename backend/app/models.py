from pydantic import BaseModel, Field
from enum import Enum

class BiomarkerStatus(str, Enum):
    LOW = "low"
    HIGH = "high"
    CRITICAL = "critical"
    NORMAL = "normal"

class Biomarker(BaseModel):
    name: str
    value: float
    unit: str
    reference_low: float
    reference_high: float
    status: BiomarkerStatus
    explanation: str
    recommendation: str | None

class AnalysisResult(BaseModel):
    summary: str
    biomarkers: list[Biomarker]
    concerns: list[str]
    recommendations: list[str]
    disclaimer: str

class ExtractedBiomarker(BaseModel):
    name: str
    value: float
    unit: str

class ExtractionResult(BaseModel):
    biomarkers: list[ExtractedBiomarker]
    raw_text: str = ""