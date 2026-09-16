from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="System Health Check")
async def health_check() -> HealthResponse:
    """
    LifeSync Foundation Health Check Endpoint.
    Returns status, server timestamp, platform version, and environment.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )
