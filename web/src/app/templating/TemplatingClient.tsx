"use client";

import { useCallback, useEffect, useState } from "react";
import { StoryArticle } from "@/components/StoryArticle";
import type { LoadedStory } from "@/lib/brief-data";
import { STORY_FRAME_TEMPLATES } from "@/lib/story-templates";
import type { StoryFrame } from "@/types/story-frame";

async function validateRemote(raw: string): Promise<
  | { ok: true; data: StoryFrame }
  | { ok: false; phase: "parse"; message: string }
  | { ok: false; phase: "validate"; errors: string[] }
> {
  const res = await fetch("/api/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  return res.json();
}

export function TemplatingClient({ initialText }: { initialText: string }) {
  const [text, setText] = useState(initialText);
  const [templateSelect, setTemplateSelect] = useState("");
  const [debounced, setDebounced] = useState(initialText);
  const [parseError, setParseError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [story, setStory] = useState<StoryFrame | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(text), 450);
    return () => window.clearTimeout(t);
  }, [text]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await validateRemote(debounced);
      if (cancelled) {
        return;
      }
      if (!data.ok && data.phase === "parse") {
        setParseError(data.message);
        setValidationErrors([]);
        setStory(null);
        return;
      }
      if (!data.ok && data.phase === "validate") {
        setParseError(null);
        setValidationErrors(data.errors);
        setStory(null);
        return;
      }
      if (data.ok) {
        setParseError(null);
        setValidationErrors([]);
        setStory(data.data);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const preview: LoadedStory | null = story
    ? {
        basename: "preview",
        filename: "preview.json",
        mtimeMs: 0,
        story,
      }
    : null;

  const loadTemplate = useCallback((filename: string) => {
    void fetch(`/templates/${encodeURIComponent(filename)}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        return r.text();
      })
      .then(setText)
      .catch(() => {
        /* keep editor as-is on failure */
      });
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden md:flex-row">
      <section className="flex flex-1 flex-col overflow-hidden border-outline-variant/20 p-6 md:border-r">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              Editor
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              Story Frame JSON · validated against bundled schema
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="story-template" className="sr-only">
              Load template
            </label>
            <select
              id="story-template"
              value={templateSelect}
              onChange={(e) => {
                const file = e.target.value;
                setTemplateSelect(file);
                if (file) {
                  loadTemplate(file);
                }
              }}
              className="max-w-[min(100vw-3rem,20rem)] rounded-lg border border-outline-variant/30 bg-surface-container-highest px-3 py-1.5 text-xs font-semibold text-on-surface shadow-sm transition hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Load template…</option>
              {STORY_FRAME_TEMPLATES.map((t) => (
                <option key={t.file} value={t.file}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={copy}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              Copy to clipboard
            </button>
          </div>
        </div>
        <label className="sr-only" htmlFor="brief-json">
          Brief JSON
        </label>
        <textarea
          id="brief-json"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="min-h-[320px] flex-1 resize-y rounded-xl border border-outline-variant/20 bg-stone-950 p-4 font-mono text-[13px] leading-relaxed text-stone-200 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 md:min-h-0"
        />
        {parseError ? (
          <p className="mt-3 text-sm text-error" role="alert">
            JSON parse: {parseError}
          </p>
        ) : null}
        {!parseError && validationErrors.length > 0 ? (
          <ul className="mt-3 list-inside list-disc text-sm text-on-surface-variant" role="status">
            {validationErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
      </section>
      <section className="flex flex-1 flex-col overflow-y-auto bg-surface-container-low/50 p-6">
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            Live preview
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">Debounced validation + render</p>
        </div>
        {preview ? (
          <StoryArticle entry={preview} />
        ) : (
          <div className="rounded-2xl bg-surface-container-lowest p-8 text-on-surface-variant shadow-lg">
            <p>Valid JSON will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
