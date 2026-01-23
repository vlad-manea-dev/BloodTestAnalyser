# Blood Test Analyser

This project is a Python-based backend service that provides AI-powered analysis of blood test reports. Users can upload a PDF of their blood test results, and the system will extract key biomarkers, compare them to standard reference ranges, and generate a personalized health summary with explanations and recommendations.

The analysis is performed by a Large Language Model (LLM) to provide human-friendly insights, but it is **for informational purposes only** and is not a substitute for professional medical advice.

## Features

-   **PDF Upload**: Accepts blood test reports in PDF format.
-   **Text Extraction**: Parses text from PDFs to identify health data.
-   **Hybrid Biomarker Extraction**: Uses a combination of regular expressions for speed and an LLM for comprehensive data extraction.
-   **Automated Analysis**: Compares extracted values against a configurable list of reference ranges.
-   **AI-Powered Summaries**: Utilizes an LLM to generate:
    -   A high-level summary.
    -   Explanations for each biomarker.
    -   A list of potential health concerns.
    -   Actionable lifestyle recommendations.
-   **API Interface**: Built with FastAPI, providing a clean and documented API.

## How It Works

The application follows a multi-step process to analyze a blood test PDF:

1.  **Upload**: The user POSTs a PDF file to the `/analyze` endpoint.
2.  **Text Extraction**: The service uses `PyMuPDF` to extract all text from the PDF.
3.  **Biomarker Identification**:
    -   A primary pass uses regular expressions (`regex`) to quickly find common biomarkers (e.g., Hemoglobin, Glucose).
    -   A secondary pass sends the raw text to an LLM, which performs a more advanced extraction to find biomarkers the regex might have missed.
4.  **Data Merging**: The results from the regex and LLM extractions are merged to create a comprehensive list of biomarkers.
5.  **Reference Range Comparison**: Each biomarker's value is compared against the `reference_ranges.json` data file to determine if the result is `low`, `normal`, or `high`.
6.  **AI Analysis**: The structured list of biomarkers (including their status) is sent to the LLM with a detailed prompt (`analysis_prompt.txt`). The LLM is instructed to generate a summary, explanations, and recommendations.
7.  **Response**: The final analysis is packaged into a JSON object and returned to the user.

## Technology Stack

-   **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/)
-   **LLM Integration**: The application is designed to work with a local [Ollama](https://ollama.ai/) instance. It uses the `llama3.2` model by default.
-   **PDF Parsing**: [PyMuPDF](https://github.com/pymupdf/PyMuPDF)
-   **Data Validation**: [Pydantic](https://docs.pydantic.dev/latest/)
-   **Web Server**: [Uvicorn](https://www.uvicorn.org/)

## Project Structure

```
backend/
├── app/
│   ├── data/
│   │   └── reference_ranges.json   # Configurable biomarker reference ranges
│   ├── prompts/
│   │   ├── analysis_prompt.txt     # Prompt for the main health analysis
│   │   └── extraction_prompt.txt   # Prompt for LLM-based data extraction
│   ├── services/
│   │   ├── analyzer.py             # Main analysis orchestrator
│   │   ├── llm_service.py          # Handles all communication with Ollama
│   │   └── pdf_parser.py           # Extracts text and biomarkers from PDFs
│   ├── main.py                     # FastAPI application, endpoints
│   └── models.py                   # Pydantic data models
├── requirements.txt                # Python dependencies
└── run.py                          # Application entry point
```

## Setup and Installation

### 1. Prerequisites

-   Python 3.10+
-   [Ollama](https://ollama.ai/) installed and running.

### 2. Install Ollama Model

You must have the LLM model available for the service to work. Pull the default model by running:

```bash
ollama pull llama3.2
```

### 3. Install Python Dependencies

Navigate to the `backend` directory and install the required packages.

```bash
cd backend
pip install -r requirements.txt
```

## How to Run

### 1. Start the Ollama Service

Ensure the Ollama server is running in the background. You can start it by simply running `ollama serve` in your terminal.

```bash
ollama serve
```

### 2. Start the Backend Application

Once the dependencies are installed and Ollama is running, start the FastAPI application:

```bash
python run.py
```

The API will be available at `http://localhost:8000`.

### 3. API Documentation

Once the server is running, you can access the interactive API documentation (provided by Swagger UI) at:

[http://localhost:8000/docs](http://localhost:8000/docs)

## API Endpoints

-   `GET /health`: Health check endpoint to verify that the service is running and can connect to Ollama.
-   `POST /analyze`: The main endpoint for uploading a blood test PDF.
    -   **Body**: `multipart/form-data` with a `file` field containing the PDF.

## Testing

A debug script is available at `backend/debug_test.py` to quickly test the full analysis pipeline on a local PDF file.

1.  Modify the `pdf_path` variable in the script to point to your sample PDF.
2.  Run the script from the project root directory:

```bash
python backend/debug_test.py
```
