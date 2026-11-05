import { getDb } from "../../../../db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [rows, event] = await Promise.all([
      getDb().sql<{ registered: number }>`SELECT COUNT(*)::int AS registered FROM music_registrations`,
      getDb().sql<{ active: boolean }>`SELECT active FROM events WHERE legacy_kind = 'music'`
    ]);
    const registered = rows[0]?.registered ?? 0;
    return Response.json({ registered, remaining: Math.max(0, 10 - registered), full: registered >= 10, active: event[0]?.active ?? false }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Availability is temporarily unavailable." }, { status: 503 }); }
}
