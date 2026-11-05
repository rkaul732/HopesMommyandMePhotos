import { getDb } from "../db";
import type { EventItem } from "./events";
type EventRow = Omit<EventItem, "registered">;
// Query templates cannot interpolate SQL identifiers, so keep the two fixed queries here.
export async function getEvents(includeInactive = false): Promise<EventItem[]> {
  const db = getDb();
  const rows = includeInactive
    ? await db.sql<EventRow>`SELECT id::text AS id, slug, title, event_date::text AS date, address, LEFT(start_time::text, 5) AS "startTime", LEFT(end_time::text, 5) AS "endTime", registration_mode AS mode, appointment_minutes AS "appointmentMinutes", capacity, active, legacy_kind AS "legacyKind" FROM events ORDER BY event_date, start_time NULLS LAST, id`
    : await db.sql<EventRow>`SELECT id::text AS id, slug, title, event_date::text AS date, address, LEFT(start_time::text, 5) AS "startTime", LEFT(end_time::text, 5) AS "endTime", registration_mode AS mode, appointment_minutes AS "appointmentMinutes", capacity, active, legacy_kind AS "legacyKind" FROM events WHERE active = TRUE ORDER BY event_date, start_time NULLS LAST, id`;
  const counts = await db.sql<{ legacyKind: string | null; eventId: string | null; registered: number }>`
    SELECT 'photos'::text AS "legacyKind", NULL::text AS "eventId", COUNT(*)::int AS registered FROM registrations
    UNION ALL SELECT 'music', NULL, COUNT(*)::int FROM music_registrations
    UNION ALL SELECT NULL, e.id::text, e.registration_count FROM events e WHERE e.legacy_kind IS NULL`;
  return rows.map(row => ({ ...row, registered: counts.find(count => row.legacyKind ? count.legacyKind === row.legacyKind : count.eventId === row.id)?.registered ?? 0 }));
}
export async function getEvent(slug: string) { return (await getEvents(true)).find(event => event.slug === slug) ?? null; }
