import path from "path";

/**
 * Resolved absolute path to the brief JSON directory.
 * - `BRIEF_DATA_DIR` when set (e.g. `/data` in Docker)
 * - In production without env: `/data`
 * - In development: `<cwd>/data` (run Next from `web/` so use `web/data`)
 */
export function getBriefDataDir(): string {
  const fromEnv = process.env.BRIEF_DATA_DIR?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    return "/data";
  }
  return path.join(process.cwd(), "data");
}
