"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurator } from "@/app/contexts/curator-context";
import { PlanScreen } from "@/app/components/curator/screens-core";
import { attachPlanIcons, initialPlanTasks } from "@/app/components/curator/plan-data";
import { loadStoredTasks, saveStoredTasks } from "@/app/components/curator/storage";
import type { PlanIconKey, PlanTask } from "@/app/components/curator/types";

const colorByIconKey: Record<PlanIconKey, string> = {
  book: "bg-primary/10 text-primary",
  chart: "bg-secondary-container/30 text-secondary",
  sparkles: "bg-tertiary-container/10 text-tertiary",
  brain: "bg-emerald-100 text-emerald-700",
};

export default function TrilhasPage() {
  const router = useRouter();
  const { trails, buildStudySessionFromNode, buildStudySessionFromDoc, buildReviewSession, setStudySession, setStudyProgress, addNotification } = useCurator();
  const [tasks, setTasks] = useState<PlanTask[]>([]);

  useEffect(() => {
    const stored = loadStoredTasks();
    setTasks(attachPlanIcons(stored ?? initialPlanTasks));
  }, []);

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t))
    );
  };

  const handleRecalculatePlan = () => {
    setTasks((prev) =>
      [...prev]
        .sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed"))
        .map((t, i) => ({ ...t, status: i === 0 ? "pending" : t.status }))
    );
    addNotification("Plano reorganizado", "Recalculamos suas prioridades para hoje.", "success");
  };

  const handleCreateTask = (draft: { title: string; duration: string; iconKey: PlanIconKey }) => {
    const created = attachPlanIcons([{
      id: Date.now(),
      title: draft.title,
      duration: draft.duration,
      iconKey: draft.iconKey,
      color: colorByIconKey[draft.iconKey],
      status: "pending",
    }])[0];
    setTasks((prev) => [created, ...prev]);
    addNotification("Tarefa criada", `${draft.title} entrou no seu plano.`, "success");
  };

  const handleDeleteTask = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addNotification("Tarefa removida", `${task?.title ?? "A tarefa"} foi removida.`, "info");
  };

  const handleOpenTrailNode = async (trailId: string, nodeId: string) => {
    const trail = trails.find((t) => t.id === trailId);
    const node = trail?.nodes.find((n) => n.id === nodeId);
    if (!trail || !node) {
      addNotification("Trilha indisponível", "Não foi possível localizar este nó.", "warning");
      return;
    }

    // Nó de resumo/summary → abre o PDF
    if (node.type === "summary") {
      router.push(`/pdf-viewer/${trail.pdfId}`);
      return;
    }

    // Tenta construir sessão específica para o nó
    const session = await buildStudySessionFromNode(trailId, nodeId);
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push(session.mode === "flashcard" ? "/flashcard" : "/sessao");
      return;
    }

    // Fallback: carrega todas as questões do doc ou revisão geral
    if (node.type === "review") {
      const fallback = await buildReviewSession();
      if (fallback) {
        setStudySession(fallback);
        setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
        router.push("/sessao");
      }
      return;
    }

    const fallback = await buildStudySessionFromDoc(trail.pdfId);
    if (fallback) {
      setStudySession(fallback);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/sessao");
    }
  };

  return (
    <PlanScreen
      tasks={tasks}
      trails={trails}
      onOpenTrailNode={(trailId, nodeId) => void handleOpenTrailNode(trailId, nodeId)}
      onToggleTask={handleToggleTask}
      onRecalculatePlan={handleRecalculatePlan}
      onCreateTask={handleCreateTask}
      onDeleteTask={handleDeleteTask}
    />
  );
}
