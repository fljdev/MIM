# MiM Town — Materials in Motion

**Live at [mim.town](https://mim.town)**

A circular-economy B2B marketplace helping Irish SMEs list, discover, and trade surplus materials instead of sending them to waste. Built and deployed as a full-stack solo project.

![MiM Town screenshot](docs/screenshot.png)

## What it does

- **Business profiles** — SMEs register and describe the materials they generate or need
- **Material marketplace** — browse and list surplus materials (construction offcuts, packaging, textiles, etc.) with photos, quantities, and location
- **Waitlist onboarding** — controlled early-access signup flow
- **Auth** — JWT-based registration and login with bcrypt password hashing

## Stack

| Layer | Tech |
|---|---|
| Frontend | React (Create React App), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, REST API |
| Database | PostgreSQL (managed on Railway) |
| Hosting | Railway — auto-deploys from `main` |
| Dev environment | WSL2 Ubuntu, Git |

## Architecture

```
frontend/   React SPA (CRA) — talks to the API over REST
backend/    Express API — auth, businesses, materials, waitlist routes
            PostgreSQL via node-postgres, SQL migrations in backend/database/migrations
```

## Project history

This repository has evolved through several product pivots, each preserved as a git tag rather than deleted — the commit history reflects real iteration on the same core stack:

- `mim-meet-in-the-middle` — meetup midpoint finder with travel-time algorithms
- `mim-make-it-manageable` — accessible journey planning
- `mim-town-materials-in-motion` — current live product

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

John Flynn — [linkedin.com/in/john-lflynn](https://linkedin.com/in/john-lflynn)
