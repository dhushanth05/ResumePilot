import crypto from "crypto";
import { NextResponse } from "next/server";

import { setAdminSessionCookie } from "@/lib/adminSession";

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email ?? "";
  const password = body?.password ?? "";

  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";

  const ok =
    expectedEmail.length > 0 &&
    expectedPassword.length > 0 &&
    timingSafeEqualString(email, expectedEmail) &&
    timingSafeEqualString(password, expectedPassword);

  if (!ok) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
