# syntax=docker/dockerfile:1
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV or pip dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir fastapi uvicorn pydantic pyjwt cryptography

# Copy backend source and seed data
COPY app/ ./app/
COPY data/ ./data/

# Persistent SQLite directory
RUN mkdir -p /app/data

ENV PYTHONUNBUFFERED=1
ENV SCOUTGRID_DB=/app/data/scoutgrid.db
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
