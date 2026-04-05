import Link from "next/link";
import { Suspense } from "react";
import { HeaderDate } from "@/components/HeaderDate";

const nav = [
  { href: "/", label: "Stories" },
  { href: "/templating", label: "Templating" },
] as const;

export function AppHeader({ active }: { active?: "stories" | "templating" }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-[900px] items-center px-6 py-3">
        <div className="flex flex-col">
          <Link href="/" className="text-xl font-black tracking-tighter text-primary">
            The Brief
          </Link>
          <Suspense
            fallback={
              <span className="-mt-0.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                …
              </span>
            }
          >
            <HeaderDate />
          </Suspense>
        </div>
        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 font-bold tracking-tight md:flex"
          aria-label="Main"
        >
          {nav.map((item) => {
            const isActive =
              (item.href === "/" && active === "stories") ||
              (item.href === "/templating" && active === "templating");
            return (
              <Link
                key={item.href}
                href={item.href}
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
      </div>
      <nav
        className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-4 px-6 pb-3 font-bold tracking-tight md:hidden"
        aria-label="Mobile main"
      >
        {nav.map((item) => {
          const isActive =
            (item.href === "/" && active === "stories") ||
            (item.href === "/templating" && active === "templating");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive ? "text-primary" : "text-on-surface-variant"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
