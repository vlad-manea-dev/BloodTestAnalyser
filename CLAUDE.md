# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BloodFlow is an AI-powered blood test analyser. Users upload PDF blood test reports; the system extracts biomarkers, compares them to reference ranges, and generates health summaries using the Groq API (LLM). The frontend is deployed on Vercel and the backend on Render.

## Commands

### Frontend (from `frontend/`)
```bash
npm run dev       # Dev server on localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

### Backend (from `backend/`)
```bash
python run.py     # FastAPI server on localhost:8000 (uses uvicorn)
pip install -r requirements.txt
```

### Prerequisites
- Groq API key (free at https://console.groq.com/) set as `GROQ_API_KEY` env var
- Python virtual env: `python -m venv venv && source venv/bin/activate`

## Architecture

**Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 (deployed on Vercel)

**Backend**: FastAPI + PyMuPDF + RapidFuzz + Groq API (llama-3.2-3b-preview) (deployed on Render)

### Analysis Pipeline (backend)
1. **PDF parsing** (`services/pdf_parser.py`): PyMuPDF extracts text, regex patterns find biomarkers
2. **LLM extraction** (`services/llm_service.py`): Groq API extracts biomarkers the regex missed, using prompt from `prompts/extraction_prompt.txt`
3. **Orchestration** (`services/analyzer.py`): Merges regex + LLM results via RapidFuzz fuzzy matching (85% cutoff), looks up reference ranges from `data/reference_ranges.json` (supports gender-specific ranges and aliases), then sends to LLM for analysis using `prompts/analysis_prompt.txt`
4. **Response**: Returns summary, biomarker details with status (normal/low/high/critical), concerns, and recommendations

### API Endpoints
- `GET /health` — health check (includes LLM connection status)
- `POST /analyze` — accepts PDF upload, returns full analysis result

### Frontend Routes
- `/` — landing page
- `/analyse` — main upload + results page (`/analyze` redirects here)
- `/learn-more`, `/about` — informational pages

### Key Data Models (`app/models.py`)
- `Biomarker`: name, value, unit, reference range, status enum, explanation
- `AnalysisResult`: summary, biomarkers list, concerns, recommendations, disclaimer

## Conventions

- British spelling for user-facing routes and text ("analyse" not "analyze")
- Backend env config via `.env` file (GROQ_API_KEY, GROQ_MODEL, GROQ_TIMEOUT, CORS_ORIGINS)
- Frontend env: `NEXT_PUBLIC_API_URL` (defaults to `http://127.0.0.1:8000`)
- Frontend path alias: `@/*` maps to `./src/*`
- Ports: frontend 3000, backend 8000

## Deployment

- **Frontend**: Vercel — set `NEXT_PUBLIC_API_URL` to the Render backend URL
- **Backend**: Render — set `GROQ_API_KEY`, `GROQ_MODEL`, and `CORS_ORIGINS` (Vercel domain)
- Render sets `PORT` automatically; `run.py` reads it with fallback to 8000
