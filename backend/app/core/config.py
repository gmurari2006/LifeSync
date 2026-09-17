from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union
import json


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
        "https://life-sync-gmurari2006s-projects.vercel.app",
        "https://life-sync-git-master-gmurari2006s-projects.vercel.app",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        raise ValueError(v)
    
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
