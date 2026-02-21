import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

function base64UrlEncode(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlEncodeString(input: string): string {
  return base64UrlEncode(Buffer.from(input, "utf8"));
}

function base64UrlDecodeToBuffer(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

function sign(payloadB64: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payloadB64);
  return base64UrlEncode(hmac.digest());
}

export function setAdminSessionCookie(): void {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }

  const payload = {
    iat: Date.now(),
  };

  const payloadB64 = base64UrlEncodeString(JSON.stringify(payload));
  const sig = sign(payloadB64, secret);
  const token = `${payloadB64}.${sig}`;

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSessionCookie(): void {
  cookies().set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  if (!token) return false;

  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;

  const expectedSig = sign(payloadB64, secret);

  const a = base64UrlDecodeToBuffer(sig);
  const b = base64UrlDecodeToBuffer(expectedSig);
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

export const ADMIN_SESSION_COOKIE_NAME = COOKIE_NAME;
