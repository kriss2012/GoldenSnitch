"""Root entrypoint for Railpack / PaaS builders (Railway, Render, Fly.io).
Exposes the FastAPI application and supports direct execution.
"""
import os
import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port)
