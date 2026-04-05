"use client";

import { useRouter } from "next/navigation";
import { useCurator } from "@/app/contexts/curator-context";
import { DashboardHomeScreen } from "@/app/components/curator/dashboard-home";
import { attachPlanIcons, initialPlanTasks } from "@/app/components/curator/plan-data";
import { loadStoredTasks } from "@/app/components/curator/storage";
import { useEffect, useState } from "react";
import type { PlanTask } from "@/app/components/curator/types";

export default function HomePage() {
  const router = useRouter();
  const { overview, buildReviewSession, setStudySession, setStudyProgress } = useCurator();
  const [tasks, setTasks] = useState<PlanTask[]>([]);

  useEffect(() => {
    const stored = loadStoredTasks();
    setTasks(attachPlanIcons(stored ?? initialPlanTasks));
  }, []);

  const handleStartSession = async () => {
    const session = await buildReviewSession();
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/sessao");
    }
  };

  return (
    <DashboardHomeScreen
      onStartSession={() => void handleStartSession()}
      onOpenPlan={() => router.push("/trilhas")}
      onOpenLibrary={() => router.push("/biblioteca")}
      overview={overview}
      tasks={tasks}
    />
  );
}
