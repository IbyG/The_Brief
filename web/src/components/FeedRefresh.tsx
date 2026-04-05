"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Polls server state so filesystem changes show up without a full page reload. */
export function FeedRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
