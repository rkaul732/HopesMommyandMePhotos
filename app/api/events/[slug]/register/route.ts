import { getEvent } from "../../../../../lib/event-data";
import { slotList } from "../../../../../lib/events";
import { getDb } from "../../../../../db";
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  let data: Record<string, unknown>;
  try { data = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Please check your information and try again." }, { status: 400 }); }
  const { slug } = await params;
  const firstName = String(data.firstName ?? "").trim();
  const lastName = String(data.lastName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const phone = String(data.phone ?? "").trim();
  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^[+\d\s().-]{7,25}$/.test(phone)) return Response.json({ error: "Please complete every contact field." }, { status: 400 });
  try {
    const event = await getEvent(slug);
    if (!event || event.legacyKind) return Response.json({ error: "Event not found." }, { status: 404 });
    if (!event.active) return Response.json({ error: "Registration for this event is closed." }, { status: 409 });
    const slot = data.slot;
    if (event.mode === "appointment" && (!Number.isInteger(slot) || !slotList(event).some(item => item.index === slot))) return Response.json({ error: "Choose an available appointment." }, { status: 400 });
    const slotIndex = event.mode === "appointment" ? Number(slot) : null;
    // Lock the event row before inserting and only increment its count if the insert succeeds.
    // Concurrent submissions therefore cannot exceed the overall capacity.
    const rows = await getDb().sql<{ id: string }>`
      WITH eligible AS MATERIALIZED (
        SELECT id FROM events
        WHERE slug = ${slug} AND active = TRUE AND legacy_kind IS NULL
          AND (capacity IS NULL OR registration_count < capacity)
        FOR UPDATE
      ), inserted AS (
        INSERT INTO event_registrations (event_id, slot_index, first_name, last_name, email, phone)
        SELECT id, ${slotIndex}, ${firstName}, ${lastName}, ${email}, ${phone} FROM eligible
        ON CONFLICT (event_id, slot_index) WHERE slot_index IS NOT NULL DO NOTHING
        RETURNING event_id
      )
      UPDATE events SET registration_count = registration_count + 1
      WHERE id IN (SELECT event_id FROM inserted)
      RETURNING id::text AS id`;
    if (!rows.length) return Response.json({ error: event.mode === "appointment" ? "That appointment is now full, or registration has closed. Please refresh." : "Registration is full or has closed." }, { status: 409 });
    return Response.json({ ok: true }, { status: 201 });
  } catch { return Response.json({ error: "We couldn't save your registration. Please try again." }, { status: 503 }); }
}
