import type { IngestError } from "@/lib/brief-data";
import { userFacingRenderReason } from "@/lib/ingest-errors";

export function IngestNotifications({ errors }: { errors: IngestError[] }) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" role="region" aria-label="Brief file notifications">
      {errors.map((e, i) => {
        const reason = userFacingRenderReason(e);
        return (
          <div
            key={`${e.file}-${e.phase}-${i}`}
            className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-surface shadow-[0_12px_24px_rgba(186,26,26,0.12)]"
            role="alert"
          >
            <p>
              <span className="font-mono font-semibold">&quot;{e.file}&quot;</span> could not be
              rendered due to <span className="font-medium">&quot;{reason}&quot;</span>.
            </p>
          </div>
        );
      })}
    </div>
  );
}
