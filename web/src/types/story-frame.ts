/** Types aligned with Story Frame JSON Schema (see src/lib/story-frame.schema.json). */

export type SectionType =
  | "bullet_list"
  | "cards"
  | "links"
  | "timeline"
  | "quotes"
  | "stats"
  | "generic";

export interface DisplayStyle {
  color?: string;
  accent?: string;
  variant?: string;
  highlight?: boolean;
}

export type ContextField = string | string[];

export interface BulletItem extends DisplayStyle {
  text: string;
  note?: string;
}

export interface CardItem extends DisplayStyle {
  category?: string;
  title: string;
  description: string;
  cta_label?: string;
  cta_url?: string;
  context?: ContextField;
  contexts?: string[];
}

export interface LinkItem extends DisplayStyle {
  label: string;
  url: string;
  source?: string;
}

export interface TimelineItem extends DisplayStyle {
  date?: string;
  text: string;
}

export interface QuoteItem extends DisplayStyle {
  quote: string;
  speaker?: string;
  role?: string;
}

export interface StatItem extends DisplayStyle {
  label: string;
  value: string | number | boolean;
  context?: ContextField;
  contexts?: string[];
}

export type ContentBlock =
  | ({ kind: "bullet"; text: string } & DisplayStyle)
  | ({ kind: "text"; text: string } & DisplayStyle)
  | ({ kind: "link"; label: string; url: string } & DisplayStyle)
  | ({
      kind: "stat";
      label: string;
      value: string | number | boolean;
      context?: ContextField;
      contexts?: string[];
    } & DisplayStyle)
  | ({ kind: "quote"; quote: string; speaker?: string } & DisplayStyle);

export interface BaseSection {
  id: string;
  type: SectionType;
  title: string;
  description?: string;
  layout?: string;
  columns?: number;
}

export type Section =
  | (BaseSection & { type: "bullet_list"; items: BulletItem[] })
  | (BaseSection & { type: "cards"; items: CardItem[] })
  | (BaseSection & { type: "links"; items: LinkItem[] })
  | (BaseSection & { type: "timeline"; items: TimelineItem[] })
  | (BaseSection & { type: "quotes"; items: QuoteItem[] })
  | (BaseSection & { type: "stats"; items: StatItem[] })
  | (BaseSection & { type: "generic"; items: ContentBlock[] });

export interface StoryMeta {
  topic?: string;
  audience?: string;
  priority?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface StoryFrame {
  rank?: number;
  headline: string;
  date_confirmed?: string;
  sources_confirmed?: string[];
  summary?: string;
  sections: Section[];
  meta?: StoryMeta;
}
