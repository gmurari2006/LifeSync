from pydantic import BaseModel, Field
from typing import List
from app.schemas.hospital import HospitalResourceResponse


class ReadinessSummaryResponse(BaseModel):
    hospital_id: str
    hospital_name: str
    operational_status: str
    diversion_active: bool
    total_bays: int
    available_bays: int
    resources: List[HospitalResourceResponse] = []
