from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.emergency_case import EmergencyCase
from app.models.hospital import Hospital
from app.models.hospital_match import HospitalMatchRecord, HospitalDecisionLog
from app.models.base import utc_now
from app.services.audit_service import create_audit_event
from app.hospital_matching.schemas import (
    HospitalMatchCandidate,
    HospitalMatchingResult,
    HospitalDecisionLogItem,
    HospitalMatchingHistoryResponse,
)
from app.hospital_matching.rules import evaluate_hospital_eligibility
from app.hospital_matching.scoring import compute_simulated_distance_and_eta, compute_suitability_score
from app.hospital_matching.explanations import generate_candidate_explanation
from app.realtime.events import publish_case_event
from app.realtime.schemas import RealtimeEventType, ProvenanceSource


class HospitalMatchingService:
    """
    Deterministic Hospital Matching & Diversion Coordination Service.
    Calculates explainable recommendations based strictly on structured case fields and hospital readiness.
    Enforces that all final destination selections and diversion transfers require explicit human confirmation.
    """

    def _resolve_case(self, db: Session, case_id_or_uuid: str) -> Optional[EmergencyCase]:
        stmt = select(EmergencyCase).where(
            (EmergencyCase.id == case_id_or_uuid) | (EmergencyCase.case_id == case_id_or_uuid)
        )
        return db.scalars(stmt).first()

    def _get_rejected_hospitals_for_case(self, db: Session, case_id: str) -> List[str]:
        stmt = select(HospitalDecisionLog.hospital_id).where(
            (HospitalDecisionLog.case_id == case_id) &
            (HospitalDecisionLog.decision_type.in_(["REJECTION", "DIVERSION"]))
        )
        return list(db.scalars(stmt).all())

    def calculate_matching(
        self,
        db: Session,
        case_id_or_uuid: str,
        persist_record: bool = True,
    ) -> HospitalMatchingResult:
        """
        Executes deterministic matching for a case across all registered hospitals.
        Orders eligible candidates by score and generates explainable justification.
        """
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            raise ValueError(f"Emergency case '{case_id_or_uuid}' not found.")

        hospitals = db.scalars(select(Hospital)).all()
        rejected_hospital_ids = self._get_rejected_hospitals_for_case(db, case.id)

        evaluated_candidates: List[HospitalMatchCandidate] = []

        for h in hospitals:
            dist_km, eta_min = compute_simulated_distance_and_eta(case, h)
            is_eligible, exclusion_reasons = evaluate_hospital_eligibility(
                hospital=h,
                case=case,
                rejected_hospital_ids=rejected_hospital_ids,
            )
            
            score, cap_score, eta_score, bay_score = compute_suitability_score(
                hospital=h,
                case=case,
                distance_km=dist_km,
                eta_minutes=eta_min,
            )

            evaluated_candidates.append(
                HospitalMatchCandidate(
                    hospital_id=h.id,
                    hospital_name=h.name,
                    short_name=h.short_name,
                    trauma_level=h.trauma_level,
                    operational_status=h.operational_status,
                    diversion_active=h.diversion_active,
                    active_surge_level=h.active_surge_level,
                    is_eligible=is_eligible,
                    exclusion_reasons=exclusion_reasons,
                    suitability_score=score if is_eligible else 0.0,
                    capability_score=cap_score,
                    eta_score=eta_score,
                    capacity_score=bay_score,
                    distance_km=dist_km,
                    eta_minutes=eta_min,
                    available_bays=max(0, h.available_bays or 0),
                    total_bays=h.total_bays or 0,
                    capabilities=h.capabilities or [],
                    explanation="",  # populated after ranking
                    rank=None,
                )
            )

        # Separate and sort eligible vs ineligible
        eligible = [c for c in evaluated_candidates if c.is_eligible]
        ineligible = [c for c in evaluated_candidates if not c.is_eligible]

        # Sort eligible by score DESC, then ETA ASC
        eligible.sort(key=lambda c: (-c.suitability_score, c.eta_minutes))

        # Assign ranks and explanations
        ranked_candidates: List[HospitalMatchCandidate] = []
        for idx, cand in enumerate(eligible, start=1):
            cand.rank = idx
            h_obj = next((h for h in hospitals if h.id == cand.hospital_id), None)
            if h_obj:
                cand.explanation = generate_candidate_explanation(
                    hospital=h_obj,
                    case=case,
                    is_eligible=True,
                    exclusion_reasons=[],
                    rank=idx,
                    suitability_score=cand.suitability_score,
                    distance_km=cand.distance_km,
                    eta_minutes=cand.eta_minutes,
                )
            ranked_candidates.append(cand)

        for cand in ineligible:
            cand.rank = None
            h_obj = next((h for h in hospitals if h.id == cand.hospital_id), None)
            if h_obj:
                cand.explanation = generate_candidate_explanation(
                    hospital=h_obj,
                    case=case,
                    is_eligible=False,
                    exclusion_reasons=cand.exclusion_reasons,
                    rank=None,
                    suitability_score=0.0,
                    distance_km=cand.distance_km,
                    eta_minutes=cand.eta_minutes,
                )
            ranked_candidates.append(cand)

        recommended_id = ranked_candidates[0].hospital_id if eligible else None

        result = HospitalMatchingResult(
            case_id=case.case_id,
            current_destination_id=case.destination_hospital_id,
            recommended_hospital_id=recommended_id,
            confirmed_destination_id=case.destination_hospital_id,
            recommendation_label="System Recommendation — Final destination requires authorized human confirmation.",
            status="RECOMMENDATION_PRESENTED",
            candidates=ranked_candidates,
            generated_at=utc_now(),
        )

        if persist_record:
            match_record = HospitalMatchRecord(
                case_id=case.id,
                recommended_hospital_id=recommended_id,
                confirmed_destination_id=case.destination_hospital_id,
                status="RECOMMENDATION_PRESENTED",
                candidates_payload=[c.model_dump(mode="json") for c in ranked_candidates],
                generated_at=result.generated_at,
            )
            db.add(match_record)
            db.flush()
            result.id = match_record.id

            # Create immutable audit events
            create_audit_event(
                db=db,
                case_id=case.id,
                event_type="HOSPITAL_MATCHING_CALCULATED",
                actor_type="SYSTEM",
                actor_name="LifeSync Hospital Matching Engine",
                title="Hospital Matching Candidates Evaluated",
                description=f"Evaluated {len(ranked_candidates)} hospitals ({len(eligible)} eligible, {len(ineligible)} excluded).",
                new_state=case.status,
                event_metadata={
                    "total_evaluated": len(ranked_candidates),
                    "eligible_count": len(eligible),
                    "top_candidate": recommended_id,
                },
            )

            if recommended_id:
                rec_cand = ranked_candidates[0]
                create_audit_event(
                    db=db,
                    case_id=case.id,
                    event_type="HOSPITAL_RECOMMENDATION_PRESENTED",
                    actor_type="SYSTEM",
                    actor_name="LifeSync Hospital Matching Engine",
                    title="Hospital Destination Recommendation Presented",
                    description=f"{rec_cand.hospital_name} ranked #1 (Score: {rec_cand.suitability_score:.2f}). Requires authorized human confirmation.",
                    new_state=case.status,
                    event_metadata={
                        "recommended_hospital_id": recommended_id,
                        "suitability_score": rec_cand.suitability_score,
                        "eta_minutes": rec_cand.eta_minutes,
                    },
                )

            db.commit()

        return result

    def confirm_destination(
        self,
        db: Session,
        case_id_or_uuid: str,
        hospital_id: str,
        actor_name: str,
        actor_role: str,
        notes: Optional[str] = None,
    ) -> HospitalMatchingResult:
        """
        Explicit human confirmation of a destination hospital.
        Updates the case destination, records decision log, and appends audit event.
        """
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            raise ValueError(f"Emergency case '{case_id_or_uuid}' not found.")

        hospital = db.scalars(select(Hospital).where(Hospital.id == hospital_id)).first()
        if not hospital:
            raise ValueError(f"Hospital facility '{hospital_id}' not found.")

        prev_destination = case.destination_hospital_id
        case.destination_hospital_id = hospital.id

        # If case is in REPORTED status, transition to HOSPITAL_ALERTED
        if case.status == "REPORTED":
            case.status = "HOSPITAL_ALERTED"
            case.time_alerted = utc_now()
            case.acknowledged_state = "PENDING"

        # Record decision log
        decision = HospitalDecisionLog(
            case_id=case.id,
            hospital_id=hospital.id,
            decision_type="CONFIRMATION",
            reason_code="HUMAN_CONFIRMED",
            reason_description=notes,
            actor_name=actor_name,
            actor_role=actor_role,
        )
        db.add(decision)

        # Update latest match record if exists
        latest_match = db.scalars(
            select(HospitalMatchRecord)
            .where(HospitalMatchRecord.case_id == case.id)
            .order_by(desc(HospitalMatchRecord.created_at))
        ).first()
        if latest_match:
            latest_match.confirmed_destination_id = hospital.id
            latest_match.status = "HUMAN_CONFIRMED"

        # Append audit event
        create_audit_event(
            db=db,
            case_id=case.id,
            event_type="HOSPITAL_DESTINATION_CONFIRMED",
            actor_type=actor_role.split("_")[0],
            actor_name=actor_name,
            title="Hospital Destination Confirmed by Human Coordinator",
            description=f"Destination confirmed as {hospital.name} ({hospital.id}). Previous: {prev_destination or 'None'}.",
            previous_state=prev_destination,
            new_state=hospital.id,
            event_metadata={
                "hospital_id": hospital.id,
                "hospital_name": hospital.name,
                "actor_role": actor_role,
                "notes": notes,
            },
        )

        db.commit()

        # Publish delivery-only WebSocket notification
        publish_case_event(
            case_id=case.case_id,
            event_type=RealtimeEventType.DESTINATION_CONFIRMED,
            source=ProvenanceSource.EMS_VERIFIED if "EMS" in actor_role else ProvenanceSource.HOSPITAL_VERIFIED,
            payload={
                "case_id": case.case_id,
                "confirmed_destination_id": hospital.id,
                "confirmed_destination_name": hospital.name,
                "actor_name": actor_name,
                "actor_role": actor_role,
                "notes": notes,
            },
        )

        return self.calculate_matching(db, case.id, persist_record=False)

    def reject_destination(
        self,
        db: Session,
        case_id_or_uuid: str,
        hospital_id: str,
        reason_code: str,
        reason_description: Optional[str],
        actor_name: str,
        actor_role: str,
    ) -> HospitalMatchingResult:
        """
        Explicit human rejection of a destination recommendation.
        Records reason in decision log, recalculates alternative candidates,
        and DOES NOT automatically change the destination.
        """
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            raise ValueError(f"Emergency case '{case_id_or_uuid}' not found.")

        decision = HospitalDecisionLog(
            case_id=case.id,
            hospital_id=hospital_id,
            decision_type="REJECTION",
            reason_code=reason_code,
            reason_description=reason_description,
            actor_name=actor_name,
            actor_role=actor_role,
        )
        db.add(decision)

        create_audit_event(
            db=db,
            case_id=case.id,
            event_type="HOSPITAL_DESTINATION_REJECTED",
            actor_type=actor_role.split("_")[0],
            actor_name=actor_name,
            title="Hospital Recommendation Rejected by Human Coordinator",
            description=f"Hospital {hospital_id} rejected. Reason: {reason_code} ({reason_description or 'No extra notes'}). Presenting alternative candidates.",
            event_metadata={
                "rejected_hospital_id": hospital_id,
                "reason_code": reason_code,
                "reason_description": reason_description,
                "actor_role": actor_role,
            },
        )

        db.commit()
        
        # Calculate new matching with rejected hospital excluded, returning alternatives
        res = self.calculate_matching(db, case.id, persist_record=True)
        res.status = "REJECTION_RECORDED"
        return res

    def divert_hospital(
        self,
        db: Session,
        case_id_or_uuid: str,
        hospital_id: str,
        reason_code: str,
        reason_description: Optional[str],
        actor_name: str,
        actor_role: str,
    ) -> HospitalMatchingResult:
        """
        Hospital ED coordinator triggers diversion.
        Records diversion in decision log, updates case status to RE_ROUTING,
        calculates alternative candidates, and DOES NOT auto-assign final destination.
        """
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            raise ValueError(f"Emergency case '{case_id_or_uuid}' not found.")

        case.status = "RE_ROUTING"
        case.acknowledged_state = "DIVERTED"

        decision = HospitalDecisionLog(
            case_id=case.id,
            hospital_id=hospital_id,
            decision_type="DIVERSION",
            reason_code=reason_code,
            reason_description=reason_description,
            actor_name=actor_name,
            actor_role=actor_role,
        )
        db.add(decision)

        create_audit_event(
            db=db,
            case_id=case.id,
            event_type="HOSPITAL_DIVERSION_REQUESTED",
            actor_type="HOSPITAL",
            actor_name=actor_name,
            title="Hospital Initiated Case Diversion",
            description=f"Hospital {hospital_id} requested diversion. Reason: {reason_code}. Case entered RE_ROUTING state.",
            previous_state="HOSPITAL_ALERTED",
            new_state="RE_ROUTING",
            event_metadata={
                "diverted_hospital_id": hospital_id,
                "reason_code": reason_code,
                "reason_description": reason_description,
                "actor_role": actor_role,
            },
        )

        db.commit()

        publish_case_event(
            case_id=case.case_id,
            event_type=RealtimeEventType.HOSPITAL_DIVERSION_REQUESTED,
            source=ProvenanceSource.HOSPITAL_VERIFIED,
            payload={
                "case_id": case.case_id,
                "diverted_hospital_id": hospital_id,
                "reason_code": reason_code,
                "reason_description": reason_description,
                "actor_name": actor_name,
                "actor_role": actor_role,
            },
        )

        res = self.calculate_matching(db, case.id, persist_record=True)
        res.status = "DIVERSION_RECORDED"
        return res

    def get_latest_matching(self, db: Session, case_id_or_uuid: str) -> Optional[HospitalMatchingResult]:
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            return None

        record = db.scalars(
            select(HospitalMatchRecord)
            .where(HospitalMatchRecord.case_id == case.id)
            .order_by(desc(HospitalMatchRecord.created_at))
        ).first()

        if not record:
            # Calculate and persist if not found
            return self.calculate_matching(db, case.id, persist_record=True)

        candidates = [HospitalMatchCandidate(**c) for c in record.candidates_payload]
        return HospitalMatchingResult(
            id=record.id,
            case_id=case.case_id,
            current_destination_id=case.destination_hospital_id,
            recommended_hospital_id=record.recommended_hospital_id,
            confirmed_destination_id=record.confirmed_destination_id or case.destination_hospital_id,
            recommendation_label="System Recommendation — Final destination requires authorized human confirmation.",
            status=record.status,
            candidates=candidates,
            generated_at=record.generated_at,
        )

    def get_matching_history(self, db: Session, case_id_or_uuid: str) -> HospitalMatchingHistoryResponse:
        case = self._resolve_case(db, case_id_or_uuid)
        if not case:
            raise ValueError(f"Emergency case '{case_id_or_uuid}' not found.")

        records = db.scalars(
            select(HospitalMatchRecord)
            .where(HospitalMatchRecord.case_id == case.id)
            .order_by(desc(HospitalMatchRecord.created_at))
        ).all()

        decisions = db.scalars(
            select(HospitalDecisionLog)
            .where(HospitalDecisionLog.case_id == case.id)
            .order_by(desc(HospitalDecisionLog.created_at))
        ).all()

        matching_runs = []
        for r in records:
            cands = [HospitalMatchCandidate(**c) for c in r.candidates_payload]
            matching_runs.append(
                HospitalMatchingResult(
                    id=r.id,
                    case_id=case.case_id,
                    current_destination_id=case.destination_hospital_id,
                    recommended_hospital_id=r.recommended_hospital_id,
                    confirmed_destination_id=r.confirmed_destination_id,
                    status=r.status,
                    candidates=cands,
                    generated_at=r.generated_at,
                )
            )

        decision_items = [HospitalDecisionLogItem.model_validate(d) for d in decisions]

        return HospitalMatchingHistoryResponse(
            case_id=case.case_id,
            current_destination_id=case.destination_hospital_id,
            total_matching_runs=len(matching_runs),
            matching_runs=matching_runs,
            decision_logs=decision_items,
        )
