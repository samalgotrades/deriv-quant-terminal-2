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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiUrl}/snapshot`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : undefined)
      .then((data) => {
        if (data) setSnapshot(data);
      })
      .catch(() => undefined);

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("snapshot", setSnapshot);
    return () => {
      controller.abort();
      socket.disconnect();
    };
  }, [apiUrl, socketUrl]);

  return useMemo(() => ({ snapshot, connected }), [snapshot, connected]);
}
