export type MarketSymbol = "R_10" | "R_25" | "R_50" | "R_75" | "R_100";

export type Tick = {
  symbol: MarketSymbol | string;
  price: number;
  digit: number;
  epoch: number;
  receivedAt: number;
};

export type DigitStat = {
  digit: number;
  count: number;
  percentage: number;
  heat: "cold" | "neutral" | "hot";
};

export type DigitAnalysis = {
  windowSize: number;
  distribution: DigitStat[];
  hotDigits: number[];
  coldDigits: number[];
  evenRatio: number;
  oddRatio: number;
  overRatio: number;
  underRatio: number;
  longestRepeat: number;
  currentRepeat: number;
  tickVelocity: number;
};

export type SignalDirection = "EVEN" | "ODD" | "OVER" | "UNDER" | "DIGIT";
export type SignalConfidence = "Weak" | "Moderate" | "Strong" | "High Probability";

export type Signal = {
  id: string;
  symbol: string;
  direction: SignalDirection;
  targetDigit?: number;
  confidence: number;
  confidenceLabel: SignalConfidence;
  scoreBreakdown: {
    digitImbalance: number;
    tickVelocity: number;
    volatilityCompression: number;
    momentumShift: number;
    historicalFrequency: number;
  };
  volatility: "Compressed" | "Stable" | "Expanding";
  riskLevel: "Low" | "Moderate" | "Elevated" | "Blocked";
  rationale: string[];
  createdAt: number;
};

export type RiskState = {
  sessionPnl: number;
  trades: number;
  consecutiveLosses: number;
  martingaleDetected: boolean;
  overtradingDetected: boolean;
  cooldownUntil?: number;
  locked: boolean;
  warnings: string[];
};

export type DashboardSnapshot = {
  ticks: Tick[];
  analysis: DigitAnalysis;
  latestSignal?: Signal;
  risk: RiskState;
};

export const DERIV_MARKETS: MarketSymbol[] = ["R_10", "R_25", "R_50", "R_75", "R_100"];
