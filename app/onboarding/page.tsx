"use client";

import { useRouter } from "next/navigation";
import { OnboardingScreen } from "@/app/components/curator/screens-core";
import { loadStoredAppState, saveStoredAppState } from "@/app/components/curator/storage";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    const current = loadStoredAppState();
    saveStoredAppState({ ...current, hasCompletedOnboarding: true, lastScreen: "dashboard" });
    router.replace("/home");
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}