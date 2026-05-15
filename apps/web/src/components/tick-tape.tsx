import type { Tick } from "@dqt/shared";

export function TickTape({ ticks }: { ticks: Tick[] }) {
  return (
    <div className="border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Tick Tape</h2>
        <span className="text-xs text-slate-400">latest first</span>
      </div>
      <div className="grid max-h-[330px] gap-1 overflow-auto font-mono text-xs">
        {ticks.map((tick) => (
          <div key={`${tick.epoch}-${tick.receivedAt}`} className="grid grid-cols-[1fr_52px_32px] gap-2 bg-ink px-2 py-2">
            <span>{tick.price.toFixed(2)}</span>
            <span className="text-slate-400">{tick.symbol}</span>
            <span className="text-right text-signal">{tick.digit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
