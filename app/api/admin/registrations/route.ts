import { getAdminEmail } from "../../../../lib/admin";
import { getDb } from "../../../../db";
import { registrations } from "../../../../db/schema";
import { asc } from "drizzle-orm";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!await getAdminEmail()) return Response.json({ error: "Please sign in." }, { status: 401 });
  try {
    const rows = await getDb().select().from(registrations).orderBy(asc(registrations.slot));
    return Response.json({ registrations: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Registrations are temporarily unavailable." }, { status: 503 }); }
}
