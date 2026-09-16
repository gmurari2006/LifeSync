# LifeSync: AI-Powered Pre-Hospital Emergency Coordination & Hospital Readiness Platform

> **Core Principle:**  
> *"Critical emergency information should reach the hospital before the patient does."*

---

## 1. Overview

**LifeSync** is an AI-assisted pre-hospital emergency coordination and operational decision-support platform. It synchronizes critical emergency data across the incident scene, responding Emergency Medical Services (EMS) / ambulance units, and receiving hospital Emergency Departments (EDs) during the "Golden Hour" of acute emergency care.

---

## 2. Safety Governance & Clinical Boundary

LifeSync is designed strictly as an **AI-assisted operational coordination, data structuring, and resource readiness tool**.

### What LifeSync is NOT:
- **NOT an autonomous diagnostic system:** LifeSync does not provide clinical diagnoses.
- **NOT an autonomous treatment or prescription system:** It does not prescribe medications or medical interventions.
- **NOT a replacement for certified medical professionals:** All clinical evaluations, triage decisions, and medical care pathways remain the strict responsibility of certified physicians, paramedics, and emergency nurses.
- **NOT connected to real municipal emergency services in this MVP:** The platform operates in a closed demonstration sandbox using simulated telemetry and synthetic clinical data.

---

## 3. Architecture Overview & Step 1 Scope

LifeSync is engineered as a **modular monolith** to maintain high developer velocity and straightforward state synchronization across services.

### Future Three-Portal Topology:
1. **Citizen / Bystander Portal:** Multimodal emergency intake (voice/text/category) with GPS location.
2. **EMS / Paramedic Portal:** In-cab navigation, on-scene clinical vitals entry, and real-time telemetry.
3. **Hospital Emergency Readiness Portal:** Real-time incoming case queue, structured pre-arrival handoffs, 1-click bay allocation, and diversion management.

### Current Step 1 Scope (Foundation Only):
- Foundation directory hierarchy and modular monolith skeleton.
- Minimal FastAPI backend with root (`GET /`) and health (`GET /health`) endpoints.
- Minimal Next.js + React + TypeScript + Tailwind CSS frontend landing view.
- PostgreSQL + PostGIS (v16) and Redis (v7) services configured via Docker Compose.
- Automated testing harness for backend endpoints.
- Environment configuration templates and repository standards.

---

## 4. Technology Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, Uvicorn
- **Database:** PostgreSQL 16 with PostGIS spatial extensions
- **Caching & State:** Redis 7
- **Development Environment:** Docker & Docker Compose

---

## 5. Project Structure

```
LifeSync/
├── frontend/                # Next.js frontend application
│   ├── src/
│   │   └── app/             # App router pages, layouts, and styles
│   ├── package.json         # Node dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration
│   ├── tailwind.config.ts   # Tailwind CSS design system
│   └── README.md
├── backend/                 # FastAPI backend service
│   ├── app/
│   │   ├── main.py          # FastAPI application entrypoint
│   │   ├── core/            # Config, security, constants
│   │   ├── api/             # API route controllers (v1)
│   │   ├── models/          # Database persistence models (placeholder)
│   │   ├── schemas/         # Pydantic schemas and contracts
│   │   ├── services/        # Business logic & AI orchestration (placeholder)
│   │   └── utils/           # Shared helper functions
│   ├── tests/               # Pytest automated test suite
│   ├── requirements.txt     # Python backend dependencies
│   └── README.md
├── database/                # Database configuration & scripts
│   └── init/
│       └── 01_init.sql      # PostGIS extension initialization
├── docs/                    # Architecture documentation & PRD
│   └── ARCHITECTURE.md
├── .env.example             # Environment variable template
├── .gitignore               # Multi-layer git ignore rules
├── docker-compose.yml       # PostgreSQL (PostGIS) & Redis services
└── README.md                # Root project documentation
```

---

## 6. Local Setup & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.18+ or v20+)
- [Python](https://www.python.org/) (v3.11+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL and Redis)

---

### Step A: Configure Environment

Copy `.env.example` to `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

---

### Step B: Start Database (PostgreSQL + PostGIS) & Redis

Launch the containerized infrastructure services:

```bash
docker compose up -d
```

Verify running containers:

```bash
docker compose ps
```

---

### Step C: Start Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### Step D: Start Frontend (Next.js)

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Health Check & Verification Commands

### Check Backend Endpoints

```bash
# Root identifier endpoint
curl http://localhost:8000/

# System health endpoint
curl http://localhost:8000/health
```

Expected `/health` response:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-16T10:30:00Z",
  "version": "1.2.0-foundation",
  "environment": "development"
}
```

### Run Automated Backend Tests

```bash
cd backend
pytest
```

---

## 8. Synthetic Data Notice

> [!NOTE]
> All patient records, hospital facility coordinates, vitals telemetry, and scenario cases used within LifeSync are **100% synthetic**. No real Protected Health Information (PHI) or live municipal dispatch feeds are processed.
