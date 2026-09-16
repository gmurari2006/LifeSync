import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from app.realtime.schemas import RealtimeEventEnvelope, RealtimeEventType, ProvenanceSource
from app.realtime.connection_manager import manager

logger = logging.getLogger(__name__)


async def broadcast_case_event_async(
    case_id: str,
    event_type: RealtimeEventType,
    source: ProvenanceSource,
    payload: Dict[str, Any],
    timestamp: Optional[datetime] = None,
):
    """
    Asynchronously broadcasts a typed delivery-only event to all subscribers of a case.
    """
    envelope = RealtimeEventEnvelope(
        event_type=event_type,
        case_id=case_id,
        timestamp=timestamp or datetime.utcnow(),
        source=source,
        payload=payload,
    )
    await manager.broadcast_to_case(case_id=case_id, envelope=envelope)


def publish_case_event(
    case_id: str,
    event_type: RealtimeEventType,
    source: ProvenanceSource,
    payload: Dict[str, Any],
    timestamp: Optional[datetime] = None,
):
    """
    Synchronous/thread-safe helper to schedule WebSocket event delivery from synchronous endpoints/services.
    Never blocks or alters database transactions.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(
                broadcast_case_event_async(
                    case_id=case_id,
                    event_type=event_type,
                    source=source,
                    payload=payload,
                    timestamp=timestamp,
                )
            )
        else:
            loop.run_until_complete(
                broadcast_case_event_async(
                    case_id=case_id,
                    event_type=event_type,
                    source=source,
                    payload=payload,
                    timestamp=timestamp,
                )
            )
    except RuntimeError:
        # If no active event loop in current thread, create a brief loop or handle gracefully
        try:
            new_loop = asyncio.new_event_loop()
            new_loop.run_until_complete(
                broadcast_case_event_async(
                    case_id=case_id,
                    event_type=event_type,
                    source=source,
                    payload=payload,
                    timestamp=timestamp,
                )
            )
            new_loop.close()
        except Exception as e:
            logger.debug(f"Event dispatch note: {e}")
    except Exception as e:
        logger.debug(f"Realtime broadcast note: {e}")
