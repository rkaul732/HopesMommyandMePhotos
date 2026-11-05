import { getAdminEmail } from "../../../../../lib/admin";
import { getDb } from "../../../../../db";
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!await getAdminEmail()) return Response.json({ error: "Please sign in." }, { status: 401 });
  let body: { active?: unknown };
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body.active !== "boolean") return Response.json({ error: "Choose whether registration is active." }, { status: 400 });
  const { slug } = await params;
  try {
    const rows = await getDb().sql<{ slug: string }>`UPDATE events SET active = ${body.active} WHERE slug = ${slug} RETURNING slug`;
    if (!rows.length) return Response.json({ error: "Event not found." }, { status: 404 });
    return Response.json({ ok: true, active: body.active });
  } catch { return Response.json({ error: "Could not update the event." }, { status: 503 }); }
}
