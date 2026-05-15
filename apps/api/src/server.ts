import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { z } from "zod";
import { TickStreamEngine } from "./websocket/tick-stream-engine.js";
import { TickStore } from "./database/tick-store.js";
import { LiveCache } from "./redis/live-cache.js";
import { analyzeDigits } from "./analytics/digit-analyzer.js";
import { generateSignal } from "./signals/signal-engine.js";
import { RiskEngine } from "./risk/risk-engine.js";
import { TelegramAlertService } from "./telegram/telegram-alert-service.js";

const env = z.object({
  PORT: z.coerce.number().default(4000),
  DERIV_APP_ID: z.string().default("1089"),
  DERIV_SYMBOL: z.string().default("R_100"),
  WEB_ORIGIN: z.string().default("http://localhost:3000")
}).parse(process.env);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.WEB_ORIGIN,
    methods: ["GET", "POST"]
  }
});

const tickStore = new TickStore();
const liveCache = new LiveCache();
const riskEngine = new RiskEngine();
const telegram = new TelegramAlertService();

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "deriv-quant-api", time: Date.now() });
});

app.get("/analytics/digits", async (_req, res) => {
  const ticks = await liveCache.latest(500);
  res.json(analyzeDigits(ticks));
});

app.get("/analytics/volatility", async (_req, res) => {
  const ticks = await liveCache.latest(500);
  const analysis = analyzeDigits(ticks);
  const signal = generateSignal(ticks, analysis, riskEngine.current());
  res.json({ volatility: signal.volatility, tickVelocity: analysis.tickVelocity, sample: ticks.length });
});

app.get("/analytics/probability", async (_req, res) => {
  const ticks = await liveCache.latest(1000);
  const analysis = analyzeDigits(ticks);
  res.json(generateSignal(ticks, analysis, riskEngine.current()));
});

app.get("/signals/live", async (_req, res) => {
  const ticks = await liveCache.latest(500);
  const analysis = analyzeDigits(ticks);
  res.json(generateSignal(ticks, analysis, riskEngine.current()));
});

app.get("/signals", async (_req, res) => {
  res.json({ items: tickStore.signals().slice(-50).reverse() });
});

app.post("/signals/generate", async (_req, res) => {
  const ticks = await liveCache.latest(1000);
  const analysis = analyzeDigits(ticks);
  const signal = generateSignal(ticks, analysis, riskEngine.current());
  tickStore.saveSignal(signal);
  res.status(201).json(signal);
});

app.get("/replay/session/:id", async (req, res) => {
  const limit = Number(req.query.limit ?? 1000);
  res.json({ id: req.params.id, ticks: tickStore.ticks().slice(-limit) });
});

io.on("connection", async (socket) => {
  socket.emit("snapshot", {
    ticks: await liveCache.latest(100),
    analysis: analyzeDigits(await liveCache.latest(500)),
    latestSignal: tickStore.signals().at(-1),
    risk: riskEngine.current()
  });
});

const stream = new TickStreamEngine({
  appId: env.DERIV_APP_ID,
  symbol: env.DERIV_SYMBOL
});

stream.onTick(async (tick) => {
  await liveCache.push(tick);
  tickStore.saveTick(tick);

  const ticks = await liveCache.latest(1000);
  const analysis = analyzeDigits(ticks);
  const risk = riskEngine.current();
  const signal = generateSignal(ticks, analysis, risk);

  if (signal.confidence >= 75 && !risk.locked) {
    tickStore.saveSignal(signal);
    await telegram.sendSignal(signal);
  }

  io.emit("tick", tick);
  io.emit("snapshot", {
    ticks: ticks.slice(-100),
    analysis,
    latestSignal: signal,
    risk
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`Deriv Quant API listening on :${env.PORT}`);
  stream.start();
});
