"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStoredAppState } from "./components/curator/storage";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const state = loadStoredAppState();
    if (state.hasCompletedOnboarding) {
      router.replace("/home");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  return null;
}
