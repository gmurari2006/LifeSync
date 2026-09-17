"""
LifeSync Golden Benchmark Dataset (N=50 Frozen Ground-Truth Test Cases)
PRD v1.2.0 Section 6 Evaluation Benchmark Corpus.

Clinical Domains:
- 15 Cardiac / STEMI / Acute Coronary Syndrome
- 12 Trauma / Severe Polytrauma / MVA / Hemorrhage
- 10 Stroke / Acute Ischemic / Neurological
- 7 Pediatric Airway / Pediatric Trauma / Status Asthmaticus
- 6 Respiratory Failure / Toxicological / Anaphylaxis

Target Metric Goals:
- Clinical Entity Extraction F1-Score >= 0.90
- Zero-Tolerance Under-Triage on Red-Rule Safety Test Cases (0.00% failure rate)
"""

from typing import List, Dict, Any

GOLDEN_BENCHMARK_CASES: List[Dict[str, Any]] = [

    # =========================================================================
    # DOMAIN 1: CARDIAC / STEMI / ACUTE CORONARY SYNDROME (Cases 1 - 15)
    # =========================================================================
    {
        "case_id": "BENCH-CARD-01",
        "transcript": "My 58 year old father has crushing central chest pain radiating to his left arm and jaw. He is sweating heavily and struggling to breathe. Started 25 minutes ago.",
        "ground_truth": {
            "patient_age": 58,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Crushing central chest pain radiating to left arm and jaw",
            "key_symptoms": ["chest pain", "diaphoresis", "sweating", "radiating pain", "dyspnea", "arm pain", "jaw pain"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-02",
        "transcript": "62 year old female with acute onset severe retrosternal pressure, diaphoresis, and nausea while resting. Onset 40 minutes ago.",
        "ground_truth": {
            "patient_age": 62,
            "patient_sex": "Female",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Severe retrosternal pressure, diaphoresis, and nausea",
            "key_symptoms": ["chest pressure", "diaphoresis", "sweating", "nausea"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-03",
        "transcript": "51 year old male sudden collapse at grocery store, unconscious, gasping for breath, pale and cool to touch.",
        "ground_truth": {
            "patient_age": 51,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Sudden collapse, unresponsive, gasping",
            "key_symptoms": ["collapse", "unresponsive", "unconscious", "gasping", "cyanosis"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-04",
        "transcript": "70 year old woman with sudden severe epigastric chest burning, heavy cold sweats, and profound dizziness for 1 hour.",
        "ground_truth": {
            "patient_age": 70,
            "patient_sex": "Female",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Severe epigastric chest burning, cold sweats, and dizziness",
            "key_symptoms": ["chest burning", "sweating", "cold sweats", "dizziness"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-05",
        "transcript": "45 year old male experiencing sudden heavy elephant on chest sensation, left shoulder ache, and rapid heart palpitations.",
        "ground_truth": {
            "patient_age": 45,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Heavy chest sensation, shoulder ache, and palpitations",
            "key_symptoms": ["chest pressure", "shoulder ache", "palpitations"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-06",
        "transcript": "66 year old male with known coronary stent having recurrent substernal tightness, sweating profusely, took sublingual nitro with no relief.",
        "ground_truth": {
            "patient_age": 66,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Recurrent substernal tightness and profuse sweating",
            "key_symptoms": ["substernal tightness", "chest tightness", "sweating", "nitro refractory"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-07",
        "transcript": "55 year old female diabetic presenting with sudden extreme fatigue, acute breathlessness, and central chest heaviness.",
        "ground_truth": {
            "patient_age": 55,
            "patient_sex": "Female",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Acute breathlessness, central chest heaviness, extreme fatigue",
            "key_symptoms": ["breathlessness", "chest heaviness", "chest pain", "fatigue"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-08",
        "transcript": "39 year old male marathon runner collapsed post-race, pulseless bystander CPR in progress with AED attached.",
        "ground_truth": {
            "patient_age": 39,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Unresponsive",
            "breathing": "Absent",
            "chief_complaint": "Cardiac arrest collapse post-race, CPR ongoing",
            "key_symptoms": ["collapse", "pulseless", "cpr", "arrest", "unresponsive"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-09",
        "transcript": "64 year old female reporting sharp tearing chest pain radiating straight into her back between shoulder blades with syncope.",
        "ground_truth": {
            "patient_age": 64,
            "patient_sex": "Female",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Sharp tearing chest pain radiating to back with syncope",
            "key_symptoms": ["tearing pain", "chest pain", "back pain", "syncope"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-10",
        "transcript": "59 year old male with mild intermittent left chest discomfort during brisk walking, no shortness of breath, fully alert and seated.",
        "ground_truth": {
            "patient_age": 59,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Intermittent left chest discomfort on exertion",
            "key_symptoms": ["chest discomfort", "exertional"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "HIGH",
        }
    },
    {
        "case_id": "BENCH-CARD-11",
        "transcript": "72 year old male with acute orthopnea, waking up gasping for air, bilateral leg swelling, and pink frothy sputum.",
        "ground_truth": {
            "patient_age": 72,
            "patient_sex": "Male",
            "incident_category": "RESPIRATORY_DISTRESS",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Acute pulmonary edema, severe orthopnea and frothy sputum",
            "key_symptoms": ["orthopnea", "gasping", "frothy sputum", "pulmonary edema", "dyspnea"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-12",
        "transcript": "48 year old male with sudden crushing chest pressure and grey ashen complexion while driving, pulled over by passenger.",
        "ground_truth": {
            "patient_age": 48,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Sudden crushing chest pressure with ashen skin",
            "key_symptoms": ["chest pressure", "chest pain", "pallor", "sweating"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-13",
        "transcript": "61 year old female with acute squeezing chest pain for 30 minutes, clammy skin, and vomiting.",
        "ground_truth": {
            "patient_age": 61,
            "patient_sex": "Female",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Acute squeezing chest pain, clamminess, and vomiting",
            "key_symptoms": ["squeezing pain", "chest pain", "clammy", "vomiting"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-CARD-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-CARD-14",
        "transcript": "53 year old male feeling chest fullness and rapid irregular heartbeat for 3 hours, talking comfortably, blood pressure feels fine.",
        "ground_truth": {
            "patient_age": 53,
            "patient_sex": "Male",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Chest fullness and irregular rapid heartbeat",
            "key_symptoms": ["chest fullness", "palpitations", "irregular heartbeat"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "HIGH",
        }
    },
    {
        "case_id": "BENCH-CARD-15",
        "transcript": "78 year old female sudden cardiac collapse at dining table, unresponsive with no pulse, daughter starting chest compressions.",
        "ground_truth": {
            "patient_age": 78,
            "patient_sex": "Female",
            "incident_category": "CARDIAC_CHEST_PAIN",
            "consciousness": "Unresponsive",
            "breathing": "Absent",
            "chief_complaint": "Unresponsive sudden cardiac collapse, CPR started",
            "key_symptoms": ["collapse", "unresponsive", "unconscious", "pulseless", "cpr"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },

    # =========================================================================
    # DOMAIN 2: TRAUMA / MULTI-VEHICLE / HEMORRHAGE / BURNS (Cases 16 - 27)
    # =========================================================================
    {
        "case_id": "BENCH-TRAUM-16",
        "transcript": "High-speed highway collision on Interstate 95. 34 year old male driver pinned inside car, unconscious with severe bleeding from forehead laceration and deformed femur.",
        "ground_truth": {
            "patient_age": 34,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Driver trapped in high-speed MVA, unconscious with severe bleeding and femur deformity",
            "key_symptoms": ["collision", "pinned", "trapped", "extrication", "bleeding", "unconscious", "fracture"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-17",
        "transcript": "25 year old male motorcycle crash victim with arterial spurting bleeding from right thigh, bystander applied makeshift belt tourniquet.",
        "ground_truth": {
            "patient_age": 25,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Motorcycle crash with severe arterial bleeding from thigh",
            "key_symptoms": ["motorcycle", "crash", "arterial bleeding", "massive hemorrhage", "tourniquet"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-TRAUMA-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-18",
        "transcript": "42 year old construction worker fell 4 stories from scaffolding onto concrete, unresponsive, unequal pupils, visible compound skull fracture.",
        "ground_truth": {
            "patient_age": 42,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Four-story fall, unresponsive with skull fracture and unequal pupils",
            "key_symptoms": ["fall", "unresponsive", "unconscious", "skull fracture", "head trauma"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-19",
        "transcript": "29 year old male stabbed in left lower chest, active bleeding, pale and confused, shallow rapid breathing.",
        "ground_truth": {
            "patient_age": 29,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Stab wound to chest with active bleeding and shock signs",
            "key_symptoms": ["stab", "penetrating", "chest wound", "active bleeding", "shock"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-TRAUMA-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-20",
        "transcript": "19 year old male pedestrian struck by bus at 40mph, thrown 20 feet, unresponsive with flail chest segment on right side.",
        "ground_truth": {
            "patient_age": 19,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Pedestrian struck at high speed, unresponsive with flail chest",
            "key_symptoms": ["pedestrian struck", "flail chest", "unresponsive", "unconscious", "trauma"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-21",
        "transcript": "36 year old female trapped in vehicle rollover, alert and crying, severe bilateral open tib-fib fractures, no head strike reported.",
        "ground_truth": {
            "patient_age": 36,
            "patient_sex": "Female",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Vehicle rollover with open bilateral lower leg fractures",
            "key_symptoms": ["rollover", "trapped", "open fracture", "tib-fib fracture"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-TRAUMA-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-22",
        "transcript": "52 year old factory technician caught in industrial chemical boiler explosion, 60% full-thickness body surface burns, wheezing and facial singeing.",
        "ground_truth": {
            "patient_age": 52,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Major thermal explosion burns over 60% TBSA with inhalational airway burn",
            "key_symptoms": ["explosion", "burns", "inhalational burn", "wheezing", "facial singeing"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-TRAUMA-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-23",
        "transcript": "22 year old female cyclist collided with opening car door, landed on shoulder, alert and conscious with visible clavicle deformity and scrapes.",
        "ground_truth": {
            "patient_age": 22,
            "patient_sex": "Female",
            "incident_category": "TRAUMA_GENERAL",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Cyclist shoulder injury with clavicle deformity and road rash",
            "key_symptoms": ["cyclist", "clavicle", "deformity", "abrasions"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "MODERATE",
        }
    },
    {
        "case_id": "BENCH-TRAUM-24",
        "transcript": "47 year old male operator with traumatic partial arm amputation in industrial conveyor belt, tourniquet applied, conscious and screaming.",
        "ground_truth": {
            "patient_age": 47,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Alert",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Traumatic upper limb amputation with tourniquet in place",
            "key_symptoms": ["amputation", "industrial injury", "tourniquet", "massive hemorrhage"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-TRAUMA-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-25",
        "transcript": "31 year old male gunshot wound to right flank, exit wound in abdomen, active hemorrhage, blood pressure dropping.",
        "ground_truth": {
            "patient_age": 31,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Gunshot wound through flank and abdomen with active internal hemorrhage",
            "key_symptoms": ["gunshot", "penetrating", "abdominal trauma", "hemorrhage", "shock"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-TRAUMA-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TRAUM-26",
        "transcript": "68 year old female tripped over carpet at home, isolated wrist swelling and minor bruising, walking around comfortably.",
        "ground_truth": {
            "patient_age": 68,
            "patient_sex": "Female",
            "incident_category": "TRAUMA_GENERAL",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Mechanical ground-level trip with isolated wrist contusion",
            "key_symptoms": ["trip", "fall", "wrist swelling", "bruising"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "LOW",
        }
    },
    {
        "case_id": "BENCH-TRAUM-27",
        "transcript": "28 year old male ejected from open convertible during high-speed spinout, found in ditch 30 feet away, non-responsive, gasping.",
        "ground_truth": {
            "patient_age": 28,
            "patient_sex": "Male",
            "incident_category": "TRAUMA_MVA",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Vehicle ejection with severe polytrauma, unresponsive with agonal breathing",
            "key_symptoms": ["ejection", "unresponsive", "unconscious", "gasping", "polytrauma"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },

    # =========================================================================
    # DOMAIN 3: STROKE / NEUROLOGICAL EMERGENCIES (Cases 28 - 37)
    # =========================================================================
    {
        "case_id": "BENCH-STROK-28",
        "transcript": "67 year old female has sudden right-sided facial droop, complete right arm weakness unable to lift, and garbled slurred speech. Onset 35 minutes ago.",
        "ground_truth": {
            "patient_age": 67,
            "patient_sex": "Female",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Acute right facial droop, hemiplegia, and expressive aphasia",
            "key_symptoms": ["facial droop", "arm weakness", "hemiparesis", "slurred speech", "stroke", "aphasia"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-STROKE-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-STROK-29",
        "transcript": "74 year old male sudden acute loss of vision in left eye and severe left-sided body numbness, last known normal was 20 minutes ago at breakfast.",
        "ground_truth": {
            "patient_age": 74,
            "patient_sex": "Male",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Sudden vision loss and hemibody numbness",
            "key_symptoms": ["vision loss", "numbness", "hemibody", "stroke", "acute onset"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-STROKE-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-STROK-30",
        "transcript": "56 year old female executive sudden thunderclap headache reaching maximum 10/10 severity in seconds, now vomiting and becoming progressively drowsy.",
        "ground_truth": {
            "patient_age": 56,
            "patient_sex": "Female",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Severe thunderclap headache with vomiting and decreasing level of consciousness",
            "key_symptoms": ["thunderclap headache", "worst headache", "vomiting", "drowsy", "subarachnoid"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-STROKE-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-STROK-31",
        "transcript": "81 year old male found on bedroom floor by caregiver, unable to speak words, right arm flaccid, right leg not moving. Last seen well 2 hours ago.",
        "ground_truth": {
            "patient_age": 81,
            "patient_sex": "Male",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Dense right hemiplegia and global aphasia found down",
            "key_symptoms": ["hemiplegia", "aphasia", "arm flaccid", "stroke", "weakness"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-STROKE-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-STROK-32",
        "transcript": "49 year old male sudden acute ataxia, vertigo, uncontrollable nystagmus, and inability to stand up or swallow. Onset 15 minutes ago.",
        "ground_truth": {
            "patient_age": 49,
            "patient_sex": "Male",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Acute cerebellar syndrome with ataxia, vertigo, and dysphagia",
            "key_symptoms": ["ataxia", "vertigo", "dysphagia", "swallow difficulty", "stroke"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-STROKE-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-STROK-33",
        "transcript": "33 year old female with history of epilepsy having continuous generalized tonic-clonic seizure for 8 minutes without regaining consciousness (status epilepticus).",
        "ground_truth": {
            "patient_age": 33,
            "patient_sex": "Female",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Continuous status epilepticus seizure exceeding 8 minutes",
            "key_symptoms": ["seizure", "convulsions", "status epilepticus", "unresponsive", "unconscious"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-STROK-34",
        "transcript": "63 year old female suddenly confused, speaking incomprehensible jargon sentences, unable to follow commands, left mouth corner drooping.",
        "ground_truth": {
            "patient_age": 63,
            "patient_sex": "Female",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Acute receptive aphasia and left facial asymmetry",
            "key_symptoms": ["aphasia", "jargon", "confusion", "facial droop", "stroke"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-STROKE-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-STROK-35",
        "transcript": "70 year old male had temporary 5-minute left hand weakness and slurred speech which has now completely resolved. Patient feels normal now.",
        "ground_truth": {
            "patient_age": 70,
            "patient_sex": "Male",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Resolved transient ischemic attack (TIA) symptoms",
            "key_symptoms": ["transient weakness", "slurred speech", "resolved", "tia"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "HIGH",
        }
    },
    {
        "case_id": "BENCH-STROK-36",
        "transcript": "54 year old female post-seizure, currently in post-ictal sleep, breathing regularly and groggy but responding to voice.",
        "ground_truth": {
            "patient_age": 54,
            "patient_sex": "Female",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Post-ictal state following single self-limited 2-minute seizure",
            "key_symptoms": ["seizure", "post-ictal", "drowsy", "recovering"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "HIGH",
        }
    },
    {
        "case_id": "BENCH-STROK-37",
        "transcript": "76 year old male sudden acute right hemisensory loss, right homonymous hemianopia, and severe word-finding difficulty starting 50 minutes ago.",
        "ground_truth": {
            "patient_age": 76,
            "patient_sex": "Male",
            "incident_category": "NEUROLOGICAL_DEFICIT",
            "consciousness": "Responding",
            "breathing": "Normal",
            "chief_complaint": "Acute cortical stroke syndrome with visual field deficit and aphasia",
            "key_symptoms": ["hemianopia", "aphasia", "hemisensory loss", "stroke", "word finding"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-STROKE-01",
            "expected_priority": "CRITICAL",
        }
    },

    # =========================================================================
    # DOMAIN 4: PEDIATRIC EMERGENCIES (Cases 38 - 44)
    # =========================================================================
    {
        "case_id": "BENCH-PEDS-38",
        "transcript": "6 year old male with severe asthma exacerbation, loud inspiratory and expiratory wheezing, intercostal retractions, unable to speak full sentences, lips turning pale.",
        "ground_truth": {
            "patient_age": 6,
            "patient_sex": "Male",
            "incident_category": "PEDIATRIC_EMERGENCY",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Pediatric status asthmaticus with severe retractions and impending respiratory failure",
            "key_symptoms": ["asthma", "wheezing", "retractions", "respiratory distress", "pediatric"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-PEDS-39",
        "transcript": "2 year old female choking on raw grape, high-pitched stridor, silent coughing, turning blue around mouth, conscious but terrified.",
        "ground_truth": {
            "patient_age": 2,
            "patient_sex": "Female",
            "incident_category": "PEDIATRIC_EMERGENCY",
            "consciousness": "Alert",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Pediatric foreign body airway obstruction with cyanosis",
            "key_symptoms": ["choking", "foreign body", "stridor", "cyanosis", "airway obstruction"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-PEDS-40",
        "transcript": "8 year old female pedestrian struck by car in school zone, unconscious on road with scalp hematoma and bleeding from left ear canal.",
        "ground_truth": {
            "patient_age": 8,
            "patient_sex": "Female",
            "incident_category": "PEDIATRIC_EMERGENCY",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Pediatric auto vs pedestrian collision with base of skull fracture signs",
            "key_symptoms": ["pedestrian", "unconscious", "unresponsive", "ear bleeding", "head trauma"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-PEDS-41",
        "transcript": "18 month old male high fever 104F having febrile tonic-clonic seizure for 3 minutes, eyes rolled back, twitching limbs.",
        "ground_truth": {
            "patient_age": 1,
            "patient_sex": "Male",
            "incident_category": "PEDIATRIC_EMERGENCY",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Active complex febrile seizure in infant",
            "key_symptoms": ["febrile seizure", "fever", "convulsions", "twitching", "pediatric"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-PEDS-42",
        "transcript": "4 year old male pulled from backyard swimming pool after 2 minute submersion, coughing water, lethargic, shivering violently with blue lips.",
        "ground_truth": {
            "patient_age": 4,
            "patient_sex": "Male",
            "incident_category": "PEDIATRIC_EMERGENCY",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Non-fatal pediatric submersion with hypothermia and respiratory compromise",
            "key_symptoms": ["drowning", "submersion", "cyanosis", "coughing water", "lethargic"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-PEDS-43",
        "transcript": "10 year old male fell from monkey bars at school playground, isolated forearm deformity, alert, crying loudly, no other complaints.",
        "ground_truth": {
            "patient_age": 10,
            "patient_sex": "Male",
            "incident_category": "PEDIATRIC_EMERGENCY",
            "consciousness": "Alert",
            "breathing": "Normal",
            "chief_complaint": "Closed pediatric forearm fracture from fall",
            "key_symptoms": ["playground fall", "forearm fracture", "crying", "deformity"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "MODERATE",
        }
    },
    {
        "case_id": "BENCH-PEDS-44",
        "transcript": "3 year old female with barking seal-like cough, harsh inspiratory stridor at rest, and fever, sitting up in mother's arms.",
        "ground_truth": {
            "patient_age": 3,
            "patient_sex": "Female",
            "incident_category": "PEDIATRIC_EMERGENCY",
            "consciousness": "Alert",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Severe croup with resting stridor and respiratory distress",
            "key_symptoms": ["croup", "barking cough", "stridor at rest", "fever"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },

    # =========================================================================
    # DOMAIN 5: RESPIRATORY / TOXICOLOGY / ANAPHYLAXIS (Cases 45 - 50)
    # =========================================================================
    {
        "case_id": "BENCH-RESP-45",
        "transcript": "24 year old female accidental peanut exposure at bakery, acute facial hives, severe lip and tongue swelling, wheezing, and dizzy.",
        "ground_truth": {
            "patient_age": 24,
            "patient_sex": "Female",
            "incident_category": "RESPIRATORY_DISTRESS",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Acute severe anaphylaxis with angioedema and bronchospasm",
            "key_symptoms": ["anaphylaxis", "angioedema", "tongue swelling", "wheezing", "hives", "allergy"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TOX-46",
        "transcript": "35 year old male intentional overdose of 40 opioid prescription pills, pinpoint pupils, unresponsive, respiratory rate 4 breaths per minute.",
        "ground_truth": {
            "patient_age": 35,
            "patient_sex": "Male",
            "incident_category": "TOXICOLOGICAL_EXPOSURE",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Massive opioid overdose with severe respiratory depression and pinpoint pupils",
            "key_symptoms": ["overdose", "opioid", "pinpoint pupils", "respiratory depression", "unresponsive"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-RESP-47",
        "transcript": "65 year old male with end-stage COPD acute severe exacerbation, tripod positioning, cyanotic nail beds, unable to speak, oxygen concentrator failed.",
        "ground_truth": {
            "patient_age": 65,
            "patient_sex": "Male",
            "incident_category": "RESPIRATORY_DISTRESS",
            "consciousness": "Responding",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Acute severe COPD exacerbation with hypoxic respiratory failure",
            "key_symptoms": ["copd", "tripod position", "cyanosis", "hypoxia", "severe breathlessness"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-TOX-48",
        "transcript": "41 year old female worker exposed to chlorine gas leak in enclosed maintenance room, severe coughing, chemical eye burning, and hemoptysis.",
        "ground_truth": {
            "patient_age": 41,
            "patient_sex": "Female",
            "incident_category": "TOXICOLOGICAL_EXPOSURE",
            "consciousness": "Alert",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Toxic chlorine gas inhalation injury with chemical pneumonitis",
            "key_symptoms": ["chlorine gas", "toxic inhalation", "chemical burn", "hemoptysis", "coughing"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-RESP-01",
            "expected_priority": "CRITICAL",
        }
    },
    {
        "case_id": "BENCH-RESP-49",
        "transcript": "21 year old male tall and thin sudden acute pleuritic right-sided chest pain and sudden shortness of breath while gaming at computer.",
        "ground_truth": {
            "patient_age": 21,
            "patient_sex": "Male",
            "incident_category": "RESPIRATORY_DISTRESS",
            "consciousness": "Alert",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Spontaneous pneumothorax with acute pleuritic pain and dyspnea",
            "key_symptoms": ["pleuritic pain", "pneumothorax", "sudden dyspnea", "chest pain"],
            "red_rule_triggered": False,
            "expected_rule_id": None,
            "expected_priority": "HIGH",
        }
    },
    {
        "case_id": "BENCH-TOX-50",
        "transcript": "50 year old male found in sealed garage with car engine running, unresponsive with cherry-red skin, heavy gasping breaths.",
        "ground_truth": {
            "patient_age": 50,
            "patient_sex": "Male",
            "incident_category": "TOXICOLOGICAL_EXPOSURE",
            "consciousness": "Unresponsive",
            "breathing": "Difficulty Breathing",
            "chief_complaint": "Severe carbon monoxide poisoning with coma and agonal respiration",
            "key_symptoms": ["carbon monoxide", "car exhaust", "cherry-red skin", "unresponsive", "coma"],
            "red_rule_triggered": True,
            "expected_rule_id": "RULE-UNRESP-01",
            "expected_priority": "CRITICAL",
        }
    },
]

BENCHMARK_CASES = GOLDEN_BENCHMARK_CASES

