from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.simulation.schemas import (
    AmbulanceTelemetryState,
    SimulationControlRequest,
)
from app.simulation.service import simulation_service

router = APIRouter()


@router.post(
    "/cases/{case_id}/control",
    response_model=AmbulanceTelemetryState,
    summary="Control ambulance movement simulation",
)
def control_ambulance_simulation(
    case_id: str,
    request: SimulationControlRequest,
    db: Session = Depends(get_db),
):
    """
    Control synthetic ambulance transit simulation (START, PAUSE, RESUME, STOP, STEP, RESET).
    Requires a human-confirmed destination from Step 7 before starting.
    """
    try:
        telemetry = simulation_service.control_simulation(
            db=db,
            case_id=case_id,
            request=request,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/cases/{case_id}/telemetry",
    response_model=AmbulanceTelemetryState,
    summary="Get simulated ambulance telemetry snapshot",
)
def get_ambulance_telemetry(
    case_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve real-time synthetic coordinates, speed, dynamic ETA, and distance remaining.
    """
    try:
        telemetry = simulation_service.get_telemetry(db=db, case_id=case_id)
        return telemetry
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/cases/{case_id}/step",
    response_model=AmbulanceTelemetryState,
    summary="Advance simulation by discrete time step",
)
def step_ambulance_simulation(
    case_id: str,
    seconds: float = Query(5.0, ge=0.5, le=60.0, description="Step duration in simulated seconds"),
    db: Session = Depends(get_db),
):
    """
    Manually advances the synthetic movement simulation by a discrete step.
    """
    try:
        telemetry = simulation_service.step_simulation(
            db=db,
            case_id=case_id,
            delta_seconds=seconds,
        )
        return telemetry
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
