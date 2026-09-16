from pydantic import BaseModel, Field
from datetime import datetime


class HealthResponse(BaseModel):
    """
    Health check response model for LifeSync system.
    """
    status: str = Field(default="healthy", description="System operational status")
    timestamp: datetime = Field(description="Current server UTC timestamp")
    version: str = Field(description="LifeSync platform version")
    environment: str = Field(description="Active runtime environment")


class RootResponse(BaseModel):
    """
    Root endpoint response model identifying the LifeSync backend.
    """
    message: str = Field(description="Welcome/identification message")
    platform: str = Field(description="Platform name")
    version: str = Field(description="Platform version")
    docs_url: str = Field(description="Interactive OpenAPI documentation URL")
    health_url: str = Field(description="System health check endpoint")
