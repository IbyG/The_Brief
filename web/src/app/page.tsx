import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { FeedRefresh } from "@/components/FeedRefresh";
import { IngestNotifications } from "@/components/IngestNotifications";
import { StoryFeedCard } from "@/components/StoryFeedCard";
import { TagFilterBar } from "@/components/TagFilterBar";
import { loadBriefs } from "@/lib/brief-data";
import { isoDateTodayUtc } from "@/lib/daily-brief";
import { collectTagsFromStories, storyMatchesTag } from "@/lib/story-tags";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const isoDate =
    sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : isoDateTodayUtc();
  const tagParam = typeof sp.tag === "string" ? sp.tag.trim() : "";
  const selectedTag = tagParam.length > 0 ? tagParam : null;

  const result = await loadBriefs({ isoDate });
  const tagOptions = collectTagsFromStories(result.stories);
  const displayStories = selectedTag
    ? result.stories.filter((s) => storyMatchesTag(s, selectedTag))
    : result.stories;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <FeedRefresh />
      <AppHeader active="stories" />
      <main className="mx-auto w-full max-w-[900px] flex-1 space-y-8 px-6 py-12">
        <IngestNotifications errors={result.errors} />

        <TagFilterBar isoDate={isoDate} tags={tagOptions} selectedTag={selectedTag} />

        {displayStories.length === 0 ? (
          <div className="rounded-xl bg-surface-container-low p-10 text-center shadow-inner">
            <p className="text-lg font-bold text-on-surface">
              {result.stories.length === 0
                ? isoDate === isoDateTodayUtc()
                  ? "No briefs yet"
                  : "No briefs for this date"
                : "No briefs for this tag"}
            </p>
            <p className="mt-2 text-on-surface-variant">
              {result.stories.length === 0 ? (
                <>
                  {isoDate === isoDateTodayUtc() ? (
                    <>
                      Add valid <span className="font-mono">*_DD-MM-YYYY.json</span> Story Frame files
                      to <span className="font-mono">{result.dataDir}</span> (see{" "}
                      <span className="font-mono">daily_brief_DD-MM-YYYY.json</span>) or open{" "}
                      <Link className="font-semibold text-primary underline" href="/templating">
                        Templating
                      </Link>{" "}
                      to draft JSON.
                    </>
                  ) : (
                    <>
                      Nothing on disk for this day yet. Pick another date, add files named like{" "}
                      <span className="font-mono">daily_brief_DD-MM-YYYY.json</span> under{" "}
                      <span className="font-mono">{result.dataDir}</span>, or open{" "}
                      <Link className="font-semibold text-primary underline" href="/templating">
                        Templating
                      </Link>
                      .
                    </>
                  )}
                </>
              ) : (
                <>
                  Try another tag, clear the filter, or add matching{" "}
                  <span className="font-mono">meta.tags</span> in your JSON.
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {displayStories.map((entry) => (
              <StoryFeedCard key={entry.filename} entry={entry} />
            ))}
          </div>
        )}
      </main>
      <footer className="mt-12 w-full bg-surface-container-low py-8">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <span className="font-bold text-on-surface">The Brief</span>
          <p className="text-sm text-on-surface-variant">Editorial Stream · filesystem source</p>
        </div>
      </footer>
    </div>
  );
}
