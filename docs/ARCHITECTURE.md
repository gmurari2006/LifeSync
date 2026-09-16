# LifeSync Architecture Blueprint

## System Overview

**LifeSync** is an AI-assisted pre-hospital emergency coordination and hospital readiness platform. It bridges the critical data and operational gap between emergency scenes, ambulance responders (EMS), and receiving hospital Emergency Departments (EDs).

## Core Principle

> **"Critical emergency information should reach the hospital before the patient does."**

## Architectural Topology

LifeSync is built as a **modular monolith** with the following structural layout:

```
LifeSync/
├── frontend/                # Next.js App Router (TypeScript + Tailwind CSS)
│   ├── src/app/             # Portal views & landing pages
│   └── public/              # Static assets
├── backend/                 # FastAPI Python Application
│   ├── app/
│   │   ├── main.py          # Entrypoint & FastAPI setup
│   │   ├── core/            # Config, security, constants
│   │   ├── api/             # API v1 route controllers
│   │   ├── models/          # Database ORM entities
│   │   ├── schemas/         # Pydantic data contracts
│   │   ├── services/        # Business logic & AI pipelines
│   │   └── utils/           # Shared helper functions
│   └── tests/               # Pytest suite
├── database/                # Database migrations & schemas
│   └── init/                # PostgreSQL + PostGIS initialization scripts
└── docs/                    # Technical documentation & PRD
```

## Three-Portal Topology (Future Modules)

1. **Citizen / Bystander Portal:** Multimodal emergency intake (voice/text/category) with GPS location.
2. **EMS / Paramedic Portal:** In-cab navigation, on-scene clinical vitals entry, and real-time telemetry.
3. **Hospital Emergency Readiness Portal:** Incoming emergency queue, pre-arrival handoffs, 1-click bay allocation, and diversion workflows.

## Safety & Governance Boundary

LifeSync is an **AI-assisted operational readiness and data structuring tool**, NOT an autonomous medical diagnostic device or treatment prescription system. All medical determinations remain strictly with certified human clinical professionals.
