import { NextResponse } from "next/server";
import { loadBriefs } from "@/lib/brief-data";
import { isoDateTodayUtc } from "@/lib/daily-brief";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("date");
  const isoDate =
    raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : isoDateTodayUtc();
  const result = await loadBriefs({ isoDate });
  return NextResponse.json(result);
}
