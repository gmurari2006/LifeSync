from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid, utc_now


class EMSUnit(Base, TimestampMixin):
    """
    Paramedic and ambulance unit entity.
    """
    __tablename__ = "ems_units"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    unit_id = Column(String(32), unique=True, index=True, nullable=False)  # e.g. ALS-04
    unit_type = Column(String(64), default="ALS (Advanced Life Support)", nullable=False)
    call_sign = Column(String(64), default="Alpha-4-Medic", nullable=False)
    status = Column(String(32), default="Available", nullable=False)  # Available, Responding, On Scene, Transporting, At Destination, Handover Complete

    lead_paramedic = Column(String(128), nullable=False)
    driver_paramedic = Column(String(128), nullable=False)
    contact_number = Column(String(64), nullable=False)

    current_location_name = Column(String(255), nullable=True)
    speed_kmh = Column(Float, default=0.0, nullable=False)
    fuel_percent = Column(Integer, default=100, nullable=False)
    active_case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="SET NULL"), nullable=True)


class EMSVerification(Base, TimestampMixin):
    """
    Field clinical observations verified directly on-scene by certified paramedic crews.
    Strictly segregated with source: EMS_VERIFIED.
    """
    __tablename__ = "ems_verifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="CASCADE"), nullable=False, index=True)

    consciousness = Column(String(32), default="Unverified", nullable=False)  # Responding, Not responding, Unable to assess
    breathing = Column(String(32), default="Unverified", nullable=False)      # Normal, Abnormal, Unable to assess
    bleeding = Column(String(32), default="Unverified", nullable=False)       # Present, Not present, Unable to assess
    airway = Column(String(32), default="Unverified", nullable=False)         # Patent, Compromised, Maintained with Adjunct, Unable to assess

    clinical_notes = Column(Text, nullable=True)
    verified_by = Column(String(128), nullable=False)
    verified_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    source = Column(String(32), default="EMS_VERIFIED", nullable=False)

    # Relationships
    case = relationship("EmergencyCase", back_populates="ems_verifications")


class EMSVitals(Base, TimestampMixin):
    """
    Vital sign parameters measured and streamed by responding EMS crew.
    Segregated with source: EMS_VERIFIED.
    """
    __tablename__ = "ems_vitals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("emergency_cases.id", ondelete="CASCADE"), nullable=False, index=True)

    heart_rate = Column(Integer, nullable=False)          # bpm
    systolic_bp = Column(Integer, nullable=False)         # mmHg
    diastolic_bp = Column(Integer, nullable=False)        # mmHg
    oxygen_saturation = Column(Integer, nullable=False)   # %
    respiratory_rate = Column(Integer, nullable=False)    # /min
    temperature = Column(Float, nullable=False)           # °C
    gcs = Column(Integer, nullable=False)                 # 3-15
    pain_score = Column(Integer, nullable=True)           # 0-10
    blood_glucose = Column(Integer, nullable=True)        # mg/dL

    recorded_by = Column(String(128), nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    source = Column(String(32), default="EMS_VERIFIED", nullable=False)

    # Relationships
    case = relationship("EmergencyCase", back_populates="ems_vitals")
