import { Suspense } from "react";
import { HeaderBrandLink } from "@/components/HeaderBrandLink";
import { HeaderDate } from "@/components/HeaderDate";
import { HeaderNavigation } from "@/components/HeaderNavigation";

export function AppHeader({ active }: { active?: "stories" | "templating" }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-[900px] items-center px-6 py-3">
        <div className="flex flex-col">
          <Suspense
            fallback={
              <span className="text-xl font-black tracking-tighter text-primary">The Brief</span>
            }
          >
            <HeaderBrandLink />
          </Suspense>
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
        <Suspense fallback={null}>
          <HeaderNavigation active={active} />
        </Suspense>
      </div>
    </header>
  );
}
