import { getAdminEmail } from "../../../../lib/admin";
import { getEvents } from "../../../../lib/event-data";
import { minutes } from "../../../../lib/events";
import { getDb } from "../../../../db";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!await getAdminEmail()) return Response.json({ error: "Please sign in." }, { status: 401 });
  try { return Response.json({ events: await getEvents(true) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Events are temporarily unavailable." }, { status: 503 }); }
}
export async function POST(request: Request) {
  if (!await getAdminEmail()) return Response.json({ error: "Please sign in." }, { status: 401 });
  let data: Record<string, unknown>;
  try { data = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Please check the event details." }, { status: 400 }); }
  const title = String(data.title ?? "").trim();
  const date = String(data.date ?? "").trim();
  const address = String(data.address ?? "").trim();
  const startTime = String(data.startTime ?? "").trim() || null;
  const endTime = String(data.endTime ?? "").trim() || null;
  const mode = data.mode;
  const capped = data.capped === true;
  const capacity = capped ? Number(data.capacity) : null;
  const appointmentMinutes = mode === "appointment" ? Number(data.appointmentMinutes) : null;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T12:00:00`)) && new Date(`${date}T12:00:00`).toISOString().startsWith(date);
  const validTime = (value: string | null) => value === null || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!title || title.length > 120 || !validDate || !address || address.length > 300 || (mode !== "appointment" && mode !== "general") || !validTime(startTime) || !validTime(endTime) || (endTime && !startTime) || (startTime && endTime && minutes(endTime) <= minutes(startTime)) || (capped && (!Number.isInteger(capacity) || capacity! < 1 || capacity! > 10000)) || (mode === "appointment" && (!startTime || !endTime || !Number.isInteger(appointmentMinutes) || appointmentMinutes! < 5 || appointmentMinutes! > 240 || minutes(endTime) - minutes(startTime) < appointmentMinutes!))) {
    return Response.json({ error: "Please complete the event details. Appointments need start and end times plus a whole-number length; a registration cap must be a positive whole number." }, { status: 400 });
  }
  const base = title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "event";
  const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
  try {
    await getDb().sql`INSERT INTO events (slug, title, event_date, address, start_time, end_time, registration_mode, appointment_minutes, capacity)
      VALUES (${slug}, ${title}, ${date}::date, ${address}, ${startTime}::time, ${endTime}::time, ${mode}, ${appointmentMinutes}, ${capacity})`;
    return Response.json({ ok: true, slug, path: `/events/${slug}` }, { status: 201 });
  } catch { return Response.json({ error: "We couldn't create the event. Please try again." }, { status: 503 }); }
}
