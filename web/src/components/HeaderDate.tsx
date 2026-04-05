"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { isoDateTodayUtc } from "@/lib/daily-brief";

function formatLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HeaderDate() {
  const router = useRouter();
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
        router.push(q ? `/?${q}` : "/");
        return;
      }
      next.set("date", v);
      const tag = searchParams.get("tag");
      if (tag) {
        next.set("tag", tag);
      }
      router.push(`/?${next.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="relative -mt-0.5 flex items-center">
      <input
        className="absolute inset-0 cursor-pointer opacity-0"
        type="date"
        value={iso}
        onChange={onChange}
        aria-label="Brief date"
      />
      <span className="pointer-events-none text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
        {formatLabel(iso)}
      </span>
    </div>
  );
}
