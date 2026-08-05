# `GET /api/briefs`

Returns the same ingest result the server uses to render the feed: validated Story Frames for a calendar day, plus per-file errors for invalid JSON.

## Request

Query parameters:

| Param | Required | Description |
|-------|----------|-------------|
| `date` | No | ISO date `YYYY-MM-DD`. Defaults to today (UTC). |

## Example

```bash
curl -sS 'http://localhost:3000/api/briefs?date=2026-04-05'
```

## Response — `200`

JSON object from `loadBriefs` (stories for that date, sorted by `rank`, then filename, then modification time; invalid files appear in an errors list rather than crashing the feed).

## Notes

- Implementation: [`web/src/app/api/briefs/route.ts`](../../web/src/app/api/briefs/route.ts).
