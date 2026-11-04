import { getDb } from "../../../db";
import { registrations } from "../../../db/schema";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const rows = await getDb().select({ slot: registrations.slot }).from(registrations);
    return Response.json({ fullSlots: rows.map(row => row.slot) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Availability is temporarily unavailable." }, { status: 503 }); }
}
