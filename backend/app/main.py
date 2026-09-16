from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.api import api_router
from app.schemas.health import RootResponse, HealthResponse
from app.core.seed import init_db_and_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Initializes database tables and seeds demo data on startup.
    """
    try:
        init_db_and_seed()
    except Exception as e:
        print(f"Database startup initialization note: {e}")
    yield


# Initialize FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LifeSync AI-Assisted Pre-Hospital Emergency Coordination Platform API",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", response_model=RootResponse, summary="Root Service Identifier")
async def root() -> RootResponse:
    """
    LifeSync Service Identification Endpoint.
    """
    return RootResponse(
        message="LifeSync Emergency Coordination Backend is running.",
        platform="LifeSync",
        version=settings.VERSION,
        docs_url="/docs",
        health_url="/health",
    )

# Direct /health endpoint as required by root routing
@app.get("/health", response_model=HealthResponse, summary="System Health Status", tags=["Health"])
async def health_check() -> HealthResponse:
    """
    Root-level Health Check Endpoint for infrastructure probes and orchestrators.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )

# Include API v1 Router under /api/v1 prefix
app.include_router(api_router, prefix=settings.API_V1_STR)
