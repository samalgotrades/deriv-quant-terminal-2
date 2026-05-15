import type { Signal, Tick } from "@dqt/shared";

export class TickStore {
  private readonly tickBuffer: Tick[] = [];
  private readonly signalBuffer: Signal[] = [];

  saveTick(tick: Tick) {
    this.tickBuffer.push(tick);
    if (this.tickBuffer.length > 10000) this.tickBuffer.shift();
  }

  saveSignal(signal: Signal) {
    this.signalBuffer.push(signal);
    if (this.signalBuffer.length > 1000) this.signalBuffer.shift();
  }

  ticks() {
    return this.tickBuffer;
  }

  signals() {
    return this.signalBuffer;
  }
}
