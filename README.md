# MIM
# MiM — Move into Money

**Live at [mim.town](https://mim.town)**

A precious metals portfolio tracker and peer-to-peer marketplace, built for Ireland and Europe. Track your holdings, see live valuations against spot, and buy and sell directly with other collectors — a full-stack solo project, designed, built, and operated end to end.

![MiM screenshot](docs/screenshot.png)

## What it does

- **Live pricing** — gold and silver EUR spot ticker, refreshed continuously
- **Portfolio tracker** — record holdings by coin, bar, or tube; live valuation and profit/loss against purchase price
- **Valuation calculator** — instant melt-value calculations by weight, fineness, and current spot
- **P2P marketplace** — list items for sale, make and accept offers, with a full offer/transaction lifecycle
- **Wider wealth tracking** — cash, crypto (live pricing), and collectible categories alongside metals
- **Security-first design** — JWT authentication, bcrypt password hashing, environment-based secrets management

## Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, REST API |
| Database | PostgreSQL (managed on Railway) |
| Media | Cloudinary image pipeline |
| Hosting | Railway — auto-deploys from `main` |

## Architecture

```
frontend/   React SPA — portfolio, valuation, marketplace, and account views
backend/    Express REST API — auth, holdings, pricing, marketplace routes
            PostgreSQL via node-postgres, SQL migrations in backend/database/migrations
```

## Project history

This repository has evolved through several product pivots, each preserved as a git tag rather than deleted — the history reflects real iteration on one core stack:

- `mim-meet-in-the-middle` — meetup midpoint finder with travel-time algorithms
- `mim-make-it-manageable` — accessible journey planning
- `mim-town-materials-in-motion` — circular-economy B2B marketplace
- Current — Move into Money, live at mim.town

## Running locally

```bash
# Backend
cd backend && npm install
# set DATABASE_URL and JWT_SECRET in backend/.env
npm start

# Frontend
cd frontend && npm install && npm start
```

## Author

John Flynn — [linkedin.com/in/john-lflynn](https://linkedin.com/in/john-lflynn) · [github.com/fljdev](https://github.com/fljdev)
