"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";
import { isoDateTodayUtc } from "@/lib/daily-brief";

function formatLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function HeaderDate() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const iso = useMemo(() => {
    const raw = searchParams.get("date");
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }
    return isoDateTodayUtc();
  }, [searchParams]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      const next = new URLSearchParams();
      if (!v) {
        const tag = searchParams.get("tag");
        if (tag) {
          next.set("tag", tag);
        }
        const q = next.toString();
        const dest = q ? `${pathname}?${q}` : pathname;
        router.push(dest);
        return;
      }
      next.set("date", v);
      const tag = searchParams.get("tag");
      if (tag) {
        next.set("tag", tag);
      }
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const openPicker = useCallback(() => {
    const el = inputRef.current;
    if (!el) {
      return;
    }
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* fall through */
      }
    }
    el.focus();
    /* Same user gesture: helps Safari / older engines open the native UI */
    el.click();
  }, []);

  const label = formatLabel(iso);

  return (
    <div className="relative -mt-0.5 inline-flex max-w-full items-center">
      {/*
        The native date popup anchors to this input’s bounding box. Keep it stacked behind the
        label (same inset as the button) — do not use fixed top/left, or the calendar appears in
        the viewport corner.
      */}
      <input
        ref={inputRef}
        id="header-brief-date"
        type="date"
        value={iso}
        onChange={onChange}
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 z-0 h-full min-h-[1.25rem] w-full opacity-0"
        aria-hidden
      />
      <button
        type="button"
        onClick={openPicker}
        className="relative z-10 cursor-pointer border-0 bg-transparent p-0 text-left text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant transition hover:text-on-surface hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface/80 rounded-sm"
        aria-label={`Brief date ${label}, choose another date`}
      >
        {label}
      </button>
    </div>
  );
}
