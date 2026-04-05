import { NextResponse } from "next/server";
import { formatAjvErrors, validateStoryJson } from "@/lib/validate-story";

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
  const raw =
    typeof body === "object" &&
    body !== null &&
    "raw" in body &&
    typeof (body as { raw: unknown }).raw === "string"
      ? (body as { raw: string }).raw
      : "";

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

  const validated = validateStoryJson(parsed);
  if (!validated.ok) {
    return NextResponse.json({
      ok: false as const,
      phase: "validate" as const,
      errors: formatAjvErrors(validated.errors),
    });
  }

  return NextResponse.json({ ok: true as const, data: validated.data });
}
