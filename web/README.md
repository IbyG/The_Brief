# The Brief (web)

Next.js App Router dashboard that reads validated Story Frame JSON from a directory on disk (no database in v1).

**v1 deployment:** Docker only. Run the app via the container image; `npm run dev` is for local development.

## Production (Docker)

From the repository root:

```bash
docker compose build
docker compose up
```

Open `http://localhost:3000`. Mount your Story Frame `*.json` files at `/data` (see `docker-compose.yml`; sample data is under `web/data`).

Environment:

- `BRIEF_DATA_DIR` — absolute path to the JSON directory (default `/data` in the image).

Daily brief files use `daily_brief_DD-MM-YYYY.json`. When that file exists for the date selected in the header, the feed shows only that brief; otherwise all `*.json` files in the data directory are merged and sorted by `rank`, then filename, then modification time.

## Local development (optional)

```bash
cd web
npm install
npm run dev
```

Uses `./data` under `web/` unless `BRIEF_DATA_DIR` is set.

## API

- `GET /api/briefs?date=YYYY-MM-DD` — JSON ingest result (same shape the server uses to render the feed).
- `POST /api/validate` with body `{ "raw": "<json string>" }` — schema validation for the Templating page.

## Project layout

- `src/app` — routes (Central feed, Templating, placeholders).
- `src/lib` — filesystem ingest, JSON Schema validation (AJV draft 2020-12), daily filename helper.
- `src/components` — Story Frame section renderers and chrome.
