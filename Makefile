# ScoutIQ — AI Esports Scouting & Multi-Roster Intelligence Platform
# Master Makefile for Development, Testing, and Deployment

PYTHON ?= .venv/Scripts/python.exe
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
else
    DETECTED_OS := $(shell uname -s)
    PYTHON := .venv/bin/python
endif

.PHONY: help dev backend frontend test test-backend test-frontend lint build clean docker-up docker-down

help:
	@echo "ScoutIQ Platform Commands:"
	@echo "  make dev          - Start both backend and frontend development servers"
	@echo "  make backend      - Start FastAPI backend server (port 8000)"
	@echo "  make frontend     - Start Vite frontend dev server (port 5173)"
	@echo "  make test         - Run full test suite (backend pytest + frontend verification)"
	@echo "  make test-backend - Run backend pytest suite"
	@echo "  make lint         - Run ruff linter and type checks"
	@echo "  make build        - Build production bundle"
	@echo "  make docker-up    - Build and launch via Docker Compose"
	@echo "  make docker-down  - Stop Docker Compose services"
	@echo "  make clean        - Remove caches, temporary files, and test artifacts"

dev:
	@echo "Starting ScoutIQ Development Environment..."
	@python run.py

backend:
	@echo "Starting FastAPI Backend on http://localhost:8000..."
	@cd backend && $(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	@echo "Starting Frontend Dev Server on http://localhost:5173..."
	@cd frontend && npm run dev

test: test-backend test-frontend

test-backend:
	@echo "Running Pytest Suite..."
	@$(PYTHON) -m pytest backend/tests/ -v

test-frontend:
	@echo "Running Frontend Verification..."
	@node frontend/scripts/verify-frontend.js

lint:
	@echo "Running Ruff Linter..."
	@$(PYTHON) -m ruff check backend/app backend/tests
	@echo "Running TypeScript Verification..."
	@cd frontend && npx tsc --noEmit

build:
	@echo "Building Frontend Production Bundle..."
	@cd frontend && npm run build

docker-up:
	@docker compose up -d --build

docker-down:
	@docker compose down

clean:
	@echo "Cleaning caches and artifacts..."
	@rm -rf .pytest_cache .ruff_cache backend/.pytest_cache frontend/dist
