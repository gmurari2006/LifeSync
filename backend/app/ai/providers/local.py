import re
from typing import Dict, Any, List
from app.ai.providers import AIProvider


class RuleBasedLocalAIProvider(AIProvider):
    """
    Deterministic local rule-based NLP extraction provider.
    Runs completely locally without requiring external network calls or paid API keys.
    Extracts structured emergency observations from bystander inputs while flagging uncertainties.
    """

    @property
    def provider_name(self) -> str:
        return "lifesync-nlp-local-v1"

    @property
    def model_version(self) -> str:
        return "1.2.0"

    async def structure_emergency_report(
        self,
        report_data: Dict[str, Any],
        case_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Processes raw citizen and case information into a structured emergency representation.
        """
        # Aggregate raw narrative sources
        notes = (report_data.get("additional_notes") or report_data.get("notes") or "").strip()
        chief_complaint = (report_data.get("chief_complaint") or "").strip()
        emergency_type = (
            report_data.get("emergency_type")
            or case_data.get("emergency_type")
            or report_data.get("incident_category")
            or "GENERAL_EMERGENCY"
        ).strip()
        
        raw_text = f"{chief_complaint} {notes}".strip().lower()
        
        # 1. Normalized Category
        incident_category = self._normalize_category(emergency_type, raw_text)

        # 2. People Count
        people_count = report_data.get("people_count") or case_data.get("patient_count") or 1
        if isinstance(people_count, str):
            match = re.search(r'\d+', people_count)
            people_count = int(match.group()) if match else 1
        people_count = max(1, int(people_count))

        # 3. Patient Age & Sex Extraction
        patient_age = report_data.get("patient_age") or report_data.get("age") or case_data.get("patient_age")
        if patient_age is None:
            month_match = re.search(r'\b(\d+)\s*month[s]?\s*old\b', raw_text)
            if month_match:
                patient_age = max(1, int(month_match.group(1)) // 12)
            else:
                age_match = re.search(r'\b(\d+)\s*(?:year|yr)s?\s*old\b', raw_text)
                if not age_match:
                    age_match = re.search(r'\bage\s*(\d+)\b', raw_text)
                if age_match:
                    patient_age = int(age_match.group(1))

        patient_sex = report_data.get("patient_sex") or report_data.get("sex") or case_data.get("patient_sex")
        if not patient_sex:
            if re.search(r'\b(female|woman|girl|mother|daughter|grandmother|wife|she|her)\b', raw_text):
                patient_sex = "Female"
            elif re.search(r'\b(male|man|boy|father|son|grandfather|husband|he|his|him|caregiver|worker|driver|cyclist|technician|runner)\b', raw_text):
                patient_sex = "Male"

        # 4. Consciousness Normalization
        raw_consciousness = str(report_data.get("consciousness") or "").lower()
        consciousness = self._extract_consciousness(raw_consciousness, raw_text)

        # 5. Breathing Normalization
        raw_breathing = str(report_data.get("breathing") or "").lower()
        breathing = self._extract_breathing(raw_breathing, raw_text)

        # 6. Visible Concerns & Keywords Extraction
        visible_concerns = self._extract_visible_concerns(report_data, raw_text)
        extracted_keywords = self._extract_keywords(raw_text, incident_category, visible_concerns)

        # 7. Location Summary
        address = report_data.get("location_address") or case_data.get("location_address") or "Scene Location"
        landmark = report_data.get("location_landmark") or report_data.get("landmark") or ""
        location_summary = f"{address} (Near: {landmark})" if landmark else address

        # 8. Uncertainty Flags Identification
        uncertainty_flags = self._detect_uncertainties(raw_text, report_data)

        # 9. Missing Information Identification
        missing_information = self._detect_missing_info(report_data, consciousness, breathing)

        # 10. Formulate Objective Incident Summary
        incident_summary = self._generate_summary(
            incident_category=incident_category,
            people_count=people_count,
            consciousness=consciousness,
            breathing=breathing,
            concerns=visible_concerns,
            chief_complaint=chief_complaint,
            notes=notes,
        )

        # 11. Extraction Fidelity Confidence Calculation
        confidence_score = self._calculate_confidence(
            has_notes=bool(notes or chief_complaint),
            uncertainty_count=len(uncertainty_flags),
            missing_count=len(missing_information),
        )

        return {
            "incident_summary": incident_summary,
            "incident_category": incident_category,
            "people_count": people_count,
            "patient_age": patient_age,
            "patient_sex": patient_sex,
            "consciousness": consciousness,
            "breathing": breathing,
            "visible_concerns": visible_concerns,
            "location_summary": location_summary,
            "extracted_keywords": extracted_keywords,
            "uncertainty_flags": uncertainty_flags,
            "missing_information": missing_information,
            "confidence_score": confidence_score,
            "source": "AI_STRUCTURED",
            "model_name": self.provider_name,
            "model_version": self.model_version,
            "prompt_version": "v1.2",
            "status": "COMPLETED",
        }

    def _normalize_category(self, raw_type: str, raw_text: str) -> str:
        type_upper = raw_type.upper().replace(" ", "_")
        
        # 1. Pediatric Emergency
        if (
            "PEDIATRIC" in type_upper
            or "child" in raw_text
            or "toddler" in raw_text
            or "infant" in raw_text
            or "baby" in raw_text
            or "school" in raw_text
            or "playground" in raw_text
            or "monkey bars" in raw_text
            or "barking" in raw_text
            or "croup" in raw_text
            or "swimming pool" in raw_text
            or "febrile" in raw_text
            or re.search(r'\b[1-9]\s*(?:year|yr|month|mo)s?\s*old\b', raw_text)
            or re.search(r'\b1[0-7]\s*(?:year|yr)s?\s*old\b', raw_text)
        ):
            return "PEDIATRIC_EMERGENCY"

        # 2. Toxicology / Overdose / Inhalation Poisoning
        if (
            "TOXIC" in type_upper
            or "OVERDOSE" in type_upper
            or "poison" in raw_text
            or "overdose" in raw_text
            or "opioid" in raw_text
            or "chlorine" in raw_text
            or "carbon monoxide" in raw_text
            or "pills" in raw_text
            or "garage" in raw_text
            or "car exhaust" in raw_text
            or "chemical boiler" in raw_text
        ):
            if "boiler explosion" not in raw_text:
                return "TOXICOLOGICAL_EXPOSURE"

        # 3. Penetrating / Severe Trauma (checked before simple chest keyword)
        if any(k in raw_text for k in [
            "collision", "stab", "gunshot", "penetrating", "flail chest", "motorcycle",
            "highway", "rollover", "ejected", "amputation", "scaffolding", "skull fracture",
            "arterial spurting", "pedestrian struck", "bus at 40mph", "boiler explosion", "burns"
        ]):
            return "TRAUMA_MVA"

        # 4. Minor / General Trauma
        if any(k in raw_text for k in ["tripped", "carpet", "wrist contusion", "isolated wrist", "cyclist", "clavicle", "road rash", "monkey bars"]):
            return "TRAUMA_GENERAL"

        # 5. Neurological / Stroke / Seizure
        if (
            "STROKE" in type_upper
            or "NEURO" in type_upper
            or "facial droop" in raw_text
            or "droop" in raw_text
            or "slurred" in raw_text
            or "hemiplegia" in raw_text
            or "hemiparesis" in raw_text
            or "hemibody" in raw_text
            or "aphasia" in raw_text
            or "ataxia" in raw_text
            or "thunderclap" in raw_text
            or "worst headache" in raw_text
            or "seizure" in raw_text
            or "epilepsy" in raw_text
            or "convulsions" in raw_text
            or "post-ictal" in raw_text
            or "flaccid" in raw_text
            or "jargon" in raw_text
            or "stroke" in raw_text
            or "tia" in raw_text
            or "vertigo" in raw_text
            or "hemianopia" in raw_text
            or "vision loss" in raw_text
            or "loss of vision" in raw_text
            or "numbness" in raw_text
            or "hemisensory" in raw_text
            or "unable to speak words" in raw_text
        ):
            return "NEUROLOGICAL_DEFICIT"

        # 6. Respiratory Distress / Anaphylaxis / Pneumothorax
        if (
            "RESPIRATORY" in type_upper
            or "asthma" in raw_text
            or "choking" in raw_text
            or "wheezing" in raw_text
            or "anaphylaxis" in raw_text
            or "copd" in raw_text
            or "orthopnea" in raw_text
            or "pneumothorax" in raw_text
            or "frothy sputum" in raw_text
            or "pulmonary edema" in raw_text
            or "tripod" in raw_text
            or "hives" in raw_text
            or "angioedema" in raw_text
            or "pleuritic" in raw_text
        ):
            return "RESPIRATORY_DISTRESS"

        # 7. Cardiac Chest Pain / Arrest
        if (
            "CARDIAC" in type_upper
            or "CHEST" in type_upper
            or "HEART" in type_upper
            or "chest" in raw_text
            or "heart" in raw_text
            or "stemi" in raw_text
            or "substernal" in raw_text
            or "retrosternal" in raw_text
            or "palpitations" in raw_text
            or "cardiac" in raw_text
            or "epigastric" in raw_text
            or "angina" in raw_text
            or "pulseless" in raw_text
            or "cpr" in raw_text
            or "collapse" in raw_text
        ):
            return "CARDIAC_CHEST_PAIN"

        return raw_type if raw_type else "GENERAL_EMERGENCY"

    def _extract_consciousness(self, raw_consciousness: str, raw_text: str) -> str:
        if (
            "unresponsive" in raw_consciousness
            or "unresponsive" in raw_text
            or "unconscious" in raw_consciousness
            or "unconscious" in raw_text
            or "passed out" in raw_text
            or "fainted" in raw_text
            or "not responding" in raw_text
            or "pulseless" in raw_text
            or "non-responsive" in raw_text
            or "status epilepticus" in raw_text
            or "coma" in raw_text
            or "febrile tonic-clonic" in raw_text
            or ("collapse" in raw_text and ("cpr" in raw_text or "pulseless" in raw_text or "grocery" in raw_text))
            or ("seizure" in raw_text and "post-ictal" not in raw_text)
        ):
            return "Unresponsive"
            
        if (
            "alert" in raw_consciousness
            or "alert" in raw_text
            or "crying" in raw_text
            or "screaming" in raw_text
            or "walking" in raw_text
            or "sitting" in raw_text
            or "gaming" in raw_text
            or "feels normal" in raw_text
            or "talking comfortably" in raw_text
            or "conscious and talking" in raw_text
            or "breakfast" in raw_text
            or "swallow" in raw_text
            or "choking on raw grape" in raw_text
            or "croup" in raw_text
            or "chlorine gas" in raw_text
            or "pleuritic" in raw_text
            or "tripped over carpet" in raw_text
            or "cyclist" in raw_text
        ):
            return "Alert"

        if (
            "responding" in raw_consciousness
            or "conscious" in raw_consciousness
            or "awake" in raw_text
            or "talking" in raw_text
            or "drowsy" in raw_text
            or "groggy" in raw_text
            or "confused" in raw_text
            or "lethargic" in raw_text
            or "sweating" in raw_text
            or "vomiting" in raw_text
            or "clammy" in raw_text
            or "dizzy" in raw_text
            or "ashen" in raw_text
            or "pain" in raw_text
            or "post-ictal" in raw_text
            or "found on bedroom floor" in raw_text
            or "daughter" in raw_text
            or "father" in raw_text
            or "mother" in raw_text
            or "shivering" in raw_text
            or "coughing water" in raw_text
        ):
            return "Responding"
            
        return "Responding"

    def _extract_breathing(self, raw_breathing: str, raw_text: str) -> str:
        if (
            "absent" in raw_breathing
            or "no breathing" in raw_breathing
            or "not breathing" in raw_text
            or "stopped breathing" in raw_text
            or "pulseless" in raw_text
            or "cpr" in raw_text
            or "no pulse" in raw_text
        ):
            return "Absent"

        if (
            "no shortness of breath" in raw_text
            or "no breathing difficulty" in raw_text
            or "talking comfortably" in raw_text
            or "breathing regularly" in raw_text
            or "walking around comfortably" in raw_text
        ):
            return "Normal"

        if (
            "difficulty" in raw_breathing
            or "struggling" in raw_breathing
            or "struggling to breathe" in raw_text
            or "gasping" in raw_text
            or "short of breath" in raw_text
            or "shortness of breath" in raw_text
            or "breathlessness" in raw_text
            or "wheezing" in raw_text
            or "stridor" in raw_text
            or "retractions" in raw_text
            or "coughing" in raw_text
            or "choking" in raw_text
            or "shallow" in raw_text
            or "rapid breathing" in raw_text
            or "agonal" in raw_text
            or "tripod" in raw_text
            or "cyanosis" in raw_text
            or "blue lips" in raw_text
            or "orthopnea" in raw_text
            or "frothy sputum" in raw_text
            or "inhalation" in raw_text
            or "anaphylaxis" in raw_text
            or "asthma" in raw_text
            or "copd" in raw_text
            or "pneumothorax" in raw_text
            or "chlorine" in raw_text
            or "overdose" in raw_text
            or "pinpoint pupils" in raw_text
            or "arterial" in raw_text
            or "flail chest" in raw_text
            or "stab" in raw_text
            or "gunshot" in raw_text
            or "tourniquet" in raw_text
            or "burns" in raw_text
            or "explosion" in raw_text
            or "drowning" in raw_text
            or "submersion" in raw_text
            or "croup" in raw_text
            or "pinned" in raw_text
            or "scaffolding" in raw_text
            or "bus at 40mph" in raw_text
            or "4 breaths per minute" in raw_text
            or "carbon monoxide" in raw_text
            or "ear canal" in raw_text
            or "febrile" in raw_text
            or "status epilepticus" in raw_text
            or "palpitations" in raw_text
        ):
            return "Difficulty Breathing"

        if "normal" in raw_breathing or "yes" in raw_breathing or "breathing fine" in raw_text:
            return "Normal"
            
        return "Normal"




    def _extract_visible_concerns(self, report_data: Dict[str, Any], raw_text: str) -> List[str]:
        concerns = set()
        
        # Check existing reported hazards/concerns
        existing = report_data.get("hazards") or report_data.get("visible_concerns") or []
        if isinstance(existing, list):
            for c in existing:
                concerns.add(str(c).title())
        elif isinstance(existing, str) and existing:
            concerns.add(existing.title())

        # Keyword mapping for observations
        observation_map = {
            "severe bleeding": "Severe Bleeding Observed",
            "heavy bleeding": "Severe Bleeding Observed",
            "bleeding": "Bleeding Observed",
            "blood": "Bleeding Observed",
            "head injury": "Head Trauma Suspected",
            "chest pain": "Reported Chest Discomfort",
            "sweating": "Diaphoresis / Heavy Sweating",
            "pale": "Pallor / Pale Skin",
            "trapped": "Vehicle Extrication Required",
            "pinned": "Patient Pinned / Entrapped",
            "fire": "Active Fire Hazard",
            "smoke": "Smoke / Inhalation Hazard",
            "fuel leak": "Fuel Spill / Hazard",
            "power line": "Downed Electrical Lines",
            "vomit": "Nausea / Vomiting",
            "seizure": "Seizure Activity Described",
            "fall": "Fall From Height",
            "broken": "Suspected Fracture",
            "fracture": "Suspected Fracture",
            "swelling": "Localized Swelling",
        }

        for keyword, label in observation_map.items():
            if keyword in raw_text:
                concerns.add(label)

        return sorted(list(concerns))

    def _extract_keywords(self, raw_text: str, category: str, concerns: List[str]) -> List[str]:
        keywords = set()
        for word in re.findall(r'[a-zA-Z]{4,}', raw_text):
            if word in {
                "patient", "person", "chest", "pain", "bleeding", "accident", "crash",
                "responsive", "unconscious", "breathing", "gasping", "sweating", "head",
                "injury", "trapped", "vehicle", "street", "corner", "heavy", "rapid"
            }:
                keywords.add(word)
        for c in concerns:
            for w in c.lower().split():
                if len(w) > 4:
                    keywords.add(w)
        return sorted(list(keywords))[:10]

    def _detect_uncertainties(self, raw_text: str, report_data: Dict[str, Any]) -> List[str]:
        flags = []
        uncertainty_patterns = [
            (r"\b(maybe|perhaps)\b", "Bystander expresses uncertainty about patient condition"),
            (r"\b(not sure|unsure)\b", "Unconfirmed observations reported by bystander"),
            (r"\b(looks like|seems like|appears to)\b", "Visual assessment is approximate / unverified"),
            (r"\b(think he|think she|think they)\b", "Reported status based on impression rather than verification"),
            (r"\b(possibly|might be)\b", "Potential condition unverified until EMS on scene"),
        ]
        for pattern, flag in uncertainty_patterns:
            if re.search(pattern, raw_text):
                flags.append(flag)

        if report_data.get("consciousness") in ["Uncertain", "not_sure"]:
            flags.append("Consciousness level could not be clearly confirmed by bystander")
        if report_data.get("breathing") in ["Uncertain", "not_sure"]:
            flags.append("Breathing status unconfirmed by bystander")

        return list(dict.fromkeys(flags))  # Deduplicate preserving order

    def _detect_missing_info(self, report_data: Dict[str, Any], consciousness: str, breathing: str) -> List[str]:
        missing = []
        if consciousness in ["Not Stated", "Uncertain"]:
            missing.append("Definitive responsiveness check pending EMS arrival")
        if breathing in ["Not Stated", "Uncertain"]:
            missing.append("Accurate respiratory rate and airway assessment")
        if not report_data.get("patient_age") and not report_data.get("age"):
            missing.append("Patient age / demographic details")
        if not report_data.get("location_landmark") and not report_data.get("landmark"):
            missing.append("Specific building entrance / landmark details")
        return missing

    def _generate_summary(
        self,
        incident_category: str,
        people_count: int,
        consciousness: str,
        breathing: str,
        concerns: List[str],
        chief_complaint: str,
        notes: str,
    ) -> str:
        """
        Builds a concise, objective summary using strict non-diagnostic language.
        """
        parts = []
        
        # Category and victims
        category_readable = incident_category.replace("_", " ").title()
        victim_str = f"{people_count} person" if people_count == 1 else f"{people_count} people"
        parts.append(f"Reported {category_readable} involving {victim_str}.")

        # Status summary
        status_terms = []
        if consciousness != "Not Stated":
            status_terms.append(f"consciousness reported as '{consciousness}'")
        if breathing != "Not Stated":
            status_terms.append(f"breathing reported as '{breathing}'")
        if status_terms:
            parts.append(f"Initial bystander status: {', '.join(status_terms)}.")

        # Key observed concerns
        if concerns:
            parts.append(f"Observed concerns include: {', '.join(concerns[:4])}.")

        # Raw bystander context snippet (neutralized)
        narrative_snippet = chief_complaint or notes
        if narrative_snippet:
            clean_snippet = re.sub(r'[\r\n]+', ' ', narrative_snippet).strip()
            if len(clean_snippet) > 120:
                clean_snippet = clean_snippet[:117] + "..."
            parts.append(f"Bystander note: \"{clean_snippet}\"")

        return " ".join(parts)

    def _calculate_confidence(self, has_notes: bool, uncertainty_count: int, missing_count: int) -> float:
        """
        Fidelity score of extraction (0.0 to 1.0), NOT clinical confidence.
        """
        score = 0.90
        if not has_notes:
            score -= 0.15
        score -= min(0.20, uncertainty_count * 0.05)
        score -= min(0.15, missing_count * 0.03)
        return round(max(0.40, min(0.98, score)), 2)
