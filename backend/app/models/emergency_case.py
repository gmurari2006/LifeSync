import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid, utc_now


class EmergencyCase(Base, TimestampMixin):
    """
    Central emergency case entity representing a single pre-hospital emergency lifecycle.
    """
    __tablename__ = "emergency_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(32), unique=True, index=True, nullable=False)  # Human readable: LS-2026-001
    incident_type = Column(String(128), nullable=False)
    operational_priority = Column(String(32), default="HIGH", nullable=False)  # CRITICAL, HIGH, MODERATE, LOW
    status = Column(String(48), default="REPORTED", nullable=False, index=True)

    patient_count = Column(Integer, default=1, nullable=False)
    patient_age = Column(Integer, nullable=True)
    patient_sex = Column(String(16), nullable=True)  # Male, Female, Unknown

    reported_location = Column(String(255), nullable=False)
    landmark = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    destination_hospital_id = Column(String(64), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    assigned_unit_id = Column(String(32), nullable=True)
    assigned_bay = Column(String(128), nullable=True)
    acknowledged_state = Column(String(32), default=None, nullable=True)  # PENDING, ACKNOWLEDGED, DIVERTED

    time_reported = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    time_alerted = Column(DateTime(timezone=True), nullable=True)
    time_acknowledged = Column(DateTime(timezone=True), nullable=True)
    time_arrived = Column(DateTime(timezone=True), nullable=True)
    time_closed = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    citizen_reports = relationship("CitizenReport", back_populates="case", cascade="all, delete-orphan")
    ai_reports = relationship("AIStructuredReport", back_populates="case", cascade="all, delete-orphan")
    ems_verifications = relationship("EMSVerification", back_populates="case", cascade="all, delete-orphan")
    ems_vitals = relationship("EMSVitals", back_populates="case", cascade="all, delete-orphan")
    audit_events = relationship("CaseAuditEvent", back_populates="case", cascade="all, delete-orphan")
    destination_hospital = relationship("Hospital", back_populates="assigned_cases")
