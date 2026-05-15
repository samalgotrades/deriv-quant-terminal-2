"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import type { DashboardSnapshot } from "@dqt/shared";

const emptySnapshot: DashboardSnapshot = {
  ticks: [],
  analysis: {
    windowSize: 0,
    distribution: Array.from({ length: 10 }, (_, digit) => ({ digit, count: 0, percentage: 0, heat: "neutral" as const })),
    hotDigits: [],
    coldDigits: [],
    evenRatio: 0,
    oddRatio: 0,
    overRatio: 0,
    underRatio: 0,
    longestRepeat: 0,
    currentRepeat: 0,
    tickVelocity: 0
  },
  risk: {
    sessionPnl: 0,
    trades: 0,
    consecutiveLosses: 0,
    martingaleDetected: false,
    overtradingDetected: false,
    locked: false,
    warnings: []
  }
};

export function useLiveDashboard() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(emptySnapshot);
  const [connected, setConnected] = useState(false);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

  useEffect(() => {
    const socket = io(socketUrl, { transports: ["websocket"] });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("snapshot", setSnapshot);
    return () => {
      socket.disconnect();
    };
  }, [socketUrl]);

  return useMemo(() => ({ snapshot, connected }), [snapshot, connected]);
}
