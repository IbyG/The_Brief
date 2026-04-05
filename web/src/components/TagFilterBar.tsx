import Link from "next/link";

export function TagFilterBar({
  isoDate,
  tags,
  selectedTag,
}: {
  isoDate: string;
  tags: string[];
  selectedTag: string | null;
}) {
  if (tags.length === 0) {
    return null;
  }

  const baseQs = new URLSearchParams({ date: isoDate });

  return (
    <header className="flex flex-wrap items-center gap-2" aria-label="Filter by tag">
      <Link
        href={`/?${baseQs.toString()}`}
        className={
          selectedTag === null
            ? "rounded-full bg-primary px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-primary transition-all hover:brightness-110"
            : "rounded-full bg-surface-container-highest px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-high"
        }
      >
        All
      </Link>
      {tags.map((tag) => {
        const qs = new URLSearchParams({ date: isoDate, tag });
        const active =
          selectedTag !== null && selectedTag.toLowerCase() === tag.toLowerCase();
        return (
          <Link
            key={tag}
            href={`/?${qs.toString()}`}
            className={
              active
                ? "rounded-full bg-primary px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-primary transition-all hover:brightness-110"
                : "rounded-full bg-surface-container-highest px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-high"
            }
          >
            {tag}
          </Link>
        );
      })}
    </header>
  );
}
