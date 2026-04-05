import type { ContentBlock, Section } from "@/types/story-frame";
import { safeHttpUrl } from "@/lib/safe-url";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-primary mb-6 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em]">
      {children}
    </h3>
  );
}

function BulletListSection({
  title,
  items,
}: {
  title: string;
  items: { text: string; note?: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="group/item flex items-start gap-4">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden
            />
            <div className="text-on-surface leading-relaxed">
              <p>{item.text}</p>
              {item.note ? (
                <p className="mt-1 text-sm text-on-surface-variant">{item.note}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CardsSection({
  title,
  items,
}: {
  title: string;
  items: {
    category?: string;
    title: string;
    description: string;
    cta_label?: string;
    cta_url?: string;
  }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-4">
        {items.map((c, i) => {
          const cta = c.cta_url ? safeHttpUrl(c.cta_url) : "";
          return (
            <div
              key={i}
              className="rounded-xl bg-surface-container-low p-5 shadow-[0_12px_24px_rgba(0,0,0,0.04)]"
            >
              {c.category ? (
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-secondary">
                  {c.category}
                </p>
              ) : null}
              <p className="text-lg font-bold text-on-surface">{c.title}</p>
              <p className="mt-2 text-on-surface-variant">{c.description}</p>
              {c.cta_label && cta ? (
                <a
                  href={cta}
                  className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {c.cta_label}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LinksSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; url: string; source?: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-3">
        {items.map((item, i) => {
          const href = safeHttpUrl(item.url);
          return (
            <li key={i}>
              {href ? (
                <a
                  href={href}
                  className="font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              ) : (
                <span className="font-semibold text-on-surface-variant">{item.label}</span>
              )}
              {item.source ? (
                <span className="ml-2 text-sm text-on-surface-variant">({item.source})</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TimelineSection({
  title,
  items,
}: {
  title: string;
  items: { date?: string; text: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4">
            {item.date ? (
              <span className="w-24 shrink-0 text-sm font-bold text-secondary">{item.date}</span>
            ) : (
              <span className="w-24 shrink-0" />
            )}
            <p className="text-on-surface leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuotesSection({
  title,
  items,
}: {
  title: string;
  items: { quote: string; speaker?: string; role?: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-6">
        {items.map((item, i) => (
          <li key={i} className="border-l-4 border-primary/30 pl-4">
            <blockquote className="text-lg italic text-on-surface">&ldquo;{item.quote}&rdquo;</blockquote>
            {(item.speaker || item.role) && (
              <p className="mt-2 text-sm text-on-surface-variant">
                {item.speaker}
                {item.role ? <span className="text-on-surface-variant"> — {item.role}</span> : null}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatsSection({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string | number; context?: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <dl className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl bg-surface-container-low p-4">
            <dt className="text-sm text-on-surface-variant">{item.label}</dt>
            <dd className="mt-1 text-2xl font-black text-on-surface">{item.value}</dd>
            {item.context ? (
              <p className="mt-1 text-sm text-on-surface-variant">{item.context}</p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.kind === "bullet") {
          return (
            <div key={i} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <p className="text-on-surface leading-relaxed">{b.text}</p>
            </div>
          );
        }
        if (b.kind === "text") {
          return (
            <p key={i} className="text-on-surface leading-relaxed">
              {b.text}
            </p>
          );
        }
        if (b.kind === "link") {
          const href = safeHttpUrl(b.url);
          return (
            <p key={i}>
              {href ? (
                <a
                  href={href}
                  className="font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {b.label}
                </a>
              ) : (
                <span className="font-semibold">{b.label}</span>
              )}
            </p>
          );
        }
        if (b.kind === "stat") {
          return (
            <div key={i} className="rounded-lg bg-surface-container-low p-3">
              <p className="text-sm text-on-surface-variant">{b.label}</p>
              <p className="text-xl font-bold text-on-surface">{b.value}</p>
            </div>
          );
        }
        if (b.kind === "quote") {
          return (
            <blockquote key={i} className="border-l-4 border-primary/30 pl-4 italic text-on-surface">
              &ldquo;{b.quote}&rdquo;
              {b.speaker ? (
                <footer className="mt-2 text-sm not-italic text-on-surface-variant">
                  — {b.speaker}
                </footer>
              ) : null}
            </blockquote>
          );
        }
        return null;
      })}
    </div>
  );
}

function GenericSection({ title, items }: { title: string; items: ContentBlock[] }) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ContentBlocks blocks={items} />
    </section>
  );
}

export function StorySections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => {
        switch (section.type) {
          case "bullet_list":
            return (
              <BulletListSection
                key={section.id}
                title={section.title}
                items={section.items}
              />
            );
          case "cards":
            return (
              <CardsSection key={section.id} title={section.title} items={section.items} />
            );
          case "links":
            return (
              <LinksSection key={section.id} title={section.title} items={section.items} />
            );
          case "timeline":
            return (
              <TimelineSection key={section.id} title={section.title} items={section.items} />
            );
          case "quotes":
            return (
              <QuotesSection key={section.id} title={section.title} items={section.items} />
            );
          case "stats":
            return (
              <StatsSection key={section.id} title={section.title} items={section.items} />
            );
          case "generic":
            return (
              <GenericSection key={section.id} title={section.title} items={section.items} />
            );
        }
      })}
    </div>
  );
}
