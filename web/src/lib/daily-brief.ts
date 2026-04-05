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

export function isoDateTodayUtc(): string {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}
