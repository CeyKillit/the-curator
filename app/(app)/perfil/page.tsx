"use client";

import { useRouter } from "next/navigation";
import { useCurator } from "@/app/contexts/curator-context";
import { ProfileScreen } from "@/app/components/curator/screens-core";

export default function PerfilPage() {
  const router = useRouter();
  const { overview, docs } = useCurator();

  return (
    <ProfileScreen
      overview={overview}
      docs={docs}
      onOpenAnalytics={() => router.push("/analytics")}
      onOpenSettings={() => router.push("/config")}
    />
  );
}
