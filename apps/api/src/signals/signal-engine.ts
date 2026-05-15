import { nanoid } from "nanoid";
import type { DigitAnalysis, RiskState, Signal, SignalConfidence, Tick } from "@dqt/shared";

export function generateSignal(ticks: Tick[], analysis: DigitAnalysis, risk: RiskState): Signal {
  const digitImbalance = clamp(Math.abs(analysis.evenRatio - 50) * 1.4, 0, 20);
  const tickVelocity = clamp(analysis.tickVelocity * 5, 0, 18);
  const volatilityCompression = compressionScore(ticks);
  const momentumShift = momentumScore(ticks);
  const historicalFrequency = clamp(maxDigitDeviation(analysis) * 1.2, 0, 20);
  const rawScore = 35 + digitImbalance + tickVelocity + volatilityCompression + momentumShift + historicalFrequency;
  const confidence = Math.round(clamp(rawScore - (risk.locked ? 35 : 0), 0, 96));
  const direction = chooseDirection(analysis);

  return {
    id: nanoid(),
    symbol: ticks.at(-1)?.symbol ?? "R_100",
    direction,
    targetDigit: direction === "DIGIT" ? analysis.coldDigits[0] : undefined,
    confidence,
    confidenceLabel: label(confidence),
    scoreBreakdown: {
      digitImbalance,
      tickVelocity,
      volatilityCompression,
      momentumShift,
      historicalFrequency
    },
    volatility: volatilityCompression > 14 ? "Compressed" : momentumShift > 13 ? "Expanding" : "Stable",
    riskLevel: risk.locked ? "Blocked" : confidence > 84 ? "Elevated" : confidence > 72 ? "Moderate" : "Low",
    rationale: rationale(analysis, confidence, risk),
    createdAt: Date.now()
  };
}

function chooseDirection(analysis: DigitAnalysis): Signal["direction"] {
  if (analysis.evenRatio < 44) return "EVEN";
  if (analysis.evenRatio > 56) return "ODD";
  if (analysis.overRatio < 44) return "OVER";
  if (analysis.overRatio > 56) return "UNDER";
  return "DIGIT";
}

function label(score: number): SignalConfidence {
  if (score >= 85) return "High Probability";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Moderate";
  return "Weak";
}

function compressionScore(ticks: Tick[]) {
  const recent = ticks.slice(-40);
  if (recent.length < 10) return 0;
  const prices = recent.map((tick) => tick.price);
  const range = Math.max(...prices) - Math.min(...prices);
  return clamp(18 - range * 8, 0, 18);
}

function momentumScore(ticks: Tick[]) {
  const recent = ticks.slice(-20);
  if (recent.length < 20) return 0;
  const firstHalf = average(recent.slice(0, 10).map((tick) => tick.price));
  const secondHalf = average(recent.slice(10).map((tick) => tick.price));
  return clamp(Math.abs(secondHalf - firstHalf) * 12, 0, 16);
}

function maxDigitDeviation(analysis: DigitAnalysis) {
  return Math.max(...analysis.distribution.map((item) => Math.abs(item.percentage - 10)));
}

function rationale(analysis: DigitAnalysis, confidence: number, risk: RiskState) {
  const notes = [
    `Even/Odd spread is ${Math.abs(analysis.evenRatio - analysis.oddRatio).toFixed(1)}%.`,
    `Hot digits: ${analysis.hotDigits.join(", ")}; cold digits: ${analysis.coldDigits.join(", ")}.`,
    `Current repeat run is ${analysis.currentRepeat} tick${analysis.currentRepeat === 1 ? "" : "s"}.`
  ];

  if (confidence < 65) notes.push("Signal is below premium alert threshold.");
  if (risk.warnings.length) notes.push(...risk.warnings);
  return notes;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
