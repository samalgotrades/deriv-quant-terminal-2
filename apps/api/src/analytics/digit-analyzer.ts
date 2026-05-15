import type { DigitAnalysis, Tick } from "@dqt/shared";

export function analyzeDigits(ticks: Tick[]): DigitAnalysis {
  const counts = Array(10).fill(0) as number[];
  for (const tick of ticks) counts[tick.digit] += 1;

  const total = Math.max(ticks.length, 1);
  const expected = total / 10;
  const distribution = counts.map((count, digit) => ({
    digit,
    count,
    percentage: (count / total) * 100,
    heat: count > expected * 1.15 ? "hot" as const : count < expected * 0.85 ? "cold" as const : "neutral" as const
  }));

  const sorted = [...distribution].sort((a, b) => b.count - a.count);
  const even = ticks.filter((tick) => tick.digit % 2 === 0).length;
  const over = ticks.filter((tick) => tick.digit > 4).length;
  const repeats = repeatStats(ticks);

  return {
    windowSize: ticks.length,
    distribution,
    hotDigits: sorted.slice(0, 3).map((item) => item.digit),
    coldDigits: sorted.slice(-3).map((item) => item.digit),
    evenRatio: (even / total) * 100,
    oddRatio: ((ticks.length - even) / total) * 100,
    overRatio: (over / total) * 100,
    underRatio: ((ticks.length - over) / total) * 100,
    longestRepeat: repeats.longest,
    currentRepeat: repeats.current,
    tickVelocity: velocity(ticks)
  };
}

function repeatStats(ticks: Tick[]) {
  let longest = 0;
  let current = 0;
  let previous: number | undefined;

  for (const tick of ticks) {
    current = tick.digit === previous ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = tick.digit;
  }

  return { longest, current };
}

function velocity(ticks: Tick[]) {
  if (ticks.length < 2) return 0;
  const first = ticks[0];
  const last = ticks.at(-1)!;
  const seconds = Math.max((last.receivedAt - first.receivedAt) / 1000, 1);
  return ticks.length / seconds;
}
