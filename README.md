# The Brief

A small dashboard for **Story Frame** briefs: a Next.js app reads validated JSON from a folder on disk (no database in v1) and renders a central feed, article views, templating/validation tools, and related pages.

## Repository layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js 16 app (App Router, TypeScript, Tailwind). This is the runnable product. |
| `Documentation_References/` | PRD notes, UI design notes, and JSON schema / example files for the Story Frame format. |

Detailed run instructions, environment variables, API routes, and file layout live in **[web/README.md](web/README.md)**.

## Quick start

**Production-style run (Docker):** from the repo root:

```bash
docker compose build
docker compose up
```

Then open [http://localhost:3000](http://localhost:3000). Sample data is mounted from `web/data/`; add or replace `*.json` Story Frame files there.

**Local development:** install dependencies and run the dev server from `web/`:

```bash
cd web && npm install && npm run dev
```

## Tech stack (web)

- Next.js 16, React 19
- JSON validation with AJV (draft 2020-12) against the Story Frame schema in `web/src/lib/story-frame.schema.json`

For API endpoints (`/api/briefs`, `/api/validate`) and deployment notes, see [web/README.md](web/README.md).
