import { ADMIN_EMAILS, createAdminCookie, passwordMatches } from "../../../../lib/admin";
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid sign-in details." }, { status: 400 }); }
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number]) || !await passwordMatches(body.password ?? "")) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  await createAdminCookie(email);
  return Response.json({ ok: true });
}
