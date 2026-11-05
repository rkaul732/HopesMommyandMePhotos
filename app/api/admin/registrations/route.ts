import { getAdminEmail } from "../../../../lib/admin";
import { getDb } from "../../../../db";
import type { Registration } from "../../../../db";
export const dynamic = "force-dynamic";
type MusicRegistration = Omit<Registration, "slot">;
type CustomRegistration = MusicRegistration & { eventSlug: string; slotIndex: number | null };
export async function GET() {
  if (!await getAdminEmail()) return Response.json({ error: "Please sign in." }, { status: 401 });
  try {
    const [photos, music, custom] = await Promise.all([
      getDb().sql<Registration>`SELECT id, slot, first_name AS "firstName", last_name AS "lastName", email, phone, created_at AS "createdAt" FROM registrations ORDER BY slot`,
      getDb().sql<MusicRegistration>`SELECT id, first_name AS "firstName", last_name AS "lastName", email, phone, created_at AS "createdAt" FROM music_registrations ORDER BY created_at, id`,
      getDb().sql<CustomRegistration>`SELECT r.id, e.slug AS "eventSlug", r.slot_index AS "slotIndex", r.first_name AS "firstName", r.last_name AS "lastName", r.email, r.phone, r.created_at AS "createdAt" FROM event_registrations r JOIN events e ON e.id = r.event_id ORDER BY r.created_at, r.id`
    ]);
    return Response.json({ photos, music, custom }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Registrations are temporarily unavailable." }, { status: 503 }); }
}
