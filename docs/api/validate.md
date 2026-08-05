# `POST /api/validate`

Parse and validate a Story Frame from a raw JSON string. Used by the Templating page. Does **not** write to disk (use [`/api/create`](create.md) to persist).

## Request

`Content-Type: application/json`

```json
{
  "raw": "{\"headline\":\"Example\",\"sections\":[]}",
  "mode": "preview"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `raw` | Yes | Story Frame as a JSON **string**. |
| `mode` | No | `"preview"` (default, more forgiving) or `"strict"` (same rules as ingest / create). |

## Example

```bash
curl -sS -X POST http://localhost:3000/api/validate \
  -H 'Content-Type: application/json' \
  -d '{"raw":"{\"headline\":\"Example\",\"sections\":[{\"id\":\"a\",\"type\":\"bullet_list\",\"title\":\"Notes\",\"items\":[{\"text\":\"Hi\"}]}]}","mode":"strict"}'
```

## Responses

### Success

```json
{
  "ok": true,
  "data": { "headline": "...", "sections": [ ... ] },
  "warnings": []
}
```

(`warnings` may be present in preview mode.)

### Errors

| Phase | Body |
|-------|------|
| Invalid HTTP body or `raw` not parseable as JSON | `{ "ok": false, "phase": "parse", "message": "..." }` |
| Schema / preview validation failed | `{ "ok": false, "phase": "validate", "errors": [...], ... }` |

## Notes

- Implementation: [`web/src/app/api/validate/route.ts`](../../web/src/app/api/validate/route.ts).
