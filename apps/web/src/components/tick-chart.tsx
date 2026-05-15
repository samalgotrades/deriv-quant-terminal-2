import type { Tick } from "@dqt/shared";

export function TickChart({ ticks }: { ticks: Tick[] }) {
  const prices = ticks.map((tick) => tick.price);
  const min = Math.min(...prices, 0);
  const max = Math.max(...prices, 1);
  const range = Math.max(max - min, 1);
  const points = ticks.map((tick, index) => {
    const x = ticks.length <= 1 ? 0 : (index / (ticks.length - 1)) * 100;
    const y = 100 - ((tick.price - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="h-[320px] bg-ink p-3">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <polyline points={points} fill="none" stroke="#39ffb6" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
