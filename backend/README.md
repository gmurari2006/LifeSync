# LifeSync Backend Service

FastAPI-based backend foundation for the LifeSync AI-assisted emergency coordination platform.

## Architecture Overview

The backend follows a **modular monolith** structure:

```
backend/
├── app/
│   ├── main.py               # Application entrypoint & middleware
│   ├── core/                 # Configuration & core settings
│   ├── api/                  # API routers (v1 endpoints)
│   ├── models/               # Database ORM models (placeholder)
│   ├── schemas/              # Pydantic data schemas
│   ├── services/             # Business logic & subsystems (placeholder)
│   └── utils/                # Helper utilities (placeholder)
├── tests/                    # Pytest test suite
├── requirements.txt          # Python dependencies
└── README.md                 # Backend documentation
```

## Setup & Local Run Instructions

### 1. Create and Activate Virtual Environment

```bash
# Windows PowerShell
python -m venv .venv
.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run FastAPI Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The server will be available at:
- Root API: `http://localhost:8000/`
- Health Check: `http://localhost:8000/health`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`
- ReDoc Docs: `http://localhost:8000/redoc`

### 4. Run Tests

```bash
pytest
```
