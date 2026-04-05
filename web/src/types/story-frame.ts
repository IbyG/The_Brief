/** Types aligned with Story Frame JSON Schema (see src/lib/story-frame.schema.json). */

export type SectionType =
  | "bullet_list"
  | "cards"
  | "links"
  | "timeline"
  | "quotes"
  | "stats"
  | "generic";

export interface BulletItem {
  text: string;
  note?: string;
}

export interface CardItem {
  category?: string;
  title: string;
  description: string;
  cta_label?: string;
  cta_url?: string;
}

export interface LinkItem {
  label: string;
  url: string;
  source?: string;
}

export interface TimelineItem {
  date?: string;
  text: string;
}

export interface QuoteItem {
  quote: string;
  speaker?: string;
  role?: string;
}

export interface StatItem {
  label: string;
  value: string | number;
  context?: string;
}

export type ContentBlock =
  | { kind: "bullet"; text: string }
  | { kind: "text"; text: string }
  | { kind: "link"; label: string; url: string }
  | { kind: "stat"; label: string; value: string | number }
  | { kind: "quote"; quote: string; speaker?: string };

export interface BaseSection {
  id: string;
  type: SectionType;
  title: string;
  description?: string;
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
}

export interface StoryFrame {
  rank: number;
  headline: string;
  date_confirmed?: string;
  sources_confirmed?: string[];
  summary?: string;
  sections: Section[];
  meta?: StoryMeta;
}
