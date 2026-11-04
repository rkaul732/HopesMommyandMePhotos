import { env } from "cloudflare:workers";
import { cookies } from "next/headers";

export const ADMIN_EMAILS = ["tmolhem@brightharbor.org", "rkaul@brightharbor.org"] as const;
const cookieName = "hopes_admin";
function hex(bytes: ArrayBuffer) { return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join(""); }
async function signature(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}
export async function passwordMatches(value: string) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return false;
  const digest = async (s: string) => hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  return (await digest(value)) === (await digest(env.ADMIN_PASSWORD));
}
export async function createAdminCookie(email: string) {
  const expires = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  const payload = `${email}|${expires}`;
  (await cookies()).set(cookieName, `${payload}|${await signature(payload)}`, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}
export async function clearAdminCookie() { (await cookies()).delete(cookieName); }
export async function getAdminEmail() {
  if (!env.SESSION_SECRET) return null;
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return null;
  const [email, expiration, received] = value.split("|");
  if (!email || !expiration || !received || !ADMIN_EMAILS.includes(email as typeof ADMIN_EMAILS[number])) return null;
  if (Number(expiration) < Date.now() / 1000) return null;
  return await signature(`${email}|${expiration}`) === received ? email : null;
}
