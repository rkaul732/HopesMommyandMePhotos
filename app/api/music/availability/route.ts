import { getDb } from "../../../../db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const rows = await getDb().sql<{ registered: number }>`SELECT COUNT(*)::int AS registered FROM music_registrations`;
    const registered = rows[0]?.registered ?? 0;
    return Response.json({ registered, remaining: Math.max(0, 10 - registered), full: registered >= 10 }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Availability is temporarily unavailable." }, { status: 503 }); }
}
