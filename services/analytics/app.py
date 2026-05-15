from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass
class ProbabilityResult:
    confidence: float
    explanation: str


def score_digits(digits: Iterable[int]) -> ProbabilityResult:
    sample = list(digits)
    if not sample:
        return ProbabilityResult(confidence=0.0, explanation="No ticks supplied.")

    counts = [sample.count(digit) for digit in range(10)]
    imbalance = max(counts) - min(counts)
    confidence = min(95.0, 45.0 + imbalance * 2.5)
    return ProbabilityResult(
        confidence=confidence,
        explanation="Baseline statistical score. Replace with trained XGBoost model in Phase 2.",
    )
