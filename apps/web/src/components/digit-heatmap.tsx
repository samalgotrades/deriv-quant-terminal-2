import type { DigitAnalysis } from "@dqt/shared";

export function DigitHeatmap({ analysis }: { analysis: DigitAnalysis }) {
  return (
    <div className="border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Digit Distribution Heatmap</h2>
        <span className="font-mono text-xs text-slate-400">{analysis.windowSize} window</span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {analysis.distribution.map((item) => (
          <div
            key={item.digit}
            className={`min-h-24 border p-3 ${
              item.heat === "hot"
                ? "border-signal/60 bg-signal/10"
                : item.heat === "cold"
                  ? "border-danger/50 bg-danger/10"
                  : "border-line bg-ink"
            }`}
          >
            <p className="font-mono text-2xl text-white">{item.digit}</p>
            <p className="mt-3 font-mono text-sm text-slate-300">{item.percentage.toFixed(1)}%</p>
            <p className="text-xs text-slate-500">{item.count} hits</p>
          </div>
        ))}
      </div>
    </div>
  );
}
