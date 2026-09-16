from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Hospital(Base, TimestampMixin):
    """
    Receiving hospital facility profile with capabilities and capacity attributes.
    """
    __tablename__ = "hospitals"

    id = Column(String(64), primary_key=True)  # e.g. HOSP-CITYCARE-01
    name = Column(String(255), nullable=False)
    short_name = Column(String(64), nullable=False)
    trauma_level = Column(String(128), nullable=False)

    operational_status = Column(String(32), default="Operational", nullable=False)
    diversion_active = Column(Boolean, default=False, nullable=False)
    active_surge_level = Column(String(64), default="Normal", nullable=False)

    total_bays = Column(Integer, default=12, nullable=False)
    available_bays = Column(Integer, default=5, nullable=False)

    coordinator_name = Column(String(128), nullable=False)
    coordinator_role = Column(String(128), nullable=False)
    phone = Column(String(64), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    capabilities = Column(JSON, default=list, nullable=False)

    # Relationships
    resources = relationship("HospitalResource", back_populates="hospital", cascade="all, delete-orphan")
    assigned_cases = relationship("EmergencyCase", back_populates="destination_hospital")


class HospitalResource(Base, TimestampMixin):
    """
    Specific hospital readiness resource (Resuscitation bay, trauma bay, cath lab, CT scanner, blood bank).
    """
    __tablename__ = "hospital_resources"

    id = Column(String(64), primary_key=True)  # e.g. RES-BAY-01
    hospital_id = Column(String(64), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)  # Resuscitation Unit, Emergency Bay, Specialist Team, Diagnostics / Imaging, Blood Bank
    status = Column(String(32), default="Ready", nullable=False)  # Ready, Limited, Occupied, Unavailable

    total_capacity = Column(Integer, default=1, nullable=False)
    available_capacity = Column(Integer, default=1, nullable=False)
    assigned_case_id = Column(String(32), nullable=True)
    location = Column(String(128), nullable=False)
    notes = Column(Text, nullable=True)
    last_updated = Column(String(64), default="Just now", nullable=False)

    # Relationships
    hospital = relationship("Hospital", back_populates="resources")
