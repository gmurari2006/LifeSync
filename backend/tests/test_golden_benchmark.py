"""
Golden Benchmark Evaluation Suite (N=50) for LifeSync AI & Safety Red-Rules (Step 10).
Asserts:
1. Clinical entity extraction F1-Score >= 0.90
2. Zero-Tolerance Under-Triage on Red-Rule test cases (0.00% failure rate)
3. Reproducible local execution without external cloud dependencies
"""

import pytest
from app.ai.benchmark_dataset import GOLDEN_BENCHMARK_CASES
from scripts.evaluate_benchmark import calculate_metrics


def test_benchmark_dataset_integrity():
    """Assert the benchmark corpus contains exactly 50 curated cases across 5 clinical domains."""
    assert len(GOLDEN_BENCHMARK_CASES) == 50

    categories = set(c["ground_truth"]["incident_category"] for c in GOLDEN_BENCHMARK_CASES)
    assert "CARDIAC_CHEST_PAIN" in categories
    assert "TRAUMA_MVA" in categories
    assert "NEUROLOGICAL_DEFICIT" in categories
    assert "RESPIRATORY_DISTRESS" in categories
    assert "TOXICOLOGICAL_EXPOSURE" in categories


def test_golden_benchmark_f1_and_zero_under_triage():
    """
    Run evaluation across all N=50 synthetic emergency benchmark cases.
    Verifies:
    1. Zero-Tolerance Under-Triage Failure Rate == 0.00%
    2. Clinical Entity Extraction F1-Score >= 0.90
    """
    metrics = calculate_metrics(GOLDEN_BENCHMARK_CASES)

    print(f"\n[Golden Benchmark Results]")
    print(f"Total Cases: {metrics['total_cases']}")
    print(f"Critical Red Cases: {metrics['red_rule_cases']}")
    print(f"Under-Triage Violations: {metrics['under_triage_count']} ({metrics['under_triage_rate'] * 100.0:.2f}%)")
    print(f"Clinical Entity Precision: {metrics['precision']:.4f}")
    print(f"Clinical Entity Recall:    {metrics['recall']:.4f}")
    print(f"Clinical Entity F1-Score:  {metrics['f1_score']:.4f}")

    # Mandatory PRD Assertions
    assert metrics["under_triage_count"] == 0, f"Under-triage violations detected: {metrics['under_triage_count']}"
    assert metrics["under_triage_rate"] == 0.0, "Red-Rule under-triage must be strictly 0.00%"
    assert metrics["f1_score"] >= 0.90, f"Clinical Entity F1-Score must be >= 0.90, got {metrics['f1_score']:.4f}"
