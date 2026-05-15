import type { Signal } from "@dqt/shared";

export class TelegramAlertService {
  async sendSignal(signal: Signal) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const text = [
      `${signal.symbol} SIGNAL`,
      `Direction: ${signal.direction}${signal.targetDigit !== undefined ? ` ${signal.targetDigit}` : ""}`,
      `Confidence: ${signal.confidence}%`,
      `Volatility: ${signal.volatility}`,
      `Risk Level: ${signal.riskLevel}`
    ].join("\n");

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    }).catch(() => undefined);
  }
}
