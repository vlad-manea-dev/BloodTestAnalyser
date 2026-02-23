"""Blood Test Summariser API - Main FastAPI Application."""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import AnalysisResult
from app.services.analyzer import analyze_blood_test
from app.services.llm_service import check_llm_connection

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Checking LLM connection...")
    if await check_llm_connection():
        logger.info("✓ Groq API is reachable and ready")
    else:
        logger.warning(
            "⚠ Groq API not reachable. Make sure GROQ_API_KEY is set."
        )
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Blood Test Summariser",
    description="Upload blood test PDFs and receive AI-powered health summaries",
    version="1.0.0",
    lifespan=lifespan
)

# CORS for frontend
cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
cors_origins += [
    "https://bloodflow.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    llm_ok = await check_llm_connection()
    return {
        "status": "healthy",
        "llm_connected": llm_ok
    }


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_pdf(file: UploadFile = File(...)):
    """
    Upload a blood test PDF and receive a comprehensive analysis.

    Returns biomarker values, status (normal/high/low), explanations,
    and health recommendations.
    """
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    # Validate file size (max 10MB)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )

    # Check LLM is available
    if not await check_llm_connection():
        raise HTTPException(
            status_code=503,
            detail="LLM service unavailable. Please check the GROQ_API_KEY configuration."
        )

    try:
        logger.info(f"Processing file: {file.filename}")
        result = await analyze_blood_test(contents)
        logger.info("Analysis complete")
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during analysis")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during analysis"
        )


@app.get("/")
async def root():
    """API info."""
    return {
        "name": "Blood Test Summariser API",
        "version": "1.0.0",
        "docs": "/docs",
        "usage": "POST a PDF to /analyze"
    }
