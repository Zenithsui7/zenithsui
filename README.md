# ZenithSui

A personal all-in-one web hub — dark amber glassmorphism theme.

**Live website:** https://zenithsui7.github.io/zenithsui/

**Stack:** React + Vite · Express · PostgreSQL + Drizzle ORM

## Quick Start

```bash
npm install -g pnpm
pnpm install
```

### Environment variables

Root `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/zenithsui
SESSION_SECRET=change-me
```

`artifacts/fusion-hub/.env`:
```
VITE_OWNER_PASSWORD=zenithsui
```

### Run locally

Terminal 1 (API):
```bash
PORT=8080 BASE_PATH=/api pnpm --filter @workspace/api-server run dev
```

Terminal 2 (Frontend):
```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/fusion-hub run dev
```

Open → http://localhost:5173

## Owner mode
Click **Owner login** (top right) → password: `zenithsui`

## GitHub Pages deployment
```bash
GITHUB_PAGES=1 PORT=5173 pnpm --filter @workspace/fusion-hub run build
```
Then push `artifacts/fusion-hub/dist/public/` to the `gh-pages` branch.
