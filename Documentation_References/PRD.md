# Product Requirements Document: The Brief

**Document version:** 1.0  
**Release scope:** Full v1  
**Last updated:** 2026-04-05  
**Owner:** Product (synthesized PRD — PR Agent workflow)

---

## 1. Executive Summary

**The Brief** is a single web dashboard that replaces a fragmented morning routine: instead of opening several tools or scripts to see what matters, users open one place and get a consistent, prioritized, editorial-style view of structured updates. The application reads validated JSON “story frames” from a designated `/data` directory on the filesystem—no database in v1—watches for new and updated files (including predictable daily filenames), and renders them through a Next.js (App Router) front end styled to the **Editorial Stream** design system. Success is measured by time-to-insight, error-free ingestion of valid files, and resilient handling of bad data without stopping the whole experience. The product ships as a containerized image for predictable deployment, with **Supabase** captured as a forward-looking integration need rather than a v1 blocker. This document aligns vision, functional and non-functional requirements, UX direction (wireframes and UI spec), technical architecture, quality gates, and release milestones so engineering and stakeholders can execute **full v1** with shared clarity.

---

## 2. Company & Product Background

**Organization (assumption):** An internal team or small organization (company name not specified) that currently relies on multiple siloed applications and ad hoc scripts to surface operational or editorial signals.  

**Market / context:** The problem is workflow fragmentation, not lack of data—data exists in JSON form but is inconvenient to consume in one mental model.

**Product name:** **The Brief**

**Audience:** Primary users are individuals who need a **daily consumption** surface—editors, operators, or leads who scan priorities once or twice a day rather than living inside raw tooling.

**Pain points addressed:**

- Context switching across many sources  
- Inconsistent formatting and priority signals  
- Fragile manual checks when files update  

**Assumptions:**

- JSON producers can write to a shared `/data` folder (or mounted volume) accessible to the app.  
- Users accept filesystem-as-source-of-truth for v1 (no collaborative editing in-app).  
- **Supabase** is desired on the roadmap (e.g. auth, sync, or analytics) but is **not** required to ship v1’s core value (read-only dashboard from disk).

---

## 3. Product Vision and Goals

**Vision:** Make “what matters today” feel like a **curated chronicle**—calm, scannable, authoritative—while staying honest to structured inputs (validated JSON) and the filesystem as the system of record.

**Strategic goals:**

| Goal | Description |
|------|-------------|
| **G1 — Unify consumption** | One URL, one visual language, one ranking model (via `rank`, sections, metadata). |
| **G2 — Trust the feed** | Valid files render predictably; invalid files never take down the app. |
| **G3 — Fit real ops** | Support multiple files, rotation/daily naming, and refresh without redeploy. |
| **G4 — Ship deployable v1** | Container image builds reproducibly and runs behind standard hosting. |

**OKRs (suggested for v1):**

1. **O:** Reduce time to scan top priorities. **KR:** Median session time to locate top-ranked story &lt; 60 seconds in usability tests (baseline to be captured in beta).  
2. **O:** Reliable ingestion. **KR:** 100% of schema-valid files in `/data` render; invalid files logged and skipped with no unhandled exceptions in soak testing.  
3. **O:** Operational simplicity. **KR:** Single-container deploy documented; cold start &lt; 10s on reference hardware (target, to be validated).

**Business alignment:** Fewer tool switches means faster decisions and lower “did I miss something?” risk; containerized delivery reduces environment drift for internal or client-hosted rollouts.

---

## 4. Target Users and Use Cases

**Primary persona — The Daily Scanner:** Checks the brief once or twice a day, cares about priority order, clarity, and not fighting the UI.

**Secondary persona — The Content/Template Author:** Uses the templating experience to validate JSON against the schema and preview how sections render (aligned with wireframe **Templating** and JSON examples).

### User stories

_As a Daily Scanner, I want to see all valid briefs from `/data` in one prioritized list so that I don’t jump between systems._  

_As a Daily Scanner, I want the UI to reflect today’s brief when daily files are named by date so that I can align the view with my routine._  

_As a Daily Scanner, I want the app to keep working when one file is broken so that a single bad export doesn’t block everything._  

_As a Template Author, I want to paste or edit JSON and see a faithful preview so that I can trust the format before dropping files into `/data`._  

_As an Operator, I want a Docker image so that I can deploy the same build to staging and production._

### Key journeys

1. **Morning scan:** Open app → see ranked stories (headlines, sections per **Story Frame** schema) → open detail as designed in **Central** wireframe.  
2. **Date-aligned brief:** Pick or infer date → load matching `daily_brief_*` content when present.  
3. **Authoring / QA:** Open **Templating** → edit JSON → validate against schema → preview section types (bullet_list, cards, links, timeline, quotes, stats, generic).  
4. **Deploy:** Build image → run with `/data` mounted → verify hot refresh on file changes.

---

## 5. Functional Requirements

| ID | Description | Priority | Acceptance criteria |
|----|-------------|----------|---------------------|
| **FR-001** | Monitor a configurable `/data` directory for JSON inputs | High | Path configurable at build/runtime per deployment; documented default `/data`. |
| **FR-002** | Load and merge **multiple** JSON files | High | All valid files in scope are listed and/or combined per UX (see FR-010); none silently dropped without logging. |
| **FR-003** | Validate each file against **Story Frame** JSON Schema (`Documentation_References/JSON References/JSON_Schema.json`) | High | Invalid document rejected for display; user-visible status or skip with log line identifying file. |
| **FR-004** | Detect **new and updated** files without full restart | High | Adding or changing a file updates UI within a bounded interval (see NFR latency) or on explicit refresh if watch is limited by environment. |
| **FR-005** | Support **daily timestamped** filenames (e.g. `daily_brief_05-12-2026`) | High | Documented naming convention; app resolves “today’s” file when strategy is date-based; graceful fallback if missing. |
| **FR-006** | Handle **malformed or invalid** JSON | High | Log error (file path + reason); skip file; continue processing others; no crash. |
| **FR-007** | No database for v1 — **filesystem is source of truth** | High | No runtime dependency on Postgres/SQLite for core read path; optional future Supabase called out in roadmap only. |
| **FR-008** | **Central** experience matches `wireframes/Central_Page.html` structure | High | Header, nav labels, date control, story list/detail patterns consistent with wireframe intent and UI DESIGN.md tokens. |
| **FR-009** | **Templating** experience matches `wireframes/Templating_Page.html` | High | Split editor/preview (or equivalent); usable for examples under `JSON References/json Examples/`. |
| **FR-010** | Present content in a **consistent, prioritized** way | High | Respect `rank` (integer ≥ 1); `headline` and `sections` required per schema; optional fields (`summary`, `meta`, etc.) surfaced per design. |
| **FR-011** | Render all schema **section types** | Medium | `bullet_list`, `cards`, `links`, `timeline`, `quotes`, `stats`, `generic` — each mapped to UI components. |
| **FR-012** | **Docker** release artifact | High | `Dockerfile` (and optionally `docker-compose` with volume mount for `/data`) builds a production image; README documents build, run, and mount. |

---

## 6. Non-Functional Requirements

| ID | Area | Requirement |
|----|------|-------------|
| **NFR-001** | Performance | Initial paint and interactive shell within agreed budget on reference env; file watch debounce to avoid thrashing on bulk writes. |
| **NFR-002** | Availability | Single-instance deployment acceptable for v1; document restart behavior. |
| **NFR-003** | Security | Treat `/data` as trusted input location at deployment boundary; no arbitrary path traversal from UI; sanitize rendered strings to avoid XSS from JSON content. |
| **NFR-004** | Observability | Structured logs for ingest, validation failures, and skips (filename, error class). |
| **NFR-005** | Accessibility | Keyboard-navigable main flows; semantic headings; focus states per UI DESIGN (ghost border / primary focus). |
| **NFR-006** | Responsiveness | Layout behaves from mobile to desktop per wireframes (nav, stacking editor/preview on small screens). |
| **NFR-007** | Maintainability | Schema version pinned; validation library aligned with JSON Schema draft used in file. |

---

## 7. UX/UI Overview

**Design philosophy:** **The Curated Chronicle** — editorial, asymmetric layout, calm density, **no 1px rule borders** for sectioning; separation via surface layers (see `UI DESIGN.md`).  

**Brand tokens:** Primary **Coral `#ac2b31`**, Secondary **Teal `#006a66`**, Inter typography, dot-grid background on appropriate surfaces, coral “signature” bullet for emphasis states.

**Critical paths:**

- **Stories (Central):** Brand “The Brief”, date selector, primary feed of ranked items, navigation to Templating / Insights / Archive as in wireframe.  
- **Templating:** JSON editing surface + live preview; search affordance as in wireframe; aligns with JSON examples `ex1.json`–`ex3.json` for structure reference.

**Edge cases:**

- Empty `/data`: explanatory empty state, no error stack.  
- Partial example JSON (e.g. minimal examples): templating should show validation errors clearly.  
- Duplicate ranks: deterministic tie-break (e.g. filename, then mtime) — document in implementation.

**Accessibility:** Avoid pure black text; use `on_surface` / `on_surface_variant`; focus rings on inputs; readable contrast for coral/teal on surfaces.

---

## 8. Technical Architecture & Implementation Notes

**Pattern:** Next.js (App Router) + Tailwind CSS; **server-side or build-time filesystem access** for `/data` in the deployment model (Node runtime in container can read mounted volume). No separate backend service required if API routes or server components perform reads and validation.

**Data flow (conceptual):**

```text
/data/*.json  -->  watcher / poll  -->  validate (JSON Schema)  -->  in-memory model  -->  React UI
                                      |-> skip + log on failure
```

**Schema:** **Story Frame** — required `rank`, `headline`, `sections`; optional `date_confirmed`, `sources_confirmed`, `summary`, `meta`; sections discriminated by `type` with typed items per `$defs` in `JSON_Schema.json`.

**Daily files:** Implement a resolver (configurable) for patterns like `daily_brief_DD-MM-YYYY.json` aligned with user examples.

**Supabase:** For v1, **no hard dependency**. Optional later use: hosted preferences, multi-device sync, or analytics. If introduced, isolate behind interfaces so filesystem mode remains.

**Docker:** Multi-stage build (install, build Next.js, minimal runtime image), non-root user where feasible, document `VOLUME` or compose bind for `/data`. Host builds image once and deploys to target environment.

**Risks / complexity:**

| Topic | Complexity | Mitigation |
|-------|------------|------------|
| File watching in container | Medium | Use stable library; fallback polling interval in Docker/K8s. |
| Schema evolution | Medium | Version field in meta or filename convention later; v1 locks to current schema. |
| XSS from JSON | Medium | Escape or use safe rendering patterns for user strings. |

---

## 9. Quality Assurance & Test Plan

| Test ID | Scope | Method | Definition of done |
|---------|--------|--------|---------------------|
| **T-001** | Schema validation | Unit tests with valid/invalid fixtures | All `$defs` section types covered with golden outputs. |
| **T-002** | Malformed JSON | Unit / integration | Parser errors caught; logged; UI stable. |
| **T-003** | Multi-file ordering | Integration | Ordering by `rank` and tie-break verified. |
| **T-004** | File watch | E2E or integration (env permitting) | New file appears without restart (or documented manual refresh path). |
| **T-005** | Docker image | CI build | Image builds; smoke HTTP check passes. |
| **T-006** | Accessibility | Manual + automated (axe) | No critical a11y violations on main routes. |

Automation hooks: run unit + integration in CI; optional Playwright for main flows; Docker build in release pipeline.

---

## 10. Risks, Dependencies, and Assumptions

| Item | Type | P / I | Mitigation |
|------|------|-------|------------|
| Unclear company/hosting constraints | Assumption | M / M | Defaults documented; confirm DNS/TLS with ops. |
| Supabase scope creep | Dependency | M / H | Explicit “future phase” in roadmap. |
| JSON from untrusted parties | Risk | H / H | Deploy `/data` as trusted boundary; sanitize output. |
| Large files / many sections | Risk | M / M | Pagination or collapse long sections in UI. |

---

## 11. Success Metrics & KPIs

| Metric | Baseline | Target (v1) | Source |
|--------|----------|-------------|--------|
| Time to find top priority | TBD (measure in beta) | Improve vs baseline | Session recording / task tests |
| Ingest success rate | N/A | 100% valid files rendered | Logs |
| Critical errors in production | N/A | Zero unhandled in soak | Error tracking |
| Deploy reproducibility | N/A | One-command image build | CI + README |

---

## 12. Release Plan and Milestones

**Milestone 1 — Foundations:** Next.js app shell, design tokens, routing (Central + Templating).  
**Milestone 2 — Data layer:** `/data` read, schema validation, error handling, listing/detail.  
**Milestone 3 — Watch & daily files:** Watch/poll, naming convention, edge cases.  
**Milestone 4 — Hardening:** A11y pass, XSS review, logging, performance budget.  
**Milestone 5 — Container & docs:** Dockerfile, compose example, hosting notes.  
**Go-live checklist:** Image in registry, `/data` mount verified, smoke test, rollback = previous image tag.

---

## 13. Appendices / Persona Critiques

Synthesis notes and Round 1 persona commentary are recorded in **`PRD_Notes.md`** to keep this document readable while preserving decision traceability.

**Referenced artifacts**

- `Documentation_References/UI DESIGN.md`  
- `Documentation_References/JSON References/JSON_Schema.json`  
- `Documentation_References/JSON References/json Examples/`  
- `Documentation_References/wireframes/Central_Page.html`  
- `Documentation_References/wireframes/Templating_Page.html`  

---

*End of PRD.*
