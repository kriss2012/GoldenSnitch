# syntax=docker/dockerfile:1
# ==============================================================================
# Golden Snitch — Backend Production Dockerfile
# ==============================================================================

FROM python:3.12-slim AS runtime

# System environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000 \
    SCOUTGRID_DB=/app/data/scoutgrid.db

WORKDIR /app

# Install system dependencies (curl for healthchecks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -g 1001 scoutgrid && \
    useradd -u 1001 -g scoutgrid -s /bin/bash -m scoutgrid

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application code and seed data
COPY app/ ./app/
COPY pyproject.toml .

# Create persistent database directory and grant permissions to scoutgrid user
RUN mkdir -p /app/data && chown -R scoutgrid:scoutgrid /app

# Switch to non-root user
USER scoutgrid

EXPOSE 8000

# Docker Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production server command with 2 workers
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
