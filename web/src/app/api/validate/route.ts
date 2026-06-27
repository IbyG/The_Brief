import { NextResponse } from "next/server";
import {
  formatAjvErrors,
  validateStoryJson,
  validateStoryJsonForPreview,
} from "@/lib/validate-story";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false as const, phase: "parse" as const, message: "Invalid JSON body." },
      { status: 400 },
    );
  }
  const payload =
    typeof body === "object" && body !== null
      ? (body as { raw?: unknown; mode?: unknown })
      : {};
  const raw = typeof payload.raw === "string" ? payload.raw : "";
  const mode = payload.mode === "strict" ? "strict" : "preview";

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({
      ok: false as const,
      phase: "parse" as const,
      message,
    });
  }

  if (mode === "preview") {
    const result = validateStoryJsonForPreview(parsed);
    if (result.ok && result.data) {
      return NextResponse.json({
        ok: true as const,
        data: result.data,
        warnings: result.warnings,
      });
    }
    return NextResponse.json({
      ok: false as const,
      phase: "validate" as const,
      errors: result.errors.map((issue) =>
        issue.fix ? `${issue.path}: ${issue.message} — ${issue.fix}` : `${issue.path}: ${issue.message}`,
      ),
      issues: result.errors,
      warnings: result.warnings,
    });
  }

  const validated = validateStoryJson(parsed);
  if (!validated.ok) {
    return NextResponse.json({
      ok: false as const,
      phase: "validate" as const,
      errors: formatAjvErrors(validated.errors, parsed),
    });
  }

  return NextResponse.json({ ok: true as const, data: validated.data });
}
