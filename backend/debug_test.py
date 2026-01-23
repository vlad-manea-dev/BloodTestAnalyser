"""Debug script to test PDF analysis"""
import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.analyzer import analyze_blood_test

async def test_pdf():
    pdf_path = "/Users/vladmanea/Downloads/sample_blood_test.pdf"

    print(f"Reading PDF: {pdf_path}")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    print(f"PDF size: {len(pdf_bytes)} bytes")

    try:
        print("Starting analysis...")
        result = await analyze_blood_test(pdf_bytes)
        print("✓ Analysis successful!")
        print(f"Summary: {result.summary}")
        print(f"Biomarkers found: {len(result.biomarkers)}")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_pdf())