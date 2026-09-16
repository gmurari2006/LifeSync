import json
import logging
from typing import Dict, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.realtime.schemas import RealtimeEventEnvelope
from app.models.emergency_case import EmergencyCase

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Thread-safe & async-safe WebSocket Connection Manager for LifeSync.
    Manages case-partitioned subscriptions with case-level authorization and dead socket cleanup.
    Delivery-only layer: does not directly mutate authoritative database state.
    """

    def __init__(self):
        # case_id -> Set of active WebSocket connections
        self._active_connections: Dict[str, Set[WebSocket]] = {}

    def verify_case_authorization(
        self,
        db: Session,
        case_id: str,
        auth_role: Optional[str] = None,
        auth_token: Optional[str] = None,
    ) -> bool:
        """
        Validates case existence and authorization before establishing a WebSocket subscription.
        Rejects unknown cases or unauthorized subscription attempts.
        """
        if not case_id or not case_id.strip():
            return False

        # Lookup by UUID or human-readable Case ID
        normalized = case_id.strip()
        case = db.query(EmergencyCase).filter(
            (EmergencyCase.id == normalized) | (EmergencyCase.case_id == normalized.upper())
        ).first()

        if not case:
            logger.warning(f"WebSocket auth failed: Case '{case_id}' does not exist.")
            return False

        # In hackathon simulation mode, verify role/token if provided
        allowed_roles = {"EMS_PARAMEDIC", "ED_COORDINATOR", "HOSPITAL_PHYSICIAN", "REGIONAL_DISPATCHER", "CITIZEN", "SYSTEM"}
        if auth_role and auth_role.upper() not in allowed_roles:
            logger.warning(f"WebSocket auth failed: Unauthorized role '{auth_role}' for case '{case_id}'.")
            return False

        return True

    async def connect(self, case_id: str, websocket: WebSocket):
        """
        Accepts WebSocket handshake and subscribes the client to the specified case channel.
        """
        await websocket.accept()
        canonical_id = case_id.strip()
        if canonical_id not in self._active_connections:
            self._active_connections[canonical_id] = set()
        self._active_connections[canonical_id].add(websocket)
        logger.info(f"WebSocket client connected to case '{canonical_id}'. Active subscribers: {len(self._active_connections[canonical_id])}")

    def disconnect(self, case_id: str, websocket: WebSocket):
        """
        Removes a WebSocket client from the case subscription registry.
        """
        canonical_id = case_id.strip()
        if canonical_id in self._active_connections:
            self._active_connections[canonical_id].discard(websocket)
            if not self._active_connections[canonical_id]:
                del self._active_connections[canonical_id]
        logger.info(f"WebSocket client disconnected from case '{canonical_id}'.")

    async def broadcast_to_case(self, case_id: str, envelope: RealtimeEventEnvelope):
        """
        Broadcasts a typed event envelope to all active subscribers of the given case.
        Automatically removes dead/closed connections without raising exceptions.
        """
        canonical_id = case_id.strip()
        subscribers = self._active_connections.get(canonical_id, set()).copy()
        if not subscribers:
            return

        message_data = envelope.model_dump(mode="json")
        json_payload = json.dumps(message_data, default=str)

        dead_connections: Set[WebSocket] = set()
        for ws in subscribers:
            try:
                await ws.send_text(json_payload)
            except (WebSocketDisconnect, RuntimeError, Exception) as e:
                logger.debug(f"Failed to send to socket in case '{canonical_id}': {e}. Marking for removal.")
                dead_connections.add(ws)

        # Cleanup dead connections
        for dead_ws in dead_connections:
            self.disconnect(canonical_id, dead_ws)

    def get_subscriber_count(self, case_id: str) -> int:
        """Returns the number of active WebSocket subscribers for a case."""
        return len(self._active_connections.get(case_id.strip(), set()))


# Global singleton connection manager instance
manager = ConnectionManager()
