from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid, utc_now


class AIStructuredReport(Base, TimestampMixin):
    """
    AI-generated structured interpretation of unstructured citizen bystander reports.
    Strictly segregated with source: AI_STRUCTURED.
    Note: Serves as assistive summarization only; not a clinical diagnosis or treatment order.
    """
    __tablename__ = "ai_structured_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    citizen_report_id = Column(String(36), ForeignKey("citizen_reports.id", ondelete="CASCADE"), nullable=False, index=True)

    incident_summary = Column(Text, nullable=False)
    incident_category = Column(String(128), nullable=False)
    people_count = Column(Integer, default=1, nullable=False)

    consciousness = Column(String(64), default="Uncertain", nullable=False)
    breathing = Column(String(64), default="Uncertain", nullable=False)
    visible_concerns = Column(JSON, default=list, nullable=False)
    location_summary = Column(String(255), nullable=False)

    extracted_keywords = Column(JSON, default=list, nullable=False)
    uncertainty_flags = Column(JSON, default=list, nullable=False)
    missing_information = Column(JSON, default=list, nullable=False)

    confidence_score = Column(Float, default=0.85, nullable=False)  # Model extraction confidence (0.0 - 1.0)
    source = Column(String(32), default="AI_STRUCTURED", nullable=False)

    model_name = Column(String(64), default="lifesync-nlp-local-v1", nullable=False)
    model_version = Column(String(32), default="1.2.0", nullable=False)
    prompt_version = Column(String(32), default="v1.2", nullable=False)
    status = Column(String(32), default="COMPLETED", nullable=False)  # COMPLETED, FAILED, PENDING

    structured_payload = Column(JSON, default=dict, nullable=False)
    generated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    case = relationship("EmergencyCase", back_populates="ai_reports")
    citizen_report = relationship("CitizenReport", back_populates="ai_reports")
