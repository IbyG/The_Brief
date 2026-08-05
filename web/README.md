# The Brief (web)

Next.js App Router dashboard that reads validated Story Frame JSON from a directory on disk (no database in v1).

**v1 deployment:** Docker only. Run the app via the container image; `npm run dev` is for local development.

## Production (Docker)

From the repository root:

```bash
docker compose build
docker compose up
```

Open `http://localhost:3000`. Mount your Story Frame `*.json` files at `/data` (see `docker-compose.yml`; sample data is under `web/data`). The volume is writable so `POST /api/create` can persist new files.

Environment:

- `BRIEF_DATA_DIR` — absolute path to the JSON directory (default `/data` in the image).

Daily brief files may use `daily_brief_DD-MM-YYYY.json` (and other `*.json` Story Frame files can live alongside them). The feed always loads every valid `*.json` in the data directory and shows one card per file, sorted by `rank`, then filename, then modification time.

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
- `POST /api/create` — validate a Story Frame and write it under `BRIEF_DATA_DIR` (overwrites if the file already exists).

### `POST /api/create`

Request body:

```json
{
  "filename": "optional_name_05-08-2026.json",
  "data": {
    "headline": "Example",
    "sections": []
  }
}
```

- `data` (required) — Story Frame object; validated with the same strict schema as ingest.
- `filename` (optional) — plain basename ending in `.json` (no path separators). If omitted or empty, the server uses `daily_brief_DD-MM-YYYY.json` for today’s date (UTC).

Prefer names ending `_DD-MM-YYYY.json` so date filtering on the feed picks them up.

Example (curl):

```bash
curl -sS -X POST http://localhost:3000/api/create \
  -H 'Content-Type: application/json' \
  -d '{"filename":"ex_push_05-08-2026.json","data":{"headline":"Pushed brief","sections":[{"id":"a","type":"bullet_list","title":"Notes","items":[{"text":"Hello"}]}]}}'
```

Responses:

| Outcome | Status | Body |
|---------|--------|------|
| Success | 200 | `{ "ok": true, "filename": "..." }` |
| Bad JSON / missing `data` | 400 | `{ "ok": false, "phase": "parse", "message": "..." }` |
| Invalid filename | 400 | `{ "ok": false, "phase": "filename", "message": "..." }` |
| Schema invalid | 400 | `{ "ok": false, "phase": "validate", "errors": [...] }` |
| Disk write failure | 500 | `{ "ok": false, "phase": "write", "message": "..." }` |

## Project layout

- `src/app` — routes (Central feed, Templating, placeholders).
- `src/lib` — filesystem ingest, JSON Schema validation (AJV draft 2020-12), daily filename helper.
- `src/components` — Story Frame section renderers and chrome.
