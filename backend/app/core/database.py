import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Generator
from app.core.config import settings

logger = logging.getLogger("lifesync.database")


def create_resilient_engine():
    """
    Creates SQLAlchemy engine with automatic fallback to local SQLite for frictionless local development
    and testing when a remote/local PostgreSQL server is not actively running.
    """
    db_url = settings.DATABASE_URL
    connect_args = {}

    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        return create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)

    try:
        # Test connecting to configured PostgreSQL database
        eng = create_engine(db_url, pool_pre_ping=True)
        with eng.connect():
            pass
        return eng
    except Exception as e:
        fallback_url = "sqlite:///./lifesync_dev.db"
        logger.warning(
            f"Configured PostgreSQL database at '{db_url}' is not currently accepting connections ({e}). "
            f"Activating resilient local fallback database at '{fallback_url}'."
        )
        return create_engine(fallback_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)


engine = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Automatically closes session upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
