# API

HTTP APIs exposed by The Brief (Next.js App Router). Base URL locally: `http://localhost:3000`.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | [`/api/briefs`](briefs.md) | Load validated Story Frames for a date (same shape as the feed). |
| `POST` | [`/api/validate`](validate.md) | Validate Story Frame JSON (Templating page). |
| `POST` | [`/api/create`](create.md) | Validate and write a Story Frame into `BRIEF_DATA_DIR`. |

There is no authentication in v1. Files are stored under `BRIEF_DATA_DIR` (default `/data` in Docker, `web/data` in local dev). See [web/README.md](../../web/README.md) for environment and Docker details.
