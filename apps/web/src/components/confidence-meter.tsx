import type { Signal } from "@dqt/shared";

export function ConfidenceMeter({ signal }: { signal?: Signal }) {
  const confidence = signal?.confidence ?? 0;

  return (
    <div>
      <div className="relative h-4 overflow-hidden bg-ink">
        <div className="h-full bg-signal transition-all duration-500" style={{ width: `${confidence}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {Object.entries(signal?.scoreBreakdown ?? {}).map(([key, value]) => (
          <div key={key} className="bg-ink p-2">
            <p className="truncate text-[10px] uppercase text-slate-500">{key}</p>
            <p className="mt-1 font-mono text-sm text-white">{Number(value).toFixed(1)}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-4xl text-white">{confidence}%</p>
      <p className="text-sm text-slate-400">{signal?.confidenceLabel ?? "Waiting for sample"}</p>
    </div>
  );
}
