import { getAdminEmail } from "../../../../lib/admin";
import { getDb } from "../../../../db";
import type { Registration } from "../../../../db";
export const dynamic = "force-dynamic";
type MusicRegistration = Omit<Registration, "slot">;
export async function GET() {
  if (!await getAdminEmail()) return Response.json({ error: "Please sign in." }, { status: 401 });
  try {
    const [photos, music] = await Promise.all([
      getDb().sql<Registration>`SELECT id, slot, first_name AS "firstName", last_name AS "lastName", email, phone, created_at AS "createdAt" FROM registrations ORDER BY slot`,
      getDb().sql<MusicRegistration>`SELECT id, first_name AS "firstName", last_name AS "lastName", email, phone, created_at AS "createdAt" FROM music_registrations ORDER BY created_at, id`
    ]);
    return Response.json({ photos, music, registrations: photos }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Registrations are temporarily unavailable." }, { status: 503 }); }
}
