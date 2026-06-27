"use client";

import { useEffect, useId, useRef } from "react";
import { SEMANTIC_COLOR_OPTIONS } from "@/lib/story-display";
import { RICH_TEXT_HELP } from "@/lib/rich-text";

export type TemplateAuthoringGuideProps = {
  open: boolean;
  onClose: () => void;
};

const ROOT_FIELDS = [
  {
    name: "headline",
    required: true,
    description: "Main story title shown in the feed and story view.",
    example: '"Revenue risk moved to yellow"',
  },
  {
    name: "sections",
    required: true,
    description: "Array of content sections. Each section has id, type, title, and items.",
    example: "[{ ... }]",
  },
  {
    name: "rank",
    required: false,
    description: "Optional feed order. Lower numbers appear first. Omit it if order does not matter.",
    example: "1",
  },
  {
    name: "date_confirmed",
    required: false,
    description: "Display date. Any format is allowed and rendered as written.",
    example: '"05-04-2026"',
  },
  {
    name: "sources_confirmed",
    required: false,
    description: "Unique source strings or URLs shown under the headline.",
    example: '["https://example.com/report"]',
  },
  {
    name: "summary",
    required: false,
    description: "Short lead paragraph above the sections.",
    example: '"Key risks and decisions for this week."',
  },
  {
    name: "meta",
    required: false,
    description: "Tags and custom metadata. tags are shown as pills.",
    example: '{ "tags": ["risk", "weekly"] }',
  },
];

const SHARED_STYLE_FIELDS = [
  {
    name: "color",
    description: "Semantic color name or any hex color like #7c3aed.",
    example: '"warning"',
  },
  {
    name: "contexts",
    description: "Multiple supporting lines under cards/stats.",
    example: '["EU region", "If slip > 60 days"]',
  },
  {
    name: "context",
    description: "Single supporting line, or an array if you prefer.",
    example: '"Monte Carlo p50"',
  },
  {
    name: "highlight",
    description: "Adds visual emphasis to a stat/card.",
    example: "true",
  },
  {
    name: "variant",
    description: "Optional card treatment. Use outline for a quieter card.",
    example: '"outline"',
  },
  {
    name: "columns",
    description: "Stats section grid width, 1-4 columns.",
    example: "2",
  },
];

const SECTION_GUIDES = [
  {
    type: "bullet_list",
    fields: "text, note, color",
    use: "Scannable points, risks, actions, or takeaways.",
    snippet: `{
  "id": "risks",
  "type": "bullet_list",
  "title": "Risks",
  "items": [
    { "text": "Vendor dependency", "note": "Mitigation due Q3" }
  ]
}`,
  },
  {
    type: "cards",
    fields: "category, title, description, contexts, color, highlight, variant, cta_label, cta_url",
    use: "Workstreams, recommendations, decisions, or grouped explanations.",
    snippet: `{
  "id": "workstreams",
  "type": "cards",
  "title": "Workstreams",
  "items": [
    {
      "category": "Engineering",
      "title": "Data migration",
      "description": "Dual-write phase is active.",
      "contexts": ["Owner: Platform", "Risk: Medium"],
      "color": "secondary"
    }
  ]
}`,
  },
  {
    type: "stats",
    fields: "columns, label, value, context, contexts, color, highlight, variant",
    use: "Scoreboards, KPIs, status summaries, and numeric proof points.",
    snippet: `{
  "id": "scoreboard",
  "type": "stats",
  "title": "Scoreboard",
  "columns": 2,
  "items": [
    {
      "label": "ARR at risk",
      "value": "$1.2M",
      "contexts": ["EU", "if slip > 60 days"],
      "color": "warning"
    }
  ]
}`,
  },
  {
    type: "timeline",
    fields: "date, text, color",
    use: "Chronology. Dates can be any format, or omitted.",
    snippet: `{
  "id": "timeline",
  "type": "timeline",
  "title": "Milestones",
  "items": [
    { "date": "10-03-2026", "text": "Architecture approved." },
    { "text": "Next: finalize launch date." }
  ]
}`,
  },
  {
    type: "quotes",
    fields: "quote, speaker, role, color",
    use: "Stakeholder soundbites and decision rationale.",
    snippet: `{
  "id": "quotes",
  "type": "quotes",
  "title": "What changed",
  "items": [
    { "quote": "We will not trade trust for speed.", "speaker": "CEO" }
  ]
}`,
  },
  {
    type: "links",
    fields: "label, url, source, color",
    use: "References, sources, supporting docs, and reading lists.",
    snippet: `{
  "id": "sources",
  "type": "links",
  "title": "Sources",
  "items": [
    { "label": "Strategy memo", "url": "https://example.com/memo", "source": "Strategy" }
  ]
}`,
  },
  {
    type: "generic",
    fields: "kind: text | bullet | link | stat | quote",
    use: "Mixed prose, bullets, links, inline stats, and quotes in one section.",
    snippet: `{
  "id": "appendix",
  "type": "generic",
  "title": "Appendix",
  "items": [
    { "kind": "text", "text": "Narrative paragraph." },
    { "kind": "stat", "label": "Launch ready", "value": true, "color": "success" }
  ]
}`,
  },
];

function FieldCard({
  name,
  description,
  example,
  required = false,
}: {
  name: string;
  description: string;
  example: string;
  required?: boolean;
}) {
  return (
    <div className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest p-3">
      <div className="flex items-center justify-between gap-2">
        <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-xs font-bold text-on-surface">
          {name}
        </code>
        <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
          {required ? "required" : "optional"}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{description}</p>
      <p className="mt-2 font-mono text-[11px] text-on-surface">{example}</p>
    </div>
  );
}

export function TemplateAuthoringGuide({ open, onClose }: TemplateAuthoringGuideProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close template guide"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[min(92vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-2xl outline-none"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant/20 px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-on-surface">
              Template Field Guide
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
              Use this as a menu of available fields while writing JSON. Most display fields are
              optional, so start small and add style only where it helps the story.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Close"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-6">
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Color options
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Use one of these names in <code>color</code>, or use any hex color such as{" "}
              <code>#7c3aed</code>.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SEMANTIC_COLOR_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: option.swatch }}
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-bold text-on-surface">{option.label}</p>
                      <code className="text-xs text-on-surface-variant">"{option.value}"</code>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Inline text styling
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Most text fields support inline formatting in headlines, summaries, bullets, card copy,
              quotes, stat labels, contexts, and generic blocks. Mix styles inside one field.
            </p>
            <ul className="mt-4 space-y-2">
              {RICH_TEXT_HELP.map((line) => (
                <li
                  key={line}
                  className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-mono text-xs text-on-surface"
                >
                  {line}
                </li>
              ))}
            </ul>
            <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-[#0c0c0c] p-4 text-[11px] leading-relaxed text-stone-300">
              <code>{`{
  "text": "ARR at [error]risk[/error] if slip exceeds <b>60 days</b>",
  "note": "Owner: <i>Finance</i> · status: [warning]watch[/warning]"
}`}</code>
            </pre>
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Root fields
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ROOT_FIELDS.map((field) => (
                <FieldCard key={field.name} {...field} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Style fields
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SHARED_STYLE_FIELDS.map((field) => (
                <FieldCard key={field.name} {...field} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Section options
            </h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {SECTION_GUIDES.map((section) => (
                <article
                  key={section.type}
                  className="overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest"
                >
                  <div className="border-b border-outline-variant/20 bg-surface-container-low px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="rounded bg-surface-container-high px-2 py-1 text-xs font-bold text-on-surface">
                        {section.type}
                      </code>
                      <span className="text-xs text-on-surface-variant">{section.use}</span>
                    </div>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Fields: {section.fields}
                    </p>
                  </div>
                  <pre className="max-h-56 overflow-auto bg-[#0c0c0c] p-4 text-[11px] leading-relaxed text-stone-300">
                    <code>{section.snippet}</code>
                  </pre>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
