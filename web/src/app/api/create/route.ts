import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  dailyBriefBasenameForIsoDate,
  isoDateTodayUtc,
} from "@/lib/daily-brief";
import { getBriefDataDir } from "@/lib/paths";
import { formatAjvErrors, validateStoryJson } from "@/lib/validate-story";

export const runtime = "nodejs";

function resolveFilename(raw: unknown): { ok: true; filename: string } | { ok: false; message: string } {
  const trimmed =
    typeof raw === "string" ? raw.trim() : raw == null || raw === "" ? "" : null;

  if (trimmed === null) {
    return { ok: false, message: "filename must be a string when provided." };
  }

  if (trimmed === "") {
    return {
      ok: true,
      filename: dailyBriefBasenameForIsoDate(isoDateTodayUtc()),
    };
  }

  const base = path.basename(trimmed);
  if (
    base !== trimmed ||
    base.includes("..") ||
    base.includes("/") ||
    base.includes("\\")
  ) {
    return {
      ok: false,
      message: "filename must be a plain basename (no path separators).",
    };
  }

  if (!/\.json$/i.test(base)) {
    return { ok: false, message: "filename must end with .json." };
  }

  return { ok: true, filename: base };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false as const,
        phase: "parse" as const,
        message: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const payload =
    typeof body === "object" && body !== null
      ? (body as { filename?: unknown; data?: unknown })
      : {};

  if (!("data" in payload) || payload.data === undefined) {
    return NextResponse.json(
      {
        ok: false as const,
        phase: "parse" as const,
        message: 'Missing "data" field with the Story Frame object.',
      },
      { status: 400 },
    );
  }

  const nameResult = resolveFilename(payload.filename);
  if (!nameResult.ok) {
    return NextResponse.json(
      {
        ok: false as const,
        phase: "filename" as const,
        message: nameResult.message,
      },
      { status: 400 },
    );
  }

  const validated = validateStoryJson(payload.data);
  if (!validated.ok) {
    return NextResponse.json(
      {
        ok: false as const,
        phase: "validate" as const,
        errors: formatAjvErrors(validated.errors, payload.data),
      },
      { status: 400 },
    );
  }

  const dataDir = getBriefDataDir();
  const targetPath = path.join(dataDir, nameResult.filename);

  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      targetPath,
      `${JSON.stringify(validated.data, null, 2)}\n`,
      "utf8",
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false as const,
        phase: "write" as const,
        message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true as const,
    filename: nameResult.filename,
  });
}
