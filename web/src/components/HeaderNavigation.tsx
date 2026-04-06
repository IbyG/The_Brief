"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const items = [
  { base: "/", label: "Stories", activeKey: "stories" as const },
  { base: "/templating", label: "Templating", activeKey: "templating" as const },
] as const;

function withQuery(base: string, qs: string): string {
  if (!qs) {
    return base;
  }
  return `${base}?${qs}`;
}

export function HeaderNavigation({ active }: { active?: "stories" | "templating" }) {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  return (
    <>
      <nav
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 font-bold tracking-tight md:flex"
        aria-label="Main"
      >
        {items.map((item) => {
          const isActive = active === item.activeKey;
          return (
            <Link
              key={item.base}
              href={withQuery(item.base, qs)}
              className={
                isActive
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-on-surface-variant transition-colors hover:text-on-surface"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav
        className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-4 px-6 pb-3 font-bold tracking-tight md:hidden"
        aria-label="Mobile main"
      >
        {items.map((item) => {
          const isActive = active === item.activeKey;
          return (
            <Link
              key={item.base}
              href={withQuery(item.base, qs)}
              className={isActive ? "text-primary" : "text-on-surface-variant"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
