FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Set environment variables
ENV PORT=8080

# Command to run uvicorn
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
