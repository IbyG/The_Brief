import type { Section, SectionType } from "@/types/story-frame";
import bulletList from "./bullet_list.json";
import cards from "./cards.json";
import generic from "./generic.json";
import links from "./links.json";
import quotes from "./quotes.json";
import stats from "./stats.json";
import timeline from "./timeline.json";

export interface SectionSampleEntry {
  /** Matches `Section["type"]` — used as the stable key for selection. */
  type: SectionType;
  label: string;
  description: string;
  section: Section;
}

/** Sample sections aligned with `Documentation_References/JSON References/JSON_Schema.json`. */
export const SECTION_SAMPLES: readonly SectionSampleEntry[] = [
  {
    type: "bullet_list",
    label: "Bullet list",
    description: "Key points with optional notes per bullet.",
    section: bulletList as Section,
  },
  {
    type: "cards",
    label: "Cards",
    description: "Title, description, optional category and outbound CTA.",
    section: cards as Section,
  },
  {
    type: "links",
    label: "Links",
    description: "Labeled URLs with optional source attribution.",
    section: links as Section,
  },
  {
    type: "timeline",
    label: "Timeline",
    description: "Dated or undated events in order.",
    section: timeline as Section,
  },
  {
    type: "quotes",
    label: "Quotes",
    description: "Pull quotes with optional speaker and role.",
    section: quotes as Section,
  },
  {
    type: "stats",
    label: "Stats",
    description: "Label / value pairs with optional context.",
    section: stats as Section,
  },
  {
    type: "generic",
    label: "Generic",
    description: "Mixed text, bullets, links, stats, and quote blocks.",
    section: generic as Section,
  },
];
