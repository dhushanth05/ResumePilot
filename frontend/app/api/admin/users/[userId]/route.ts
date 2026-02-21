import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const token = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
  const adminKey = process.env.ADMIN_API_KEY ?? "";

  const res = await fetch(`${base}/admin/users/${params.userId}`, {
    method: "DELETE",
    headers: {
      "X-Admin-Key": adminKey,
    },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { message: (data as any)?.detail ?? "Request failed" },
      { status: res.status }
    );
  }

  return NextResponse.json(data ?? { ok: true });
}
