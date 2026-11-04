import { getDb } from "../../../db";
export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try { data = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Please check your information and try again." }, { status: 400 }); }
  const firstName = String(data.firstName ?? "").trim();
  const lastName = String(data.lastName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const phone = String(data.phone ?? "").trim();
  const slot = data.slot;
  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^[+\d\s().-]{7,25}$/.test(phone) || !Number.isInteger(slot) || Number(slot) < 0 || Number(slot) > 14) {
    return Response.json({ error: "Please complete every field and choose an available time." }, { status: 400 });
  }
  try {
    await getDb().sql`INSERT INTO registrations (slot, first_name, last_name, email, phone) VALUES (${Number(slot)}, ${firstName}, ${lastName}, ${email}, ${phone})`;
    return Response.json({ ok: true, slot }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    try {
      const booked = await getDb().sql<{ id: number }>`SELECT id FROM registrations WHERE slot = ${Number(slot)} LIMIT 1`;
      if (booked.length) return Response.json({ error: "That time is now full. Please choose another time." }, { status: 409 });
    } catch { /* Preserve the original error response below. */ }
    if (/unique|constraint/i.test(message)) return Response.json({ error: "That time is now full. Please choose another time." }, { status: 409 });
    return Response.json({ error: "We couldn't save your registration. Please try again." }, { status: 503 });
  }
}
