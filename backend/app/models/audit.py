from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid, utc_now


class CaseAuditEvent(Base, TimestampMixin):
    """
    Append-only persistent audit log and timeline event for emergency cases.
    Tracks state transitions, clinical observations, and inter-agency coordination actions.
    """
    __tablename__ = "case_audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="CASCADE"), nullable=False, index=True)

    timestamp = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    event_type = Column(String(64), nullable=False, index=True)  # CASE_REPORTED, ASSIGNMENT_ACCEPTED, etc.
    actor_type = Column(String(32), nullable=False)               # CITIZEN, EMS, HOSPITAL, SYSTEM
    actor_name = Column(String(128), nullable=False)

    previous_state = Column(String(48), nullable=True)
    new_state = Column(String(48), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    event_metadata = Column(JSON, default=dict, nullable=False)

    # Relationships
    case = relationship("EmergencyCase", back_populates="audit_events")
