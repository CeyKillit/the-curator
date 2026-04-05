"use client";

import { useRouter } from "next/navigation";
import { useCurator } from "@/app/contexts/curator-context";
import { SimuladoScreen } from "@/app/components/curator/screens-content";
import { useEffect } from "react";

export default function SimuladoPage() {
  const router = useRouter();
  const { studySession } = useCurator();

  useEffect(() => {
    if (!studySession || studySession.mode !== "simulado") {
      router.replace("/revisao");
    }
  }, [studySession, router]);

  if (!studySession || studySession.mode !== "simulado") return null;

  return (
    <SimuladoScreen
      questions={studySession.questions}
      onBack={() => router.push("/revisao")}
    />
  );
}