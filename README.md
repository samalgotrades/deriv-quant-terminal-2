# Deriv Quant Terminal

A full MVP scaffold for a quantitative Deriv synthetic market intelligence platform. The product is intentionally positioned around statistical transparency, live analytics, signal scoring, and risk controls rather than guaranteed trade claims.

## Apps

- `apps/web` - Next.js dashboard with live tick visualization, digit intelligence, signal cards, replay controls, and risk panels.
- `apps/api` - Express + Socket.IO API with Deriv WebSocket ingestion, rolling analytics, signal scoring, risk checks, and Telegram alert hooks.

## Shared Packages

- `packages/shared` - Shared TypeScript types and market constants.

## Services

- `services/analytics` - Python probability service placeholder for future XGBoost scoring.
- `services/signals` - Signal engine ownership notes.
- `services/risk` - Risk engine ownership notes.

## Quick Start

```bash
npm install
npm run dev:api
npm run dev:web
```

By default the API connects to Deriv with `DERIV_APP_ID=1089` and streams `R_100`. If the upstream connection fails, it falls back to a local synthetic tick simulator so the dashboard remains usable during development.

## Environment

Create `apps/api/.env`:

```bash
PORT=4000
DERIV_APP_ID=1089
DERIV_SYMBOL=R_100
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```
