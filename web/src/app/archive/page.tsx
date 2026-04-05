import { AppHeader } from "@/components/AppHeader";

export default function ArchivePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto max-w-[900px] flex-1 px-6 py-16">
        <h1 className="text-3xl font-black text-on-surface">Archive</h1>
        <p className="mt-4 text-on-surface-variant">
          Placeholder for v1 — browse historical briefs once persistence moves beyond flat files.
        </p>
      </main>
    </div>
  );
}
