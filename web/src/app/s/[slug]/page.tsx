import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { StoryArticle } from "@/components/StoryArticle";
import { loadBriefs } from "@/lib/brief-data";
import { isoDateTodayUtc } from "@/lib/daily-brief";

export const dynamic = "force-dynamic";

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; tag?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const isoDate =
    sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : isoDateTodayUtc();
  const tagParam = typeof sp.tag === "string" ? sp.tag.trim() : "";
  const selectedTag = tagParam.length > 0 ? tagParam : null;
  const result = await loadBriefs({ isoDate });
  const decoded = decodeURIComponent(slug);
  const entry = result.stories.find((s) => s.basename === decoded);
  if (!entry) {
    notFound();
  }

  const backQs = new URLSearchParams({ date: isoDate });
  if (selectedTag) {
    backQs.set("tag", selectedTag);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader active="stories" />
      <main className="mx-auto w-full max-w-[900px] flex-1 space-y-6 px-6 py-12">
        <Link
          href={`/?${backQs.toString()}`}
          className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
        >
          ← Back to feed
        </Link>
        <StoryArticle entry={entry} />
      </main>
    </div>
  );
}
