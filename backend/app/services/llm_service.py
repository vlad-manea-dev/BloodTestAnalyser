"""LLM service for Ollama integration."""

import httpx
import json
import logging
from pathlib import Path

from app.models import ExtractedBiomarker

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2"  
TIMEOUT = 300.0  

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt(name: str) -> str:
    return (PROMPTS_DIR / f"{name}.txt").read_text()


async def query_ollama(prompt: str, json_output: bool = False) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        payload = {
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
        }
        if json_output:
            payload["format"] = "json"
        
        try:
            response = await client.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            return response.json()["response"]
        except httpx.ConnectError:
            raise ConnectionError(
                "Cannot connect to Ollama. Make sure Ollama is running: `ollama serve`"
            )
        except httpx.TimeoutException:
            raise RuntimeError(
                "Ollama request timed out. The model is taking too long to respond."
            )
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama request failed: {e.response.text}")


async def extract_biomarkers_llm(raw_text: str) -> list[ExtractedBiomarker]:
    """
    Use LLM to extract biomarkers from raw PDF text.
    Fallback when regex extraction is incomplete.
    """
    prompt_template = load_prompt("extraction_prompt")
    prompt = prompt_template.format(raw_text=raw_text[:8000])  # Limit context size
    
    response = await query_ollama(prompt, json_output=True)
    
    try:
        data = json.loads(response)
        biomarkers = []
        for item in data.get("biomarkers", []):
            biomarkers.append(ExtractedBiomarker(
                name=item["name"].lower(),
                value=float(item["value"]),
                unit=item["unit"]
            ))
        return biomarkers
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error(f"Failed to parse LLM extraction response: {e}")
        return []


async def analyze_biomarkers(biomarkers_for_analysis: list[dict]) -> dict:
    """
    Generate health analysis from biomarkers using LLM.
    
    Args:
        biomarkers_for_analysis: List of dicts with name, value, unit, status, reference range
    
    Returns:
        Dict with summary, biomarker_explanations, concerns, recommendations
    """
    prompt_template = load_prompt("analysis_prompt")
    biomarkers_json = json.dumps(biomarkers_for_analysis, indent=2)
    prompt = prompt_template.format(biomarkers_json=biomarkers_json)
    
    response = await query_ollama(prompt, json_output=True)
    
    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM analysis response: {e}")
        # Return a fallback response
        return {
            "summary": "Analysis could not be completed. Please review your results with a healthcare provider.",
            "biomarker_explanations": [],
            "concerns": [],
            "recommendations": ["Consult with your healthcare provider to discuss these results."]
        }


async def check_ollama_connection() -> bool:
    """Check if Ollama is running and the model is available."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                # Check if our model (or a variant) is available
                return any(MODEL.split(":")[0] in name for name in model_names)
        return False
    except Exception:
        return False