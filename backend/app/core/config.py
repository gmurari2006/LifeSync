from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """
    LifeSync Core Application Settings.
    Loaded from environment variables with safe defaults for local development.
    """
    PROJECT_NAME: str = "LifeSync Backend"
    VERSION: str = "1.2.0-foundation"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "lifesync_dev_secret_key_change_in_production_32chars_min"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://lifesync:lifesync_dev_password@localhost:5432/lifesync_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
