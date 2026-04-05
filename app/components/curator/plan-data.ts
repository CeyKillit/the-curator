import { BarChart3, BookOpen, BrainCircuit, Sparkles } from "lucide-react";
import type { PlanIconKey, PlanTask } from "./types";

export type StoredPlanTask = Omit<PlanTask, "icon">;

const planIcons: Record<PlanIconKey, PlanTask["icon"]> = {
  book: BookOpen,
  chart: BarChart3,
  sparkles: Sparkles,
  brain: BrainCircuit,
};

export const attachPlanIcons = (tasks: StoredPlanTask[]): PlanTask[] =>
  tasks.map((task) => ({
    ...task,
    icon: planIcons[task.iconKey],
  }));

export const stripPlanIcons = (tasks: PlanTask[]): StoredPlanTask[] =>
  tasks.map(({ icon, ...task }) => task);

export const initialPlanTasks: PlanTask[] = attachPlanIcons([
  {
    id: 1,
    title: "Língua Portuguesa: Crase (Teoria)",
    duration: "45min",
    iconKey: "book",
    color: "bg-primary/10 text-primary",
    status: "completed",
  },
  {
    id: 2,
    title: "Matemática: Porcentagem (Questões)",
    duration: "1h",
    iconKey: "chart",
    color: "bg-secondary-container/30 text-secondary",
    status: "pending",
  },
  {
    id: 3,
    title: "Revisão Espaçada (IA): Temas de Ontem",
    duration: "20min",
    iconKey: "sparkles",
    color: "bg-tertiary-container/10 text-tertiary",
    status: "pending",
  },
]);
