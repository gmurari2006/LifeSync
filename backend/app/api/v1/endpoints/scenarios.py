from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.case import CaseDetailResponse
from app.simulation.scenarios import (
    ScenarioMetadata,
    list_canonical_scenarios,
    get_scenario_metadata,
    load_canonical_scenario,
    reset_scenario_database_state,
)

router = APIRouter()


@router.get(
    "",
    response_model=List[ScenarioMetadata],
    summary="List all 5 canonical PRD demonstration scenarios",
)
def get_scenarios():
    """
    Retrieve metadata, clinical domains, talking points, and targets for the 5 canonical PRD demo scenarios.
    """
    return list_canonical_scenarios()


@router.get(
    "/{scenario_id}",
    response_model=ScenarioMetadata,
    summary="Get single scenario metadata",
)
def get_scenario(scenario_id: str):
    """
    Retrieve detailed metadata for a specific scenario by ID.
    """
    meta = get_scenario_metadata(scenario_id)
    if not meta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_id}' not found.",
        )
    return meta


@router.post(
    "/{scenario_id}/load",
    response_model=CaseDetailResponse,
    summary="Load and initialize a canonical demo scenario",
)
def load_scenario(
    scenario_id: str,
    db: Session = Depends(get_db),
):
    """
    Load a canonical demonstration scenario, creating/resetting ONLY LS-SCENARIO-* records.
    Never alters or deletes non-scenario baseline records.
    """
    try:
        case = load_canonical_scenario(db=db, scenario_id=scenario_id)
        return case
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/reset",
    response_model=Dict[str, Any],
    summary="Reset all synthetic scenario data",
)
def reset_scenarios(
    db: Session = Depends(get_db),
):
    """
    Safely purges and resets ONLY LS-SCENARIO-* records, releasing reserved bays
    and resetting simulation tracks. Baseline non-scenario cases and database schema are preserved.
    """
    result = reset_scenario_database_state(db)
    return result
