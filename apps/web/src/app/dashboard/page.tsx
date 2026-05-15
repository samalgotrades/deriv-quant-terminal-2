"use client";

import { Activity, BarChart3, Bell, Gauge, History, Settings, ShieldAlert, Sigma, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useLiveDashboard } from "@/hooks/use-live-dashboard";
import { ConfidenceMeter } from "@/components/confidence-meter";
import { DigitHeatmap } from "@/components/digit-heatmap";
import { MetricTile } from "@/components/metric-tile";
import { TickChart } from "@/components/tick-chart";
import { TickTape } from "@/components/tick-tape";

const nav = [
  ["Markets", BarChart3],
  ["Signals", Zap],
  ["Digit Analyzer", Sigma],
  ["Replay", History],
  ["Risk Tools", ShieldAlert],
  ["Settings", Settings]
] as const;

export default function DashboardPage() {
  const { snapshot, connected } = useLiveDashboard();
  const signal = snapshot.latestSignal;
  const analysis = snapshot.analysis;

  return (
    <main className="min-h-screen bg-ink text-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="border-b border-line bg-panel px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center border border-signal/40 bg-signal/10 text-signal">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">QuantDigits</p>
              <p className="text-xs text-slate-400">Deriv Terminal</p>
            </div>
          </div>
          <nav className="grid gap-1">
            {nav.map(([label, Icon], index) => (
              <button
                key={label}
                className={`flex items-center gap-3 px-3 py-2 text-left text-sm transition ${
                  index === 0 ? "bg-panel2 text-white" : "text-slate-400 hover:bg-panel2 hover:text-slate-100"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h1 className="text-xl font-semibold tracking-normal">R_100 Live Intelligence</h1>
              <p className="text-sm text-slate-400">Transparent probability scoring across rolling tick windows.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 ${connected ? "bg-signal" : "bg-danger"}`} />
              <span className="text-slate-300">{connected ? "Live socket" : "Reconnecting"}</span>
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="Tick Velocity" value={`${analysis.tickVelocity.toFixed(2)}/s`} tone="signal" />
            <MetricTile label="Even / Odd" value={`${analysis.evenRatio.toFixed(1)} / ${analysis.oddRatio.toFixed(1)}`} />
            <MetricTile label="Over / Under" value={`${analysis.overRatio.toFixed(1)} / ${analysis.underRatio.toFixed(1)}`} />
            <MetricTile label="Repeat Run" value={`${analysis.currentRepeat}`} tone={analysis.currentRepeat > 2 ? "warn" : "default"} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <div className="border border-line bg-panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Live Tick Chart</h2>
                <span className="font-mono text-xs text-slate-400">{snapshot.ticks.length} tick buffer</span>
              </div>
              <TickChart ticks={snapshot.ticks} />
            </div>
            <div className="border border-line bg-panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Confidence Meter</h2>
                <Gauge size={16} className="text-signal" />
              </div>
              <ConfidenceMeter signal={signal} />
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <DigitHeatmap analysis={analysis} />
            <TickTape ticks={snapshot.ticks.slice(-28).reverse()} />
          </div>
        </section>

        <aside className="border-t border-line bg-panel px-4 py-4 lg:border-l lg:border-t-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Signal Desk</h2>
            <Bell size={16} className="text-slate-400" />
          </div>

          {signal ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border border-line bg-panel2 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase text-slate-400">{signal.symbol}</span>
                <span className="text-xs text-signal">{signal.confidenceLabel}</span>
              </div>
              <p className="text-3xl font-semibold text-white">{signal.direction}</p>
              <p className="mt-1 text-sm text-slate-400">Confidence {signal.confidence}% · {signal.volatility}</p>
              <div className="mt-4 grid gap-2">
                {signal.rationale.slice(0, 4).map((item) => (
                  <p key={item} className="border-l border-signal/50 pl-3 text-xs leading-5 text-slate-300">{item}</p>
                ))}
              </div>
            </motion.div>
          ) : null}

          <div className="mt-4 border border-line bg-panel2 p-4">
            <h3 className="mb-3 text-sm font-semibold">Risk Status</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Session PnL</span><span>{snapshot.risk.sessionPnl.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Trades</span><span>{snapshot.risk.trades}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Loss Streak</span><span>{snapshot.risk.consecutiveLosses}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Lock</span><span className={snapshot.risk.locked ? "text-danger" : "text-signal"}>{snapshot.risk.locked ? "Active" : "Clear"}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
