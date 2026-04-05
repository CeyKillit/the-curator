"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Flame,
  Landmark,
  Lock,
  Microscope,
  Play,
  Plus,
  School,
  Settings,
  Sparkles,
  Terminal,
  Timer,
  Trash2,
  Trophy,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./chrome";
import { dashboardContent } from "./dashboard-data";
import { useCurator } from "@/app/contexts/curator-context";
import type { DashboardOverview, Doc, PlanIconKey, PlanTask, TrailOverview } from "./types";

export const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const goals = [
    {
      id: "public",
      title: "Concursos Públicos",
      desc: "Foco em direito, administração e políticas fiscais.",
      icon: Landmark,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "vest",
      title: "Vestibulares",
      desc: "Preparação completa para o ingresso nas melhores universidades.",
      icon: School,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "tech",
      title: "Tecnologia",
      desc: "Engenharia de Software, Ciência de Dados e sistemas de IA.",
      icon: Terminal,
      color: "bg-indigo-50 text-indigo-600",
      selected: true,
    },
    {
      id: "fin",
      title: "Finanças",
      desc: "Análise de mercado, bancos de investimento e finanças quantitativas.",
      icon: Wallet,
      color: "bg-amber-50 text-amber-600",
      wide: true,
    },
    {
      id: "sci",
      title: "Ciências",
      desc: "Pesquisa acadêmica e domínio da metodologia científica.",
      icon: Microscope,
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="font-headline text-xl font-black tracking-tighter text-primary">
          The Curator
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Passo 1 de 3
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mb-12 w-full max-w-md">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "33%" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        <div className="mb-10 space-y-4 text-center sm:mb-12">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl md:text-5xl">
            Defina sua trajetória.
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-on-surface-variant sm:text-lg">
            Selecione seu principal objetivo de aprendizado para personalizarmos seu currículo e
            assistente de IA.
          </p>
        </div>

        <div className="mb-14 grid w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <button
              key={goal.id}
              className={cn(
                "group relative flex flex-col items-start rounded-2xl border-2 bg-white p-6 text-left shadow-sm transition-all duration-300",
                goal.selected
                  ? "border-primary shadow-md"
                  : "border-transparent hover:border-primary/30 hover:shadow-md",
                goal.wide && "md:col-span-2 xl:col-span-2"
              )}
            >
              <div
                className={cn(
                  "mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                  goal.color
                )}
              >
                <goal.icon size={24} />
              </div>
              <h3 className="font-headline mb-2 text-xl font-bold">{goal.title}</h3>
              <p className="text-sm leading-snug text-gray-500">{goal.desc}</p>
              {goal.selected && (
                <div className="absolute right-4 top-4">
                  <CheckCircle2 size={20} className="fill-primary text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-3 rounded-3xl border border-black/5 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-xl sm:rounded-full sm:px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-tertiary">
              <Sparkles size={14} className="fill-white text-white" />
            </div>
            <p className="text-sm font-medium text-on-surface">
              &quot;Vou customizar seu plano de estudos com base neste objetivo.&quot;
            </p>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="font-headline flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-8 py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-95 hover:shadow-xl sm:w-auto sm:px-12"
        >
          Iniciar Jornada
          <ArrowRight size={20} />
        </button>
      </main>
    </div>
  );
};

const taskIcons = [
  { key: "book" as const, label: "Leitura", icon: BookOpen, color: "bg-primary/10 text-primary" },
  { key: "chart" as const, label: "Exercícios", icon: Clock3, color: "bg-secondary-container/30 text-secondary" },
  { key: "sparkles" as const, label: "Revisão IA", icon: Sparkles, color: "bg-tertiary-container/10 text-tertiary" },
  { key: "brain" as const, label: "Neuro", icon: BrainCircuit, color: "bg-emerald-100 text-emerald-700" },
] satisfies {
  key: PlanIconKey;
  label: string;
  icon: typeof BookOpen;
  color: string;
}[];

// --- Duolingo-style Trail Map ---

const TRAIL_X_FRACTIONS = [0.5, 0.73, 0.5, 0.27];
const NODE_SPACING = 90;
const NODE_RADIUS = 32;
const TRAIL_MAP_WIDTH = 280;

type TrailMapNode = {
  id: string | number;
  title: string;
  state: "completed" | "current" | "locked";
  icon: React.ComponentType<{ size?: number }>;
};

function DuolingoTrailMap({
  nodes,
  onOpenNode,
}: {
  nodes: TrailMapNode[];
  onOpenNode: (nodeId: string | number) => void;
}) {
  const W = TRAIL_MAP_WIDTH;
  const PAD = 44;
  const containerH = Math.max(nodes.length * NODE_SPACING + PAD * 2, 180);

  const positions = nodes.map((_, i) => ({
    x: TRAIL_X_FRACTIONS[i % TRAIL_X_FRACTIONS.length] * W,
    y: PAD + i * NODE_SPACING,
  }));

  const buildPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 1) return "";
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midY = ((prev.y + curr.y) / 2).toFixed(1);
      d += ` C ${prev.x.toFixed(1)} ${midY} ${curr.x.toFixed(1)} ${midY} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }
    return d;
  };

  const fullPath = buildPath(positions);
  const progressEndIdx = nodes.reduce(
    (acc, n, i) => (n.state === "completed" || n.state === "current" ? i : acc),
    -1
  );
  const progressPath = progressEndIdx >= 0 ? buildPath(positions.slice(0, progressEndIdx + 1)) : "";

  return (
    <div className="relative" style={{ width: W, height: containerH }}>
      <svg className="pointer-events-none absolute inset-0" width={W} height={containerH}>
        <path d={fullPath} fill="none" stroke="#e5e7eb" strokeWidth={8} strokeLinecap="round" />
        {progressPath && (
          <path d={progressPath} fill="none" stroke="#10b981" strokeWidth={8} strokeLinecap="round" />
        )}
      </svg>

      {positions.map((pos, i) => {
        const node = nodes[i];
        const isCompleted = node.state === "completed";
        const isCurrent = node.state === "current";
        const isLocked = node.state === "locked";
        const Icon = node.icon;

        return (
          <div
            key={node.id}
            className="absolute"
            style={{ left: pos.x - NODE_RADIUS, top: pos.y - NODE_RADIUS, width: NODE_RADIUS * 2, height: NODE_RADIUS * 2 }}
          >
            {isCurrent && (
              <motion.div
                className="absolute inset-[-8px] rounded-full bg-primary/20"
                animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <button
              onClick={() => !isLocked && onOpenNode(node.id)}
              disabled={isLocked}
              className={cn(
                "relative z-10 flex h-full w-full items-center justify-center rounded-full shadow-md ring-4 transition-transform duration-200",
                isCompleted && "bg-emerald-500 ring-emerald-200 text-white hover:scale-110 active:scale-95",
                isCurrent && "bg-gradient-to-br from-primary to-primary-container ring-primary/25 text-white shadow-xl shadow-primary/25 hover:scale-110 active:scale-95",
                isLocked && "cursor-not-allowed bg-gray-200 ring-gray-100 text-gray-400"
              )}
            >
              {isCompleted ? (
                <CheckCircle2 size={22} className="fill-white" />
              ) : isLocked ? (
                <Lock size={18} />
              ) : (
                <Icon size={22} />
              )}
            </button>
            <p
              className={cn(
                "absolute left-1/2 top-full mt-2 w-20 -translate-x-1/2 text-center text-[9px] font-bold uppercase leading-tight tracking-wide",
                isCompleted ? "text-emerald-600" : isCurrent ? "text-primary" : "text-gray-400"
              )}
            >
              {node.title.length > 14 ? node.title.slice(0, 13) + "…" : node.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export const PlanScreen = ({
  tasks,
  trails,
  onOpenTrailNode,
  onToggleTask,
  onRecalculatePlan,
  onCreateTask,
  onDeleteTask,
}: {
  tasks: PlanTask[];
  trails: TrailOverview[];
  onOpenTrailNode: (trailId: string, nodeId: string) => void;
  onToggleTask: (id: number) => void;
  onRecalculatePlan: () => void;
  onCreateTask: (draft: { title: string; duration: string; iconKey: PlanIconKey }) => void;
  onDeleteTask: (id: number) => void;
}) => {
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;
  const pendingCount = tasks.length - completedCount;
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30min");
  const [iconKey, setIconKey] = useState<PlanIconKey>("book");
  const fallbackTrailTasks: PlanTask[] = [
    {
      id: 1000,
      title: "Introducao ao modulo",
      duration: "20min",
      iconKey: "book",
      icon: BookOpen,
      color: "bg-primary/10 text-primary",
      status: "completed",
    },
    {
      id: 1001,
      title: "Quiz diagnostico",
      duration: "15min",
      iconKey: "chart",
      icon: Clock3,
      color: "bg-secondary-container/30 text-secondary",
      status: "pending",
    },
    {
      id: 1002,
      title: "Revisao ativa",
      duration: "20min",
      iconKey: "sparkles",
      icon: Sparkles,
      color: "bg-tertiary-container/10 text-tertiary",
      status: "pending",
    },
  ];
  const activeTrail = trails[0] ?? null;
  const baseTrailTasks = tasks.length > 0 ? tasks : fallbackTrailTasks;
  const fallbackNodes = baseTrailTasks.map((task, index) => {
    const state =
      task.status === "completed"
        ? "completed"
        : index === completedCount
          ? "current"
          : index < completedCount
            ? "completed"
            : "locked";

    const type =
      task.iconKey === "book"
        ? "Aula"
        : task.iconKey === "chart"
          ? "Quiz"
          : task.iconKey === "sparkles"
            ? "Revisao"
            : "Boss";

    return { ...task, state, type };
  });
  const currentTrailNodeIndex = activeTrail
    ? Math.max(
        0,
        activeTrail.nodes.findIndex(
          (node) => node.status === "available" || node.status === "in_progress" || node.status === "pending"
        )
      )
    : -1;
  const trailNodes = activeTrail
    ? activeTrail.nodes.map((node, index) => {
        const iconKey: PlanIconKey =
          node.type === "exercise"
            ? "chart"
            : node.type === "review"
              ? "sparkles"
              : node.type === "flashcards"
                ? "brain"
                : "book";
        const iconConfig = taskIcons.find((item) => item.key === iconKey) ?? taskIcons[0];
        const state =
          node.status === "completed"
            ? "completed"
            : index === currentTrailNodeIndex
              ? "current"
              : index < currentTrailNodeIndex
                ? "completed"
                : "locked";
        const type =
          node.type === "exercise"
            ? "Quiz"
            : node.type === "review"
              ? "Revisao"
              : node.type === "flashcards"
                ? "Boss"
                : "Aula";

        return {
          id: node.id,
          title: node.title,
          duration: node.type === "exercise" ? "12min" : node.type === "review" ? "10min" : "8min",
          iconKey,
          icon: iconConfig.icon,
          color: iconConfig.color,
          status: state === "completed" ? "completed" : "pending",
          state,
          type,
        };
      })
    : fallbackNodes;
  const currentNode =
    trailNodes.find((node) => node.state === "current") ??
    trailNodes.find((node) => node.state === "completed") ??
    trailNodes[0];
  const completedTrailCount = trailNodes.filter((node) => node.state === "completed").length;
  const displayProgress = activeTrail ? activeTrail.progress : progress;
  const pendingTrailCount = Math.max(trailNodes.length - completedTrailCount, 0);
  const trailTitle = activeTrail?.title ?? "Português - nível intermediário";
  const trailSubject = activeTrail?.subject ?? "Sua trilha principal";

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreateTask({ title: title.trim(), duration, iconKey });
    setTitle("");
    setDuration("30min");
    setIconKey("book");
  };

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-3xl space-y-8 px-4 pb-4 pt-20 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
                Suas trilhas de hoje
              </h1>
              <p className="font-medium text-on-surface-variant">
                Organize o que voce vai estudar agora e mantenha sua sequencia em movimento.
              </p>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
              <Flame size={16} className="fill-emerald-600 text-emerald-600" />
              <span className="text-sm font-bold tracking-tight text-emerald-700">12 dias</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Progresso da trilha
                </span>
                <span className="text-sm font-black text-primary">{Math.round(displayProgress)}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
                />
              </div>
              <p className="text-xs leading-relaxed text-gray-500">
                {trailNodes.length === 0
                  ? "Monte sua primeira sequência de tarefas para organizar o dia."
                  : displayProgress === 100
                    ? "Parabéns! Você concluiu todas as tarefas de hoje."
                    : `Faltam ${pendingTrailCount} etapas para fechar sua meta de hoje.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
              <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Tarefas
                </p>
                <p className="font-headline mt-2 text-3xl font-black text-on-surface">{trailNodes.length}</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Concluídas
                </p>
                <p className="font-headline mt-2 text-3xl font-black text-emerald-700">
                  {completedTrailCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                Mapa da trilha
              </p>
              <h2 className="font-headline mt-2 text-2xl font-extrabold text-on-surface">
                {trailTitle}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                {activeTrail
                  ? `Materia principal: ${trailSubject}. Navegue pelos nos reais e continue exatamente do ponto atual.`
                  : "Navegue pelos nós conectados e continue exatamente no ponto atual."}
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTrail && currentNode) {
                  onOpenTrailNode(activeTrail.id, String(currentNode.id));
                }
              }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:scale-[1.01]"
            >
              Continuar etapa atual
              <Play size={16} className="fill-white" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl bg-surface-container-low p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Próximo nó
              </p>
              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/20">
                  {currentNode?.state === "completed" ? (
                    <CheckCircle2 size={24} className="fill-white" />
                  ) : currentNode ? (
                    <currentNode.icon size={24} />
                  ) : (
                    <Play size={24} className="fill-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline text-xl font-extrabold text-on-surface">
                    {currentNode?.title ?? "Sua próxima etapa"}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {currentNode?.type ?? "Aula"} • {currentNode?.duration ?? "20min"}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {currentNode?.state === "current"
                      ? "Esse é o ponto atual da sua jornada. Toque para abrir a sessão."
                      : "Conclua os nós anteriores para continuar avançando."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center overflow-hidden py-4">
              <DuolingoTrailMap
                nodes={trailNodes as TrailMapNode[]}
                onOpenNode={(nodeId) => {
                  if (activeTrail) {
                    onOpenTrailNode(activeTrail.id, String(nodeId));
                    return;
                  }
                  if (typeof nodeId === "number") {
                    onToggleTask(nodeId);
                  }
                }}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Adicionar etapa</h2>
              <p className="text-sm text-gray-500">Monte sua trilha do dia em blocos curtos.</p>
            </div>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-container"
            >
              <Plus size={16} />
              Criar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_0.7fr]">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Revisar classes gramaticais"
              className="w-full rounded-xl border border-black/10 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="rounded-xl border border-black/10 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            >
              <option value="20min">20min</option>
              <option value="30min">30min</option>
              <option value="45min">45min</option>
              <option value="1h">1h</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {taskIcons.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  onClick={() => setIconKey(item.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    iconKey === item.key
                      ? "border-primary bg-primary/5"
                      : "border-black/5 bg-surface-container-lowest hover:border-primary/20"
                  )}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", item.color)}>
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-semibold text-on-surface">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-headline px-1 text-xl font-bold tracking-tight text-on-surface">
              Trilhas em andamento
            </h2>
            <button
              onClick={onRecalculatePlan}
              className="flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-white px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/5"
            >
              <Sparkles size={16} />
              Recalcular
            </button>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
                <p className="font-headline text-lg font-bold text-on-surface">Plano vazio</p>
                <p className="mt-2 text-sm text-gray-500">
                  Adicione uma tarefa acima para começar a organizar seu estudo.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-4 rounded-2xl border border-transparent bg-white p-5 text-left transition-all hover:border-primary/10 hover:shadow-md"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="flex flex-1 items-center gap-4 text-left"
                  >
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", task.color)}>
                      <task.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-headline font-bold text-on-surface",
                          task.status === "completed" && "line-through opacity-50"
                        )}
                      >
                        {task.title}
                      </h3>
                      <p className="text-xs font-medium text-gray-400">Duração: {task.duration}</p>
                    </div>
                    {task.status === "completed" ? (
                      <CheckCircle2 size={24} className="fill-emerald-500 text-white" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-200 transition-colors group-hover:border-primary" />
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remover ${task.title}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};


export const DashboardScreen = ({
  onStartSession,
  onOpenPlan,
  onOpenLibrary,
}: {
  onStartSession: () => void;
  onOpenPlan: () => void;
  onOpenLibrary: () => void;
}) => (
  <div className="min-h-screen pb-28 md:pb-32">
    <Header />
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-4 pt-20 sm:px-6 lg:px-8">
      <section className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="space-y-4 md:col-span-8">
          <h1 className="font-headline text-4xl font-extrabold leading-none tracking-tight">
            Olá, <span className="text-primary">{dashboardContent.greetingName}</span>.
          </h1>
          <p className="max-w-md text-gray-500">{dashboardContent.weeklyFocus}</p>
          <div className="group relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
              <BrainCircuit size={80} />
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                Sugestão da IA
              </span>
              <h2 className="font-headline text-xl font-bold">{dashboardContent.nextTopic}</h2>
              <p className="mb-4 text-sm text-gray-500">{dashboardContent.nextTopicHint}</p>
              <button
                onClick={onStartSession}
                className="flex w-fit items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-2.5 font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                Retomar Sessão
                <Play size={14} className="fill-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-4 md:grid-cols-2">
          <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <Timer size={24} className="text-emerald-500" />
            <div className="font-headline text-2xl font-black">42m</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Média Diária
            </div>
          </div>
          <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
            <BookOpen size={24} className="text-primary" />
            <div className="font-headline text-2xl font-black">12</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Lições
            </div>
          </div>
          <div className="col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-headline text-sm font-bold text-emerald-700">
                Progresso Geral
              </span>
              <span className="text-xl font-black text-emerald-700">72%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white">
              <div className="h-full w-[72%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-headline text-2xl font-extrabold tracking-tight">
              Sua Trilha de Estudo
            </h3>
            <p className="text-sm text-gray-500">
              Domine cada nó para desbloquear o simulado de exame
            </p>
          </div>
          <button onClick={onOpenPlan} className="flex items-center gap-1 text-sm font-bold text-primary">
            Ver mapa completo
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Trophy size={20} className="text-primary" />
              </div>
              <h4 className="font-headline font-bold">Conquistas Recentes</h4>
            </div>
            <ul className="space-y-4">
              {dashboardContent.achievementItems.map((item, index) => (
                <li key={item} className="flex items-center gap-3">
                  <div className={cn("h-2 w-2 rounded-full", index === 0 ? "bg-emerald-500" : "bg-primary")} />
                  <span className="text-sm text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h4 className="font-headline text-xl font-extrabold">Planejador de Estudos</h4>
              <p className="max-w-xs text-sm text-gray-500">{dashboardContent.plannerNote}</p>
              <button onClick={onOpenPlan} className="mt-2 flex items-center gap-1 text-sm font-bold text-primary">
                Gerenciar Agenda <ArrowRight size={14} />
              </button>
            </div>
            <button
              onClick={onOpenLibrary}
              className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
            >
              Abrir Biblioteca
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
);

export const AnalyticsOverviewScreen = ({
  overview,
  docs,
}: {
  overview: DashboardOverview | null;
  docs: Doc[];
}) => {
  const subjects = overview?.subjects.length
    ? overview.subjects.map((subject) => ({
        name: subject.subject,
        score: subject.progressPercent,
        color: "bg-primary",
      }))
    : [{ name: "Sem dados ainda", score: 0, color: "bg-primary" }];
  const accuracyRate = overview?.subjects.length
    ? Math.round(
        overview.subjects.reduce((total, subject) => total + subject.accuracyRate, 0) /
          overview.subjects.length
      )
    : 0;
  const totalStudyHours = overview?.subjects.length
    ? (overview.subjects.reduce((total, subject) => total + subject.studyTime, 0) / 3600).toFixed(1)
    : "0.0";
  const totalSolved =
    overview?.subjects.reduce((total, subject) => total + subject.questionsSolved, 0) ?? 0;
  const approvalEstimate = Math.min(
    95,
    Math.round(
      accuracyRate * 0.45 +
        (overview?.documentsAnalyzed ?? 0) * 8 +
        (overview?.trailsCreated ?? 0) * 6 +
        (overview?.subjects.length ?? 0) * 4
    )
  );
  const weakestSubject = overview?.subjects.length
    ? [...overview.subjects].sort((a, b) => a.progressPercent - b.progressPercent)[0]?.subject
    : null;
  const strongestSubject = overview?.subjects.length
    ? [...overview.subjects].sort((a, b) => b.progressPercent - a.progressPercent)[0]?.subject
    : null;
  const reviewPending = docs.reduce(
    (total, doc) => total + (doc.questionsCount ?? 0) + (doc.flashcardsCount ?? 0),
    0
  );
  const analyzedDocs = docs.filter((doc) => doc.status === "analyzed").length;
  const pendingDocs = docs.filter((doc) => doc.status === "analyzing" || doc.status === "idle").length;
  const weeklySignals = [
    {
      label: "Documentos analisados",
      value: overview?.documentsAnalyzed ?? analyzedDocs,
      helper: "materiais ja convertidos em estudo",
    },
    {
      label: "Revisao pendente",
      value: reviewPending,
      helper: "questoes e flashcards prontos para retorno",
    },
    {
      label: "Processando agora",
      value: pendingDocs,
      helper: "PDFs ainda entrando no fluxo",
    },
  ];

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-4 pt-20 sm:px-6 lg:px-8 md:space-y-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Taxa de Acertos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl font-extrabold text-primary">
                {accuracyRate}%
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Tempo Total
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl font-extrabold text-on-surface">
                {totalStudyHours}h
              </span>
              <span className="text-xs text-gray-400">acumuladas</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Questões Resolvidas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-4xl font-extrabold text-on-surface">
                {totalSolved}
              </span>
              <CheckCircle2 size={24} className="fill-primary text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-8 lg:col-span-8">
            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-headline text-xl font-bold sm:text-2xl">
                Performance por Matéria
              </h2>
            </div>
            <div className="space-y-8">
              {subjects.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="font-headline flex justify-between text-sm font-bold">
                    <span className="text-on-surface">{subject.name}</span>
                    <span className="text-gray-400">{subject.score}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.score}%` }}
                      className={cn("h-full rounded-full", subject.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-6 text-white shadow-xl sm:p-8">
              <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                <h3 className="font-headline text-lg font-bold">Previsão de Aprovação</h3>
                <div className="font-headline text-4xl font-black">{approvalEstimate}%</div>
                <p className="text-sm leading-relaxed opacity-90">
                  {overview?.nextTrailTitle
                    ? `Próxima trilha sugerida: ${overview.nextTrailTitle}.`
                    : "Envie e processe um PDF para começar a montar previsões reais."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                <Sparkles size={20} className="fill-primary text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-headline text-sm font-bold text-on-surface">Sugestão da IA</h4>
                <p className="text-xs leading-relaxed text-gray-500">
                  {weakestSubject ? (
                    <>
                      O menor progresso atual está em{" "}
                      <span className="font-bold text-primary">{weakestSubject}</span>. Vale
                      priorizar revisão e exercícios desse tema.
                    </>
                  ) : (
                    "Ainda não há dados suficientes para recomendar uma revisão prioritária."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Mapa de ícone/emoji por chave de conquista
const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_answer: "⭐",
  "10_answers": "🎯",
  "50_answers": "🏆",
  streak_3: "🔥",
  streak_7: "🔥🔥",
  "100_xp": "💎",
};

export const ProfileScreen = ({
  overview,
  docs,
  onOpenAnalytics,
  onOpenSettings,
}: {
  overview: DashboardOverview | null;
  docs: Doc[];
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
}) => {
  const { user, achievements, dailyMission } = useCurator();

  const totalStudyHours = overview?.subjects.length
    ? (overview.subjects.reduce((total, s) => total + s.studyTime, 0) / 3600).toFixed(1)
    : "0.0";
  const totalSolved =
    overview?.subjects.reduce((total, s) => total + s.questionsSolved, 0) ?? 0;
  const analyzedDocs = docs.filter((d) => d.status === "analyzed").length;

  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const coins = user?.coins ?? 0;
  const userName = user?.name ?? "Estudante";
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const xpForNextLevel = level * 100;
  const xpProgress = Math.min(100, Math.round(((xp % 100) / 100) * 100));

  const missionAnswered = dailyMission?.answeredQuestions ?? 0;
  const missionTarget = dailyMission?.targetQuestions ?? 10;
  const missionPercent = Math.min(100, Math.round((missionAnswered / missionTarget) * 100));

  // Todas as conquistas possíveis, marcando as desbloqueadas
  const allAchievements = [
    { key: "first_answer", title: "Primeira Resposta", desc: "Respondeu a 1ª questão" },
    { key: "10_answers", title: "10 Questões", desc: "Respondeu 10 questões" },
    { key: "50_answers", title: "50 Questões", desc: "Respondeu 50 questões" },
    { key: "streak_3", title: "3 Dias Seguidos", desc: "Streak de 3 dias" },
    { key: "streak_7", title: "Uma Semana!", desc: "7 dias seguidos de estudo" },
    { key: "100_xp", title: "Primeiros 100 XP", desc: "Acumulou 100 XP" },
  ].map((a) => ({
    ...a,
    icon: ACHIEVEMENT_ICONS[a.key] ?? "🏅",
    unlocked: achievements.some((u) => u.key === a.key),
  }));

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-4 pt-24 sm:px-6 lg:px-8">

        {/* Cabeçalho do perfil */}
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 text-2xl font-black text-white shadow-lg shadow-primary/20">
                {userName.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-white shadow">
                  {level}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Perfil</p>
                <h1 className="font-headline mt-1 text-3xl font-extrabold text-on-surface">{userName}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Nível {level} • {streak} {streak === 1 ? "dia" : "dias"} de sequência
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-primary/5 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">XP</p>
                <p className="font-headline mt-1 text-2xl font-black text-primary">{xp}</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Streak</p>
                <p className="font-headline mt-1 text-2xl font-black text-orange-600">
                  🔥 {streak}
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Moedas</p>
                <p className="font-headline mt-1 text-2xl font-black text-amber-700">
                  🪙 {coins}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progresso para o próximo nível */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-gray-400 uppercase tracking-widest">Progresso para Nível {level + 1}</span>
              <span className="text-primary">{xp % 100}/{xpForNextLevel % 100 === 0 ? 100 : xpForNextLevel % 100} XP</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Horas estudadas</p>
            <p className="font-headline mt-2 text-3xl font-black text-on-surface">{totalStudyHours}h</p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Questões resolvidas</p>
            <p className="font-headline mt-2 text-3xl font-black text-on-surface">{totalSolved}</p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Docs analisados</p>
            <p className="font-headline mt-2 text-3xl font-black text-on-surface">{analyzedDocs}</p>
          </div>
        </section>

        {/* Missão do dia */}
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold">Missão do dia</h3>
            {dailyMission?.completed && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                ✓ Concluída!
              </span>
            )}
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">{missionAnswered} de {missionTarget} questões</span>
              <span className="font-bold text-primary">{missionPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${missionPercent}%` }}
                className={cn(
                  "h-full rounded-full",
                  dailyMission?.completed
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : "bg-gradient-to-r from-primary to-primary-container"
                )}
              />
            </div>
            {!dailyMission?.completed && (
              <p className="mt-2 text-xs text-gray-400">
                Recompensa ao completar: +{dailyMission?.xpReward ?? 50} XP e 🪙 {dailyMission?.coinsReward ?? 20}
              </p>
            )}
          </div>
        </section>

        {/* Conquistas */}
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold">Conquistas</h3>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
              {unlockedCount}/{allAchievements.length}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allAchievements.map((a) => (
              <div
                key={a.key}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-4 transition-all",
                  a.unlocked
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200"
                    : "bg-gray-50 opacity-50 grayscale"
                )}
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-bold text-on-surface">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
                {a.unlocked && (
                  <CheckCircle2 size={16} className="ml-auto shrink-0 fill-emerald-500 text-white" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Ações */}
        <section className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onOpenAnalytics}
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container"
          >
            Ver analytics
          </button>
          <button
            onClick={onOpenSettings}
            className="flex-1 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
          >
            Configurações
          </button>
        </section>
      </main>
    </div>
  );
};

export const SettingsScreen = ({
  onBack,
}: {
  onBack: () => void;
}) => (
  <div className="min-h-screen pb-28 md:pb-32">
    <Header />
    <main className="mx-auto max-w-4xl space-y-8 px-4 pb-4 pt-24 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <button onClick={onBack} className="text-sm font-bold text-primary hover:underline">
          Voltar para perfil
        </button>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Settings size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Configuracoes
            </p>
            <h1 className="font-headline mt-2 text-3xl font-extrabold text-on-surface">
              Preferencias do app
            </h1>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6">
        {[
          {
            title: "Tema",
            description: "Controle a aparencia geral da experiencia.",
            value: "Claro",
          },
          {
            title: "Notificacoes",
            description: "Ajuste lembretes de estudo e revisao.",
            value: "Ativadas",
          },
          {
            title: "Idioma",
            description: "Defina o idioma principal da interface.",
            value: "Portugues",
          },
          {
            title: "Conta",
            description: "Gerencie identidade e dados basicos do usuario.",
            value: "Conta local",
          },
          {
            title: "Plano",
            description: "Espaco reservado para status e upgrades futuros.",
            value: "Base",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </div>
            <div className="rounded-full bg-primary/5 px-4 py-2 text-sm font-bold text-primary">
              {item.value}
            </div>
          </div>
        ))}
      </section>
    </main>
  </div>
);

export const DashboardOverviewScreen = ({
  onStartSession,
  onOpenPlan,
  onOpenLibrary,
  overview,
}: {
  onStartSession: () => void;
  onOpenPlan: () => void;
  onOpenLibrary: () => void;
  overview: DashboardOverview | null;
}) => {
  const averageProgress = overview?.subjects.length
    ? Math.round(
        overview.subjects.reduce((total, subject) => total + subject.progressPercent, 0) /
          overview.subjects.length
      )
    : 0;
  const totalStudyMinutes = overview?.subjects.length
    ? Math.round(
        overview.subjects.reduce((total, subject) => total + subject.studyTime, 0) / 60
      )
    : 0;

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-4 pt-20 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-8">
            <h1 className="font-headline text-4xl font-extrabold leading-none tracking-tight">
              Olá, <span className="text-primary">{dashboardContent.greetingName}</span>.
            </h1>
            <p className="max-w-md text-gray-500">
              {overview
                ? `${overview.documentsAnalyzed} documento(s) analisado(s), ${overview.questionsExtracted} questões extraídas e ${overview.flashcardsGenerated} flashcards gerados até agora.`
                : dashboardContent.weeklyFocus}
            </p>
            <div className="group relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
              <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
                <BrainCircuit size={80} />
              </div>
              <div className="relative z-10 flex flex-col gap-2">
                <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Sugestão da IA
                </span>
                <h2 className="font-headline text-xl font-bold">
                  {overview?.nextTrailTitle || dashboardContent.nextTopic}
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                  {overview?.subjects.length
                    ? `Você já tem ${overview.subjects.length} matéria(s) com progresso rastreado.`
                    : dashboardContent.nextTopicHint}
                </p>
                <button
                  onClick={onStartSession}
                  className="flex w-fit items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-2.5 font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                >
                  Retomar Sessão
                  <Play size={14} className="fill-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-4 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
              <Timer size={24} className="text-emerald-500" />
              <div className="font-headline text-2xl font-black">{totalStudyMinutes}m</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Média Diária
              </div>
            </div>
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
              <BookOpen size={24} className="text-primary" />
              <div className="font-headline text-2xl font-black">{overview?.trailsCreated ?? 0}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Trilhas
              </div>
            </div>
            <div className="col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-headline text-sm font-bold text-emerald-700">
                  Progresso Geral
                </span>
                <span className="text-xl font-black text-emerald-700">{averageProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-headline text-2xl font-extrabold tracking-tight">
                Sua Trilha de Estudo
              </h3>
              <p className="text-sm text-gray-500">
                Domine cada nó para desbloquear o simulado de exame
              </p>
            </div>
            <button onClick={onOpenPlan} className="flex items-center gap-1 text-sm font-bold text-primary">
              Ver mapa completo
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Trophy size={20} className="text-primary" />
                </div>
                <h4 className="font-headline font-bold">Conquistas Recentes</h4>
              </div>
              <ul className="space-y-4">
                {dashboardContent.achievementItems.map((item, index) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full", index === 0 ? "bg-emerald-500" : "bg-primary")} />
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h4 className="font-headline text-xl font-extrabold">Planejador de Estudos</h4>
                <p className="max-w-xs text-sm text-gray-500">
                  {overview?.nextTrailTitle
                    ? `Próximo passo recomendado: ${overview.nextTrailTitle}.`
                    : dashboardContent.plannerNote}
                </p>
                <button onClick={onOpenPlan} className="mt-2 flex items-center gap-1 text-sm font-bold text-primary">
                  Gerenciar Agenda <ArrowRight size={14} />
                </button>
              </div>
              <button
                onClick={onOpenLibrary}
                className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
              >
                Abrir Biblioteca
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
