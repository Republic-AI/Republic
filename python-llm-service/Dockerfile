FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    git

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Add src directory to Python path
ENV PYTHONPATH=/app/src

# Set environment variables
ENV OPENAI_API_KEY=""

# Run the application
CMD ["python", "main.py"]
