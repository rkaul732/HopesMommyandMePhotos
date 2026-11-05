import { getEvents } from "../../../lib/event-data";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return Response.json({ events: await getEvents() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Events are temporarily unavailable." }, { status: 503 }); }
}
