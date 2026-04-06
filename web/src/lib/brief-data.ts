import fs from "fs/promises";
import path from "path";
import type { StoryFrame } from "@/types/story-frame";
import { dailyBriefBasenameForIsoDate, isoDateFromBriefFilename } from "@/lib/daily-brief";
import { getBriefDataDir } from "@/lib/paths";
import { formatAjvErrors, validateStoryJson } from "@/lib/validate-story";
import { logIngest, type IngestPhase } from "@/lib/ingest-log";

export interface IngestError {
  file: string;
  phase: IngestPhase;
  message: string;
}

export interface LoadedStory {
  basename: string;
  filename: string;
  mtimeMs: number;
  story: StoryFrame;
}

export interface BriefsResult {
  dataDir: string;
  loadedAt: string;
  dailyBriefBasename: string | null;
  /** True when `dailyBriefBasename` exists on disk. */
  dailyBriefFilePresent: boolean;
  /** Kept for API stability; always false. */
  dailyBriefActive: false;
  /** Stories are limited to JSON files whose names encode this calendar day (`*_DD-MM-YYYY.json`). */
  scope: "day";
  stories: LoadedStory[];
  errors: IngestError[];
}

function sortStories(a: LoadedStory, b: LoadedStory): number {
  if (a.story.rank !== b.story.rank) {
    return a.story.rank - b.story.rank;
  }
  if (a.basename !== b.basename) {
    return a.basename.localeCompare(b.basename);
  }
  return a.mtimeMs - b.mtimeMs;
}

async function readOneJsonFile(
  dir: string,
  name: string,
  errors: IngestError[],
): Promise<LoadedStory | null> {
  const filename = path.join(dir, name);
  let text: string;
  try {
    text = await fs.readFile(filename, "utf8");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    errors.push({ file: name, phase: "read", message });
    logIngest({
      level: "error",
      phase: "read",
      file: name,
      message,
    });
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    errors.push({ file: name, phase: "parse", message });
    logIngest({
      level: "error",
      phase: "parse",
      file: name,
      message,
    });
    return null;
  }

  const validated = validateStoryJson(parsed);
  if (!validated.ok) {
    const lines = formatAjvErrors(validated.errors);
    const message = lines.join("; ");
    errors.push({ file: name, phase: "validate", message });
    logIngest({
      level: "warn",
      phase: "validate",
      file: name,
      message,
    });
    return null;
  }

  let stat: { mtimeMs: number };
  try {
    stat = await fs.stat(filename);
  } catch {
    stat = { mtimeMs: 0 };
  }

  return {
    basename: name.replace(/\.json$/i, ""),
    filename: name,
    mtimeMs: stat.mtimeMs,
    story: validated.data,
  };
}

export interface LoadBriefsOptions {
  /** ISO date `YYYY-MM-DD`; drives daily brief filename. */
  isoDate: string;
}

export async function loadBriefs(options: LoadBriefsOptions): Promise<BriefsResult> {
  const dataDir = getBriefDataDir();
  const loadedAt = new Date().toISOString();
  const errors: IngestError[] = [];
  const dailyBasename = dailyBriefBasenameForIsoDate(options.isoDate);
  const dailyBriefBasename = dailyBasename || null;

  let entries: string[] = [];
  try {
    entries = await fs.readdir(dataDir);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    errors.push({ file: dataDir, phase: "read", message });
    logIngest({
      level: "error",
      phase: "read",
      file: dataDir,
      message,
    });
    return {
      dataDir,
      loadedAt,
      dailyBriefBasename,
      dailyBriefFilePresent: false,
      dailyBriefActive: false,
      scope: "day",
      stories: [],
      errors,
    };
  }

  const jsonFiles = entries.filter(
    (n) => n.toLowerCase().endsWith(".json") && !n.startsWith("."),
  );

  const jsonFilesForDate = jsonFiles.filter(
    (n) => isoDateFromBriefFilename(n) === options.isoDate,
  );

  const stories: LoadedStory[] = [];
  for (const name of jsonFilesForDate.sort((a, b) => a.localeCompare(b))) {
    const loaded = await readOneJsonFile(dataDir, name, errors);
    if (loaded) {
      stories.push(loaded);
    }
  }
  stories.sort(sortStories);

  const dailyPresent =
    Boolean(dailyBriefBasename) && jsonFiles.includes(dailyBriefBasename ?? "");

  return {
    dataDir,
    loadedAt,
    dailyBriefBasename,
    dailyBriefFilePresent: dailyPresent,
    dailyBriefActive: false,
    scope: "day",
    stories,
    errors,
  };
}
