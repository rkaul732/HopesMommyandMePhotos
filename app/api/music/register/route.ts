import { getDb } from "../../../../db";
export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try { data = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Please check your information and try again." }, { status: 400 }); }
  const firstName = String(data.firstName ?? "").trim();
  const lastName = String(data.lastName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const phone = String(data.phone ?? "").trim();
  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^[+\d\s().-]{7,25}$/.test(phone)) return Response.json({ error: "Please complete every field." }, { status: 400 });
  try {
    // A unique spot constraint makes the allocation safe if visitors register at once.
    for (let attempt = 0; attempt < 11; attempt++) {
      const rows = await getDb().sql<{ spot: number }>`
        INSERT INTO music_registrations (spot, first_name, last_name, email, phone)
        SELECT candidate, ${firstName}, ${lastName}, ${email}, ${phone}
        FROM generate_series(0, 9) AS candidate
        WHERE NOT EXISTS (SELECT 1 FROM music_registrations WHERE spot = candidate)
        ORDER BY candidate LIMIT 1
        ON CONFLICT (spot) DO NOTHING
        RETURNING spot`;
      if (rows.length) return Response.json({ ok: true }, { status: 201 });
      const count = await getDb().sql<{ registered: number }>`SELECT COUNT(*)::int AS registered FROM music_registrations`;
      if ((count[0]?.registered ?? 0) >= 10) return Response.json({ error: "Registration is full for this class." }, { status: 409 });
    }
    return Response.json({ error: "Please try registering again." }, { status: 503 });
  } catch { return Response.json({ error: "We couldn't save your registration. Please try again." }, { status: 503 }); }
}
