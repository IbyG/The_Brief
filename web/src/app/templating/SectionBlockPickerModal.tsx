"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { StorySections } from "@/components/StorySections";
import type { Section } from "@/types/story-frame";
import { SECTION_SAMPLES, type SectionSampleEntry } from "@/data/section-samples";

function IconBulletList({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCards({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTimeline({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconQuote({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10H4v7h5v-7H7v-1a3 3 0 0 1 3-3h1V3h-1a7 7 0 0 0-7 7v0Zm10 0h-3v7h5v-7h-1v-1a3 3 0 0 1 3-3h1V3h-1a7 7 0 0 0-7 7v0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconStats({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19h16M7 15v-4M12 19V9M17 13v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconGeneric({ className }: { className?: string }) {
  return (
    <svg className={className} width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h10M4 18h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ICONS: Record<
  SectionSampleEntry["type"],
  ComponentType<{ className?: string }>
> = {
  bullet_list: IconBulletList,
  cards: IconCards,
  links: IconLink,
  timeline: IconTimeline,
  quotes: IconQuote,
  stats: IconStats,
  generic: IconGeneric,
};

export type SectionBlockPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onAddToTemplate: (section: Section) => void;
  insertError: string | null;
  onDismissError: () => void;
};

export function SectionBlockPickerModal({
  open,
  onClose,
  onAddToTemplate,
  insertError,
  onDismissError,
}: SectionBlockPickerModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<SectionSampleEntry["type"]>("bullet_list");

  const selected = useMemo(
    () => SECTION_SAMPLES.find((s) => s.type === selectedType) ?? SECTION_SAMPLES[0],
    [selectedType],
  );

  const jsonPreview = useMemo(() => JSON.stringify(selected.section, null, 2), [selected.section]);

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonPreview);
    } catch {
      /* ignore */
    }
  }, [jsonPreview]);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative flex max-h-[min(90vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-2xl outline-none"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant/20 px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-on-surface">
              Add Section
            </h2>
            <p id={descId} className="mt-1 max-w-xl text-sm text-on-surface-variant">
              Select a content block type to insert into your editorial template. Samples follow the
              Story Frame JSON schema.
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

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav
            className="shrink-0 border-outline-variant/20 md:w-56 md:border-r md:py-3"
            aria-label="Section types"
          >
            <ul className="flex gap-1 overflow-x-auto px-3 pb-2 md:flex-col md:gap-0 md:px-2 md:pb-0">
              {SECTION_SAMPLES.map((entry) => {
                const Icon = ICONS[entry.type];
                const isActive = selectedType === entry.type;
                return (
                  <li key={entry.type} className="shrink-0 md:w-full">
                    <button
                      type="button"
                      onClick={() => {
                        onDismissError();
                        setSelectedType(entry.type);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                        isActive
                          ? "border-l-[3px] border-primary bg-surface-container-high text-on-surface shadow-sm"
                          : "border-l-[3px] border-transparent text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      <Icon className="shrink-0 opacity-90" />
                      <span className="min-w-0 flex-1">{entry.label}</span>
                      {isActive ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Section preview
            </p>
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/80 p-5 shadow-inner">
              <StorySections sections={[selected.section]} />
            </div>

            <div className="relative">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  schema_preview.json
                </p>
                <button
                  type="button"
                  onClick={copyJson}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  Copy
                </button>
              </div>
              <pre className="max-h-48 overflow-auto rounded-lg bg-[#0c0c0c] p-4 text-left text-[11px] leading-relaxed text-stone-300 shadow-inner">
                <code>{jsonPreview}</code>
              </pre>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 px-6 py-4">
          <div className="min-w-0 flex-1">
            {insertError ? (
              <p className="text-sm text-error" role="alert">
                {insertError}
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant">{selected.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onDismissError();
                onAddToTemplate(selected.section);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary shadow-md transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Add to template
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
