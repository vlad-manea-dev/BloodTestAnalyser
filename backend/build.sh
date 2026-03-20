#!/usr/bin/env bash
# Render build script: install system dependencies + Python packages
set -o errexit

apt-get update && apt-get install -y tesseract-ocr

pip install --upgrade pip
pip install -r requirements.txt
