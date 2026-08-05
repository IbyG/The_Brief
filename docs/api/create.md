# `POST /api/create`

Validate a Story Frame and write it as a `*.json` file under `BRIEF_DATA_DIR`. Overwrites the file if it already exists.

## Request

`Content-Type: application/json`

```json
{
  "filename": "optional_name_05-08-2026.json",
  "data": {
    "headline": "Example headline",
    "sections": [
      {
        "id": "notes",
        "type": "bullet_list",
        "title": "Notes",
        "items": [{ "text": "Hello from an external app" }]
      }
    ]
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `data` | Yes | Story Frame object. Validated with the same strict AJV schema as ingest. |
| `filename` | No | Plain basename ending in `.json` (no `/`, `\`, or `..`). If omitted or empty, the server uses `daily_brief_DD-MM-YYYY.json` for today’s date (UTC). |

Prefer names ending `_DD-MM-YYYY.json` so the feed’s date filter includes the file for that day.

## Example (curl)

```bash
curl -sS -X POST http://localhost:3000/api/create \
  -H 'Content-Type: application/json' \
  -d '{
    "filename": "ex_push_05-08-2026.json",
    "data": {
      "headline": "Pushed brief",
      "sections": [
        {
          "id": "a",
          "type": "bullet_list",
          "title": "Notes",
          "items": [{ "text": "Hello" }]
        }
      ]
    }
  }'
```

Default filename (today UTC):

```bash
curl -sS -X POST http://localhost:3000/api/create \
  -H 'Content-Type: application/json' \
  -d '{
    "filename": "",
    "data": {
      "headline": "Daily push",
      "sections": [
        {
          "id": "a",
          "type": "bullet_list",
          "title": "Notes",
          "items": [{ "text": "Uses daily_brief_DD-MM-YYYY.json" }]
        }
      ]
    }
  }'
```

## Responses

### Success — `200`

```json
{
  "ok": true,
  "filename": "ex_push_05-08-2026.json"
}
```

### Errors

| Outcome | Status | Body |
|---------|--------|------|
| Bad JSON / missing `data` | 400 | `{ "ok": false, "phase": "parse", "message": "..." }` |
| Invalid filename | 400 | `{ "ok": false, "phase": "filename", "message": "..." }` |
| Schema invalid | 400 | `{ "ok": false, "phase": "validate", "errors": [...] }` |
| Disk write failure | 500 | `{ "ok": false, "phase": "write", "message": "..." }` |

Example validation failure:

```json
{
  "ok": false,
  "phase": "validate",
  "errors": [
    "headline: must be string"
  ]
}
```

## Notes

- Docker Compose mounts `web/data` at `/data` as **writable** so this endpoint can persist files.
- Server-to-server callers do not need CORS. There is no API key in v1.
- Implementation: [`web/src/app/api/create/route.ts`](../../web/src/app/api/create/route.ts).
