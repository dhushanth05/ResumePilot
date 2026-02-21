"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analytics/overview");
  }, [router]);

  return null;
}
