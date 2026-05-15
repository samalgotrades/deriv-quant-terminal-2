import type { RiskState } from "@dqt/shared";

export class RiskEngine {
  private state: RiskState = {
    sessionPnl: 0,
    trades: 0,
    consecutiveLosses: 0,
    martingaleDetected: false,
    overtradingDetected: false,
    locked: false,
    warnings: []
  };

  current() {
    const now = Date.now();
    const cooldownActive = this.state.cooldownUntil ? this.state.cooldownUntil > now : false;
    const warnings = [
      this.state.sessionPnl <= -50 ? "Session stop-loss threshold reached." : "",
      this.state.martingaleDetected ? "Martingale progression detected." : "",
      this.state.overtradingDetected ? "Rapid entries detected; cooldown recommended." : "",
      cooldownActive ? "Cooldown is active." : ""
    ].filter(Boolean);

    return {
      ...this.state,
      locked: this.state.sessionPnl <= -50 || cooldownActive,
      warnings
    };
  }

  recordTrade(stake: number, pnl: number, previousStake?: number) {
    const loss = pnl < 0;
    this.state.sessionPnl += pnl;
    this.state.trades += 1;
    this.state.consecutiveLosses = loss ? this.state.consecutiveLosses + 1 : 0;
    this.state.martingaleDetected = Boolean(previousStake && stake >= previousStake * 1.8 && loss);
    this.state.overtradingDetected = this.state.trades >= 8;
    if (this.state.consecutiveLosses >= 3) this.state.cooldownUntil = Date.now() + 5 * 60 * 1000;
  }
}
