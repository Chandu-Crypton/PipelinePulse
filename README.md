# PipelinePulse

Paste any public GitHub repo and see its GitHub Actions health: success rate, build time (avg and P95),
runs per day and mean time to recovery (MTTR).

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Vitest, Docker, GitHub Actions, Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local   # optional GITHUB_TOKEN
npm run dev
```

## Scripts
`npm run lint` / `typecheck` / `test` / `test:coverage` / `build`

## API
- `GET /api/runs?repo=owner/name` returns metrics and recent runs
- `GET /api/health` returns liveness info (used by Docker and the deploy smoke test)

## CI/CD pipeline (.github/workflows/ci.yml)
| Job | Trigger | What it does |
|---|---|---|
| quality | PR + main | ESLint and `tsc` |
| test | PR + main | Vitest on Node 20 and 22, coverage artifact |
| build | after quality + test | `next build` with `.next/cache` caching |
| docker | after build | Builds image, pushes to GHCR on main |
| deploy-preview | PR | Vercel preview, comments URL on the PR |
| deploy-production | main | Vercel prod deploy, then `/api/health` smoke test |

Also: CodeQL security scan (weekly + PRs) and Dependabot for npm, Actions and Docker.

## Required GitHub secrets
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
Create environments named `preview` and `production` (add required reviewers on production for a manual approval gate).
