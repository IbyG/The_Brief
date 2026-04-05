"use client";

import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-0 flex-1 rounded-xl bg-black shadow-inner" aria-hidden />
    ),
  },
);

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

  const cmExtensions = useMemo(
    () => [
      json(),
      EditorView.theme(
        {
          "&": { backgroundColor: "#000000" },
          ".cm-editor": { backgroundColor: "#000000" },
          ".cm-scroller": { backgroundColor: "#000000" },
          ".cm-content": { backgroundColor: "#000000" },
          ".cm-gutters": {
            backgroundColor: "#0a0a0a",
            borderRight: "1px solid #1f2937",
          },
        },
        { dark: true },
      ),
    ],
    [],
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row md:items-stretch">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-outline-variant/20 p-6 md:border-r">
        <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
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
        <span className="sr-only" id="brief-json-label">
          Brief JSON
        </span>
        <div
          aria-labelledby="brief-json-label"
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-black shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
        >
          <CodeMirror
            value={text}
            height="100%"
            theme="dark"
            extensions={cmExtensions}
            onChange={setText}
            className="templating-json-editor min-h-0 flex-1 text-[13px] leading-relaxed [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
            }}
          />
        </div>
        <div className="mt-3 shrink-0 space-y-2">
          {parseError ? (
            <p className="text-sm text-error" role="alert">
              JSON parse: {parseError}
            </p>
          ) : null}
          {!parseError && validationErrors.length > 0 ? (
            <ul className="list-inside list-disc text-sm text-on-surface-variant" role="status">
              {validationErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-container-low/50 p-6">
        <div className="mb-4 shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            Live preview
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">Debounced validation + render</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {preview ? (
            <StoryArticle entry={preview} />
          ) : (
            <div className="rounded-2xl bg-surface-container-lowest p-8 text-on-surface-variant shadow-lg">
              <p>Valid JSON will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
