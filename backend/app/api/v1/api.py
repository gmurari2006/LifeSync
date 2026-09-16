from fastapi import APIRouter
from app.api.v1.endpoints import health, cases, citizen, ems, hospitals, readiness, ai, hospital_matching
from app.simulation import simulation_router

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(cases.router, prefix="/cases", tags=["Emergency Cases"])
api_router.include_router(citizen.router, prefix="/citizen", tags=["Citizen Portal"])
api_router.include_router(ems.router, prefix="/ems", tags=["EMS Portal"])
api_router.include_router(hospitals.router, prefix="/hospitals", tags=["Hospital Portal"])
api_router.include_router(readiness.router, prefix="/hospitals", tags=["Hospital Readiness"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Structuring Layer"])
api_router.include_router(hospital_matching.router, prefix="/hospital-matching", tags=["Hospital Matching & Diversion"])
api_router.include_router(simulation_router, prefix="/simulation", tags=["Ambulance Telemetry Simulation"])
