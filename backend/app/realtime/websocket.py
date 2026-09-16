import logging
import json
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from app.core.database import SessionLocal
from app.realtime.connection_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/cases/{case_id}")
async def websocket_case_endpoint(
    websocket: WebSocket,
    case_id: str,
    role: Optional[str] = Query(None, description="Authorized actor role, e.g. EMS_PARAMEDIC, ED_COORDINATOR"),
    token: Optional[str] = Query(None, description="Client auth token"),
):
    """
    Case-scoped WebSocket subscription endpoint for real-time notifications.
    Strictly delivery-only: client messages never mutate authoritative case data.
    Enforces case-level authorization before accepting connection.
    """
    db = SessionLocal()
    try:
        # Mandatory Case-Level Authorization Check
        is_authorized = manager.verify_case_authorization(
            db=db,
            case_id=case_id,
            auth_role=role,
            auth_token=token,
        )
        if not is_authorized:
            logger.warning(f"Closing unauthorized WebSocket attempt for case '{case_id}'.")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Connect and register
        await manager.connect(case_id=case_id, websocket=websocket)

        # Keep connection alive and handle client pings
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                # Handle client ping/pong keepalive
                if msg.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "case_id": case_id}))
            except json.JSONDecodeError:
                pass

    except WebSocketDisconnect:
        manager.disconnect(case_id=case_id, websocket=websocket)
    except Exception as e:
        logger.debug(f"WebSocket session error in case '{case_id}': {e}")
        manager.disconnect(case_id=case_id, websocket=websocket)
    finally:
        db.close()
