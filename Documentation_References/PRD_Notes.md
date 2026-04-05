# PRD Notes: Persona Tournament & Synthesis

**Companion to:** `PRD.md`  
**Purpose:** Capture Round 1 persona drafts (condensed), cross-critique, Round 2 synthesis, and stakeholder-facing summary without duplicating the full PRD.

---

## Round 1 — Initial Drafts (Condensed)

### Contestant 1 — Product Strategist (Vision & Alignment)

**Product Strategist:** The north star is **decision compression**: one surface, one ranking logic, one visual language. v1 must not pretend to be a data platform—it is a **read-optimized consumption layer** over files teams already produce. I anchored goals around **unification (G1)**, **trust (G2)**, **operational fit (G3)**, and **shippable container (G4)**. I pushed back on vague “insights” until we define what “priority” means in UI (we use schema `rank` + editorial hierarchy in layout). Supabase is a **future alignment** hook, not a strategy pillar for v1, or we dilute the filesystem story.

---

### Contestant 2 — UX Architect (Experience & Usability)

**UX Architect:** The **Central** and **Templating** wireframes are not interchangeable: Central is for **scanning**, Templating for **authoring confidence**. I insisted on empty states, broken-file transparency (user should see that something failed without developer logs), and **no crowding** per UI DESIGN — asymmetry and surface layering beat grids of boxes. Edge case: minimal JSON examples must not crash the preview; show inline validation affordances. I challenged “automatic detection” copy: users need a **mental model** (subtle “updated” cue or timestamp) when files change.

---

### Contestant 3 — Technical Architect (Feasibility & System Design)

**Technical Architect:** Filesystem-as-SoT is coherent if **validation is strict** and **rendering is defensive**. Next.js should read `/data` only on the server or via controlled API routes—never expose raw disk paths to the client. **JSON Schema draft 2020-12** in the repo must match the validator dependency. Watching files in Docker needs **polling fallback** because inotify behavior varies across mounts. Supabase: wire **interfaces** now, implement later. **Docker:** multi-stage build, non-root, document volume mount; image is the release unit.

---

### Contestant 4 — Quality Lead (Validation & Measurability)

**Quality Lead:** Every FR maps to a test idea: validation errors are **three-valued** — parse failure vs schema failure vs empty sections. Acceptance: **log line includes filename + validator pointer**. For E2E, define **seed `/data` fixtures** in repo for CI. “Continue processing” is measurable: **N invalid files → N log lines → 0 unhandled exceptions**. Accessibility: tie **focus** and **contrast** to tokens in UI DESIGN, not ad hoc CSS.

---

## Cross-Persona Critique (Abbreviated)

| Topic | Tension | Resolution in `PRD.md` |
|-------|---------|-------------------------|
| Supabase vs no DB | Roadmap vs scope | v1 filesystem-only; Supabase explicitly non-blocking |
| Watch vs poll | Feasibility in Docker | NFR allows bounded refresh / polling fallback |
| Broken file UX | Logs vs UI | FR-006 + UX note: user-visible skip/status where feasible |
| Daily filenames | Parsing ambiguity | FR-005 + assumption: documented pattern and fallback |

---

## Round 2 — Final Synthesis (Product Strategist)

**Product Strategist:** I merged the four drafts by **ordering decisions**: (1) **scope lock** for v1 — read-only, file-backed, container-delivered; (2) **experience split** — Central vs Templating as in wireframes; (3) **quality bar** — invalid JSON never kills the session; (4) **deployment truth** — Docker + mounted `/data` is the contract with ops. The executive summary in `PRD.md` is written so **non-technical stakeholders** see outcomes first; technical depth follows in later sections.

---

## Stakeholder Proxy — Executive Summary (Presentation Form)

**Stakeholder Proxy:**  

**What we’re building:** One web app, **The Brief**, that shows everything important from our JSON briefs in one readable dashboard—styled like a premium editorial product, not a generic grid.  

**Why it matters:** People stop hopping between tools every morning; they get consistent formatting and clear priority.  

**What success looks like:** Fast scan, reliable updates when files change, no meltdown when one file is bad, and a **Docker image** we can host the same way everywhere.  

**What we’re not doing in v1:** A database, logins, or heavy integrations—those can follow once the read experience is trusted.  

**Ask:** Approve **full v1** scope and filesystem + container assumptions so engineering can lock the release plan.

---

## Open Questions for Product Owner (Optional)

1. **Company name and branding:** Replace generic “internal team” in external-facing docs.  
2. **Supabase:** Confirm whether v1 needs **any** Supabase stub (e.g. analytics only) or pure no-op.  
3. **Daily file naming:** Confirm exact pattern (`daily_brief_DD-MM-YYYY` vs ISO date) across producers.  
4. **Insights / Archive routes:** Wireframes include nav items—v1 functional depth TBD (placeholder pages vs full features).

---

*End of PRD Notes.*
