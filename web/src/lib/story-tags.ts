import type { LoadedStory } from "@/lib/brief-data";

/** Distinct `meta.tags` values from loaded stories, sorted for stable chip order. */
export function collectTagsFromStories(stories: LoadedStory[]): string[] {
  const set = new Set<string>();
  for (const s of stories) {
    for (const t of s.story.meta?.tags ?? []) {
      const trimmed = t.trim();
      if (trimmed) {
        set.add(trimmed);
      }
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function storyMatchesTag(story: LoadedStory, tag: string): boolean {
  const needle = tag.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return (story.story.meta?.tags ?? []).some((t) => t.trim().toLowerCase() === needle);
}
