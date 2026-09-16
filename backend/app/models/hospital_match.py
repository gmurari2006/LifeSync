from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid, utc_now


class HospitalMatchRecord(Base, TimestampMixin):
    """
    Persisted execution of a deterministic hospital matching calculation.
    Maintains complete explainability breakdown and candidates payload.
    """
    __tablename__ = "hospital_match_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    
    recommended_hospital_id = Column(String(64), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    confirmed_destination_id = Column(String(64), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(String(32), default="RECOMMENDATION_PRESENTED", nullable=False)
    candidates_payload = Column(JSON, default=list, nullable=False)
    generated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    case = relationship("EmergencyCase", back_populates="matching_records")
    recommended_hospital = relationship("Hospital", foreign_keys=[recommended_hospital_id])
    confirmed_destination = relationship("Hospital", foreign_keys=[confirmed_destination_id])


class HospitalDecisionLog(Base, TimestampMixin):
    """
    Immutable audit log of human destination decisions (confirmation, rejection, diversion, override).
    """
    __tablename__ = "hospital_decision_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_id = Column(String(64), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    decision_type = Column(String(32), nullable=False)  # CONFIRMATION, REJECTION, DIVERSION, OVERRIDE
    reason_code = Column(String(64), nullable=True)
    reason_description = Column(Text, nullable=True)
    
    actor_name = Column(String(128), nullable=False)
    actor_role = Column(String(64), nullable=False)
    
    # Relationships
    case = relationship("EmergencyCase", back_populates="decision_logs")
    hospital = relationship("Hospital")
