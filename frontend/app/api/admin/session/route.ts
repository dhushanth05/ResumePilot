import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const authenticated = verifyAdminSessionToken(token);
  return NextResponse.json({ authenticated });
}
