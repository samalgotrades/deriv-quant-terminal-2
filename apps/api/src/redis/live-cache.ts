import type { Tick } from "@dqt/shared";

export class LiveCache {
  private readonly buffer: Tick[] = [];

  async push(tick: Tick) {
    this.buffer.push(tick);
    if (this.buffer.length > 1000) this.buffer.shift();
  }

  async latest(limit: 100 | 500 | 1000 | number = 100) {
    return this.buffer.slice(-limit);
  }
}
