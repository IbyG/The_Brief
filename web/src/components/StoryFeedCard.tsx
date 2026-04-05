import Link from "next/link";
import type { LoadedStory } from "@/lib/brief-data";

export function StoryFeedCard({
  entry,
  href,
}: {
  entry: LoadedStory;
  href: string;
}) {
  const { story } = entry;
  return (
    <Link
      href={href}
      className="group block rounded-xl bg-surface-container-lowest p-8 shadow-[0_12px_24px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg bg-primary text-lg font-black italic text-on-primary shadow-lg shadow-primary/20">
            #{story.rank}
          </span>
          <span className="text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {entry.filename}
          </span>
        </div>
        <h2 className="text-2xl font-extrabold leading-snug tracking-tight text-on-surface group-hover:text-primary">
          {story.headline}
        </h2>
        {story.summary ? (
          <p className="line-clamp-3 text-on-surface-variant">{story.summary}</p>
        ) : null}
      </div>
    </Link>
  );
}
