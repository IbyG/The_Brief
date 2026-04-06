/**
 * Daily brief files use `daily_brief_DD-MM-YYYY.json` (see PRD).
 * `isoDate` is `YYYY-MM-DD`.
 */
export function dailyBriefBasenameForIsoDate(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) {
    return "";
  }
  const [, y, mo, d] = m;
  return `daily_brief_${d}-${mo}-${y}.json`;
}

/**
 * If the filename ends with `_DD-MM-YYYY.json` (e.g. `daily_brief_07-04-2026.json`,
 * `ex3_07-04-2026.json`), returns that calendar day as ISO `YYYY-MM-DD`. Otherwise null.
 */
export function isoDateFromBriefFilename(filename: string): string | null {
  const m = /_(\d{2})-(\d{2})-(\d{4})\.json$/i.exec(filename.trim());
  if (!m) {
    return null;
  }
  const [, d, mo, y] = m;
  return `${y}-${mo}-${d}`;
}

export function isoDateTodayUtc(): string {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}
