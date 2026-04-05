"use client";

import { useRouter } from "next/navigation";
import { SettingsScreen } from "@/app/components/curator/screens-core";

export default function ConfigPage() {
  const router = useRouter();
  return <SettingsScreen onBack={() => router.push("/perfil")} />;
}