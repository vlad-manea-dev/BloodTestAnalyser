"""LLM service for Groq API integration."""

import httpx
import json
import logging
import os
from pathlib import Path
from dotenv import load_dotenv

from app.models import ExtractedBiomarker

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Configurable Groq settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_TIMEOUT = float(os.getenv("GROQ_TIMEOUT", "60.0"))
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt(name: str) -> str:
    return (PROMPTS_DIR / f"{name}.txt").read_text()


async def query_llm(prompt: str, json_output: bool = False) -> str:
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }
    if json_output:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=GROQ_TIMEOUT) as client:
        try:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except httpx.ConnectError:
            raise ConnectionError(
                "Cannot connect to Groq API. Check your internet connection."
            )
        except httpx.TimeoutException:
            raise RuntimeError(
                f"Groq API request timed out after {GROQ_TIMEOUT}s."
            )
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Groq API request failed: {e.response.text}")


async def extract_biomarkers_llm(raw_text: str) -> list[ExtractedBiomarker]:
    """
    Use LLM to extract biomarkers from raw PDF text.
    Fallback when regex extraction is incomplete.
    """
    prompt_template = load_prompt("extraction_prompt")
    prompt = prompt_template.format(raw_text=raw_text[:8000])  # Limit context size

    response = await query_llm(prompt, json_output=True)

    try:
        data = json.loads(response)
        logger.info(f"LLM response:\n{data}")
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

    response = await query_llm(prompt, json_output=True)

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


async def check_llm_connection() -> bool:
    """Check if the Groq API is reachable and the API key is set."""
    if not GROQ_API_KEY:
        return False
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 1,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            return response.status_code == 200
    except Exception:
        return False
