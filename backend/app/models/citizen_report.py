from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid, utc_now


class CitizenReport(Base, TimestampMixin):
    """
    Observational emergency report submitted by an on-scene bystander or citizen.
    Stored with strict provenance (source: CITIZEN_REPORTED).
    """
    __tablename__ = "citizen_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="CASCADE"), nullable=False, index=True)

    incident_category = Column(String(128), nullable=False)
    people_count = Column(Integer, default=1, nullable=False)  # Strictly Integer

    has_unconscious = Column(String(32), default="No", nullable=False)  # Yes, No, Not Sure
    is_awake = Column(String(32), default="Yes", nullable=False)         # Yes, No, Not Sure
    is_breathing = Column(String(32), default="Yes", nullable=False)     # Yes, No, Not Sure

    visible_concerns = Column(JSON, default=list, nullable=False)  # List of observational tags

    location_address = Column(String(255), nullable=False)
    location_landmark = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    additional_notes = Column(Text, nullable=True)
    source = Column(String(32), default="CITIZEN_REPORTED", nullable=False)
    reported_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    case = relationship("EmergencyCase", back_populates="citizen_reports")
    ai_reports = relationship("AIStructuredReport", back_populates="citizen_report", cascade="all, delete-orphan")
