import { getDb } from "../../../db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [rows, event] = await Promise.all([
      getDb().sql<{ slot: number }>`SELECT slot FROM registrations`,
      getDb().sql<{ active: boolean }>`SELECT active FROM events WHERE legacy_kind = 'photos'`
    ]);
    return Response.json({ fullSlots: rows.map(row => row.slot), active: event[0]?.active ?? false }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Availability is temporarily unavailable." }, { status: 503 }); }
}
