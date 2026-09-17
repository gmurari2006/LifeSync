"""
LifeSync Golden Benchmark Evaluation Script (Reproducible N=50 Suite)
PRD v1.2.0 Section 6 Evaluation Benchmark CLI Runner.
"""

import sys
import os
import asyncio
from typing import Dict, Any, List, Tuple

# Ensure app package is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ai.benchmark_dataset import GOLDEN_BENCHMARK_CASES
from app.ai.providers.local import RuleBasedLocalAIProvider
from app.ai.rules import evaluate_red_rules, validate_and_sanitize_ai_output


def calculate_metrics(cases: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    if cases is None:
        cases = GOLDEN_BENCHMARK_CASES

    provider = RuleBasedLocalAIProvider()
    total_cases = len(cases)
    
    tp_slots = 0
    fp_slots = 0
    fn_slots = 0

    red_rule_cases = 0
    under_triage_count = 0
    over_triage_count = 0

    case_results = []

    for case in cases:
        case_id = case["case_id"]
        transcript = case["transcript"]
        gt = case["ground_truth"]

        # Run extraction
        loop = asyncio.new_event_loop()
        extracted = loop.run_until_complete(
            provider.structure_emergency_report(
                report_data={"additional_notes": transcript, "chief_complaint": ""},
                case_data={},
            )
        )
        loop.close()

        sanitized, _ = validate_and_sanitize_ai_output(extracted)
        is_red, rule_id, priority = evaluate_red_rules(sanitized, transcript)

        # Slot matching:
        # 1. Category
        if sanitized.get("incident_category") == gt.get("incident_category"):
            tp_slots += 1
        else:
            fp_slots += 1
            fn_slots += 1

        # 2. Consciousness
        if sanitized.get("consciousness") == gt.get("consciousness"):
            tp_slots += 1
        else:
            fp_slots += 1
            fn_slots += 1

        # 3. Breathing
        if sanitized.get("breathing") == gt.get("breathing"):
            tp_slots += 1
        else:
            fp_slots += 1
            fn_slots += 1

        # 4. Age (if in ground truth)
        if gt.get("patient_age") is not None:
            if sanitized.get("patient_age") == gt.get("patient_age"):
                tp_slots += 1
            else:
                fn_slots += 1

        # 5. Sex (if in ground truth)
        if gt.get("patient_sex") is not None:
            if sanitized.get("patient_sex") == gt.get("patient_sex"):
                tp_slots += 1
            else:
                fn_slots += 1

        # 6. Safety Under-Triage check
        gt_red = gt.get("red_rule_triggered", False)
        if gt_red:
            red_rule_cases += 1
            if not is_red or priority != "CRITICAL":
                under_triage_count += 1
        else:
            if is_red:
                over_triage_count += 1

        mismatches = []
        if sanitized.get("incident_category") != gt.get("incident_category"):
            mismatches.append(f"Cat: ext={sanitized.get('incident_category')} vs gt={gt.get('incident_category')}")
        if sanitized.get("consciousness") != gt.get("consciousness"):
            mismatches.append(f"Consc: ext={sanitized.get('consciousness')} vs gt={gt.get('consciousness')}")
        if sanitized.get("breathing") != gt.get("breathing"):
            mismatches.append(f"Breath: ext={sanitized.get('breathing')} vs gt={gt.get('breathing')}")
        if gt.get("patient_age") is not None and sanitized.get("patient_age") != gt.get("patient_age"):
            mismatches.append(f"Age: ext={sanitized.get('patient_age')} vs gt={gt.get('patient_age')}")
        if gt.get("patient_sex") is not None and sanitized.get("patient_sex") != gt.get("patient_sex"):
            mismatches.append(f"Sex: ext={sanitized.get('patient_sex')} vs gt={gt.get('patient_sex')}")
        if gt_red and (not is_red or priority != "CRITICAL"):
            mismatches.append(f"UNDER-TRIAGE: is_red={is_red}, prio={priority}, expected_prio={gt.get('expected_priority')}")

        if mismatches:
            print(f"[{case_id}] {', '.join(mismatches)}")

        case_results.append({
            "case_id": case_id,
            "category_match": sanitized.get("incident_category") == gt.get("incident_category"),
            "consciousness_match": sanitized.get("consciousness") == gt.get("consciousness"),
            "breathing_match": sanitized.get("breathing") == gt.get("breathing"),
            "red_rule_match": is_red == gt_red,
            "priority": priority,
            "expected_priority": gt.get("expected_priority"),
        })

    precision = tp_slots / (tp_slots + fp_slots) if (tp_slots + fp_slots) > 0 else 0.0
    recall = tp_slots / (tp_slots + fn_slots) if (tp_slots + fn_slots) > 0 else 0.0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    under_triage_rate = (under_triage_count / red_rule_cases) if red_rule_cases > 0 else 0.0

    return {
        "total_cases": total_cases,
        "red_rule_cases": red_rule_cases,
        "under_triage_count": under_triage_count,
        "under_triage_rate": under_triage_rate,
        "over_triage_count": over_triage_count,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "case_results": case_results,
    }


def main():
    print("=" * 80)
    print(" LIFESYNC GOLDEN BENCHMARK EVALUATION (N=50 FROZEN DATASET)")
    print(" PRD v1.2.0 Section 6 Safety & Accuracy Verification")
    print("=" * 80)

    results = calculate_metrics()

    print(f"\nTotal Evaluated Cases: {results['total_cases']}")
    print(f"Red-Rule Safety Critical Cases: {results['red_rule_cases']}")
    print(f"Under-Triage Incidents (Safety Violations): {results['under_triage_count']}")
    print(f"Under-Triage Failure Rate: {results['under_triage_rate'] * 100:.2f}% (Target: 0.00%)")
    print(f"Slot Precision: {results['precision']:.4f}")
    print(f"Slot Recall: {results['recall']:.4f}")
    print(f"Clinical Entity F1-Score: {results['f1_score']:.4f} (Target >= 0.9000)")
    print("=" * 80)

    if results["under_triage_count"] == 0 and results["f1_score"] >= 0.90:
        print(">>> RESULT: BENCHMARK PASSED ALL PRD TARGETS! <<<")
        sys.exit(0)
    else:
        print(">>> RESULT: BENCHMARK FAILED TARGETS! <<<")
        sys.exit(1)


if __name__ == "__main__":
    main()
