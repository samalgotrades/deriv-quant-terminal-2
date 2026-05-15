import WebSocket from "ws";
import type { Tick } from "@dqt/shared";

type TickHandler = (tick: Tick) => void | Promise<void>;

type TickStreamOptions = {
  appId: string;
  symbol: string;
};

export class TickStreamEngine {
  private handlers = new Set<TickHandler>();
  private ws?: WebSocket;
  private simulator?: NodeJS.Timeout;
  private lastPrice = 1000;

  constructor(private readonly options: TickStreamOptions) {}

  onTick(handler: TickHandler) {
    this.handlers.add(handler);
  }

  start() {
    const url = `wss://ws.derivws.com/websockets/v3?app_id=${this.options.appId}`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      this.ws?.send(JSON.stringify({ ticks: this.options.symbol, subscribe: 1 }));
    });

    this.ws.on("message", (message) => {
      const parsed = JSON.parse(message.toString());
      if (!parsed.tick?.quote) return;

      this.emit({
        symbol: parsed.tick.symbol,
        price: Number(parsed.tick.quote),
        digit: this.extractDigit(parsed.tick.quote),
        epoch: Number(parsed.tick.epoch),
        receivedAt: Date.now()
      });
    });

    this.ws.on("error", () => this.startSimulator());
    this.ws.on("close", () => setTimeout(() => this.start(), 3000));

    setTimeout(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) this.startSimulator();
    }, 5000);
  }

  private startSimulator() {
    if (this.simulator) return;

    this.simulator = setInterval(() => {
      const impulse = (Math.random() - 0.5) * 1.2;
      this.lastPrice = Number((this.lastPrice + impulse).toFixed(2));
      this.emit({
        symbol: this.options.symbol,
        price: this.lastPrice,
        digit: this.extractDigit(this.lastPrice),
        epoch: Math.floor(Date.now() / 1000),
        receivedAt: Date.now()
      });
    }, 700);
  }

  private extractDigit(price: number | string) {
    const clean = String(price).replace(".", "");
    return Number(clean.at(-1) ?? 0);
  }

  private emit(tick: Tick) {
    for (const handler of this.handlers) void handler(tick);
  }
}
