"""Blood Test Summariser API - Main FastAPI Application."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import AnalysisResult
from app.services.analyzer import analyze_blood_test
from app.services.llm_service import check_ollama_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: Check Ollama connection
    logger.info("Checking Ollama connection...")
    if await check_ollama_connection():
        logger.info("✓ Ollama is running and model is available")
    else:
        logger.warning(
            "⚠ Ollama not detected. Make sure to run: "
            "1) `ollama serve` and 2) `ollama pull llama3.2:8b`"
        )
    yield
    # Shutdown: cleanup if needed
    logger.info("Shutting down...")


app = FastAPI(
    title="Blood Test Summariser",
    description="Upload blood test PDFs and receive AI-powered health summaries",
    version="1.0.0",
    lifespan=lifespan
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite/React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    ollama_ok = await check_ollama_connection()
    return {
        "status": "healthy",
        "ollama_connected": ollama_ok
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
    
    # Check Ollama is available
    if not await check_ollama_connection():
        raise HTTPException(
            status_code=503,
            detail="LLM service unavailable. Please ensure Ollama is running."
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