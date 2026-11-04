import { getDb } from "../../../db";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const rows = await getDb().sql<{ slot: number }>`SELECT slot FROM registrations`;
    return Response.json({ fullSlots: rows.map(row => row.slot) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Availability is temporarily unavailable." }, { status: 503 }); }
}
