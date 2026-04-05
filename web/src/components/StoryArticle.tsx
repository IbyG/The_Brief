import type { LoadedStory } from "@/lib/brief-data";
import { StorySections } from "@/components/StorySections";

export function StoryArticle({ entry }: { entry: LoadedStory }) {
  const { story } = entry;
  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-[0_12px_24px_rgba(0,0,0,0.04)]">
      <div className="absolute left-0 top-0">
        <div className="rounded-br-xl bg-primary px-5 py-2 text-xl font-black italic tracking-tighter text-on-primary">
          #{story.rank}
        </div>
      </div>
      <div className="mb-10 mt-8">
        <h2 className="mb-2 text-3xl font-extrabold leading-tight tracking-tight text-on-surface">
          {story.headline}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-on-surface-variant">
          {story.date_confirmed ? (
            <time dateTime={story.date_confirmed}>{story.date_confirmed}</time>
          ) : null}
          {story.sources_confirmed?.length ? (
            <>
              {story.date_confirmed ? (
                <span className="h-1 w-1 rounded-full bg-outline-variant" aria-hidden />
              ) : null}
              <span>Sources: {story.sources_confirmed.join(", ")}</span>
            </>
          ) : null}
        </div>
        {story.summary ? (
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{story.summary}</p>
        ) : null}
        {story.meta?.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {story.meta.tags.map((t, idx) => (
              <span
                key={`${t}-${idx}`}
                className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold uppercase tracking-tight text-on-surface-variant"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <StorySections sections={story.sections} />
    </article>
  );
}
