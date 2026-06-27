import type { ContentBlock, DisplayStyle, Section } from "@/types/story-frame";
import { RichText, RichTextQuote } from "@/components/RichText";
import {
  formatDisplayValue,
  itemSurfaceClass,
  itemSurfaceStyle,
  itemValueClass,
  itemValueStyle,
  resolveContexts,
  sectionGridClass,
} from "@/lib/story-display";
import { safeHttpUrl } from "@/lib/safe-url";

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-primary mb-6 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em]">
      <RichText as="span">{children}</RichText>
    </h3>
  );
}

function ContextLines({ contexts }: { contexts: string[] }) {
  if (contexts.length === 0) {
    return null;
  }
  return (
    <div className="mt-1 space-y-0.5">
      {contexts.map((ctx, i) => (
        <RichText key={i} as="p" className="text-sm text-on-surface-variant">
          {ctx}
        </RichText>
      ))}
    </div>
  );
}

function StyledSurface({
  style,
  className,
  children,
}: {
  style?: DisplayStyle;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${itemSurfaceClass(style)}${className ? ` ${className}` : ""}`}
      style={itemSurfaceStyle(style)}
    >
      {children}
    </div>
  );
}

function StatValue({
  value,
  style,
  className,
}: {
  value: string | number | boolean;
  style?: DisplayStyle;
  className: string;
}) {
  if (typeof value === "string") {
    return (
      <RichText as="dd" className={className} style={itemValueStyle(style)}>
        {value}
      </RichText>
    );
  }
  return (
    <dd className={className} style={itemValueStyle(style)}>
      {formatDisplayValue(value)}
    </dd>
  );
}

function BulletListSection({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: { text: string; note?: string; color?: string; highlight?: boolean }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      {description ? (
        <RichText as="p" className="mb-4 text-sm text-on-surface-variant">
          {description}
        </RichText>
      ) : null}
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="group/item flex items-start gap-4">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              aria-hidden
              style={item.color?.startsWith("#") ? { backgroundColor: item.color } : undefined}
            />
            <div className="text-on-surface leading-relaxed">
              <RichText as="p">{item.text}</RichText>
              {item.note ? (
                <RichText as="p" className="mt-1 text-sm text-on-surface-variant">
                  {item.note}
                </RichText>
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
    context?: string | string[];
    contexts?: string[];
    color?: string;
    accent?: string;
    variant?: string;
    highlight?: boolean;
  }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-4">
        {items.map((c, i) => {
          const cta = c.cta_url ? safeHttpUrl(c.cta_url) : "";
          const contexts = resolveContexts(c);
          return (
            <StyledSurface key={i} style={c}>
              {c.category ? (
                <RichText as="p" className="mb-2 text-xs font-bold uppercase tracking-wide text-secondary">
                  {c.category}
                </RichText>
              ) : null}
              <RichText as="p" className="text-lg font-bold text-on-surface">
                {c.title}
              </RichText>
              <RichText as="p" className="mt-2 text-on-surface-variant">
                {c.description}
              </RichText>
              <ContextLines contexts={contexts} />
              {c.cta_label && cta ? (
                <a
                  href={cta}
                  className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <RichText as="span">{c.cta_label}</RichText>
                </a>
              ) : null}
            </StyledSurface>
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
  items: { label: string; url: string; source?: string; color?: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-3">
        {items.map((item, i) => {
          const href = safeHttpUrl(item.url);
          const linkStyle = item.color?.startsWith("#") ? { color: item.color } : undefined;
          return (
            <li key={i}>
              {href ? (
                <a
                  href={href}
                  className="font-semibold text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                  style={linkStyle}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <RichText as="span">{item.label}</RichText>
                </a>
              ) : (
                <RichText as="span" className="font-semibold text-on-surface-variant">
                  {item.label}
                </RichText>
              )}
              {item.source ? (
                <span className="ml-2 text-sm text-on-surface-variant">
                  (<RichText as="span">{item.source}</RichText>)
                </span>
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
  items: { date?: string; text: string; color?: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4">
            {item.date ? (
              <RichText
                as="span"
                className="w-24 shrink-0 text-sm font-bold text-secondary"
                style={item.color?.startsWith("#") ? { color: item.color } : undefined}
              >
                {item.date}
              </RichText>
            ) : (
              <span className="w-24 shrink-0" />
            )}
            <RichText as="p" className="text-on-surface leading-relaxed">
              {item.text}
            </RichText>
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
  items: { quote: string; speaker?: string; role?: string; color?: string }[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="space-y-6">
        {items.map((item, i) => (
          <li
            key={i}
            className="border-l-4 border-primary/30 pl-4"
            style={
              item.color?.startsWith("#")
                ? { borderLeftColor: `${item.color}66` }
                : undefined
            }
          >
            <RichTextQuote className="text-lg italic text-on-surface">
              {item.quote}
            </RichTextQuote>
            {(item.speaker || item.role) && (
              <p className="mt-2 text-sm text-on-surface-variant">
                {item.speaker ? <RichText as="span">{item.speaker}</RichText> : null}
                {item.role ? (
                  <span className="text-on-surface-variant">
                    {" "}
                    — <RichText as="span">{item.role}</RichText>
                  </span>
                ) : null}
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
  columns,
}: {
  title: string;
  items: {
    label: string;
    value: string | number | boolean;
    context?: string | string[];
    contexts?: string[];
    color?: string;
    accent?: string;
    variant?: string;
    highlight?: boolean;
  }[];
  columns?: number;
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <dl className={sectionGridClass(columns)}>
        {items.map((item, i) => {
          const contexts = resolveContexts(item);
          return (
            <StyledSurface key={i} style={item}>
              <RichText as="dt" className="text-sm text-on-surface-variant">
                {item.label}
              </RichText>
              <StatValue
                value={item.value}
                style={item}
                className={`mt-1 text-2xl font-black ${itemValueClass(item)}`}
              />
              <ContextLines contexts={contexts} />
            </StyledSurface>
          );
        })}
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
              <RichText as="p" className="text-on-surface leading-relaxed">
                {b.text}
              </RichText>
            </div>
          );
        }
        if (b.kind === "text") {
          return (
            <RichText key={i} as="p" className="text-on-surface leading-relaxed">
              {b.text}
            </RichText>
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
                  <RichText as="span">{b.label}</RichText>
                </a>
              ) : (
                <RichText as="span" className="font-semibold">
                  {b.label}
                </RichText>
              )}
            </p>
          );
        }
        if (b.kind === "stat") {
          const contexts = resolveContexts(b);
          return (
            <StyledSurface key={i} style={b}>
              <RichText as="p" className="text-sm text-on-surface-variant">
                {b.label}
              </RichText>
              {typeof b.value === "string" ? (
                <RichText
                  as="p"
                  className={`text-xl font-bold ${itemValueClass(b)}`}
                  style={itemValueStyle(b)}
                >
                  {b.value}
                </RichText>
              ) : (
                <p
                  className={`text-xl font-bold ${itemValueClass(b)}`}
                  style={itemValueStyle(b)}
                >
                  {formatDisplayValue(b.value)}
                </p>
              )}
              <ContextLines contexts={contexts} />
            </StyledSurface>
          );
        }
        if (b.kind === "quote") {
          return (
            <div key={i}>
              <RichTextQuote className="border-l-4 border-primary/30 pl-4 italic text-on-surface">
                {b.quote}
              </RichTextQuote>
              {b.speaker ? (
                <footer className="mt-2 text-sm not-italic text-on-surface-variant">
                  — <RichText as="span">{b.speaker}</RichText>
                </footer>
              ) : null}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function GenericSection({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: ContentBlock[];
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      {description ? (
        <RichText as="p" className="mb-4 text-sm text-on-surface-variant">
          {description}
        </RichText>
      ) : null}
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
                description={section.description}
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
              <StatsSection
                key={section.id}
                title={section.title}
                items={section.items}
                columns={section.columns}
              />
            );
          case "generic":
            return (
              <GenericSection
                key={section.id}
                title={section.title}
                description={section.description}
                items={section.items}
              />
            );
        }
      })}
    </div>
  );
}
