import type { LoadedStory } from "@/lib/brief-data";
import { StoryArticle } from "@/components/StoryArticle";

export function StoryFeedCard({ entry }: { entry: LoadedStory }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-0 shadow-[0_12px_24px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_16px_32px_rgba(0,0,0,0.06)]">
      <StoryArticle entry={entry} embed showSourceFilename />
    </div>
  );
}
