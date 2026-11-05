import { getEvent } from "../../../../lib/event-data";
import { getDb } from "../../../../db";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const event = await getEvent(slug);
    if (!event || event.legacyKind) return Response.json({ error: "Event not found." }, { status: 404 });
    const rows = event.mode === "appointment" ? await getDb().sql<{ slotIndex: number }>`SELECT slot_index AS "slotIndex" FROM event_registrations WHERE event_id = ${event.id}::bigint` : [];
    return Response.json({ event, fullSlots: rows.map(row => row.slotIndex) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Event details are temporarily unavailable." }, { status: 503 }); }
}
