"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Flame,
  Play,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./chrome";
import { dashboardContent } from "./dashboard-data";
import { useCurator } from "@/app/contexts/curator-context";
import type { DashboardOverview, PlanTask } from "./types";

export const DashboardHomeScreen = ({
  onStartSession,
  onOpenPlan,
  onOpenLibrary,
  overview,
  tasks,
}: {
  onStartSession: () => void;
  onOpenPlan: () => void;
  onOpenLibrary: () => void;
  overview: DashboardOverview | null;
  tasks: PlanTask[];
}) => {
  const { user, dailyMission } = useCurator();
  const currentHour = new Date().getHours();
  const greetingPeriod =
    currentHour < 12 ? "Bom dia" : currentHour < 18 ? "Boa tarde" : "Boa noite";
  const userName = user?.name ?? dashboardContent.greetingName;

  // Missão diária real
  const missionAnswered = dailyMission?.answeredQuestions ?? 0;
  const missionTarget = dailyMission?.targetQuestions ?? 10;
  const missionCompleted = dailyMission?.completed ?? false;
  const missionPercent = Math.min(100, Math.round((missionAnswered / missionTarget) * 100));
  const missionXpReward = dailyMission?.xpReward ?? 50;
  const missionCoinsReward = dailyMission?.coinsReward ?? 20;

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
  const todayMinutes = totalStudyMinutes > 0 ? totalStudyMinutes : 12;
  const sessionsCount = Math.max(overview?.documentsAnalyzed ?? 0, 2);
  const dailyGoalMinutes = 20;
  const missionProgress = averageProgress > 0 ? averageProgress : 65;
  const missionRemaining = Math.max(100 - missionProgress, 0);
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const missionTaskTotal = tasks.length || 5;
  const missionTaskProgress = Math.min(completedTasks || 2, missionTaskTotal);

  const nextTrailTitle = overview?.nextTrailTitle || dashboardContent.nextTopic;
  const humanTrailTitle = nextTrailTitle.replace(/^Trilha:\s*/i, "");
  const estimatedMissionMinutes = Math.max(5, Math.min(15, Math.round((missionRemaining || 10) / 8)));
  const topSubjects = (overview?.subjects ?? []).slice(0, 2);
  const reviewCount = Math.max(overview?.flashcardsGenerated ?? 0, 12);
  const planItems = [
    topSubjects[0] ? `${topSubjects[0].subject} (${estimatedMissionMinutes} min)` : "Matematica (10 min)",
    topSubjects[1] ? `${topSubjects[1].subject} (5 min)` : "Portugues (5 min)",
  ];
  const progressSubjects = topSubjects.length
    ? topSubjects
    : [
        { subject: "Portugues", progressPercent: 60 },
        { subject: "Matematica", progressPercent: 30 },
      ];
  const recentActivity = [
    completedTasks > 0
      ? `${completedTasks} tarefa(s) concluida(s) hoje`
      : "Nenhuma tarefa concluida hoje ainda",
    overview?.questionsExtracted
      ? `${overview.questionsExtracted} questoes prontas para estudo`
      : "Questoes reais vao aparecer aqui apos o processamento",
  ];

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-6xl space-y-10 px-4 pb-4 pt-20 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700">
                  <Flame size={14} className="fill-orange-500 text-orange-500" />
                  {user?.streak ?? 0} {(user?.streak ?? 0) === 1 ? "dia" : "dias"} de sequência
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-sm font-bold text-primary">
                  {user?.xp ?? 0} XP total
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
                  🪙 {user?.coins ?? 0} moedas
                </div>
              </div>
              <div>
                <h1 className="font-headline text-4xl font-extrabold leading-none tracking-tight">
                  {greetingPeriod}, <span className="text-primary">{userName}</span>.
                </h1>
                <p className="mt-2 max-w-md text-base text-gray-500">Pronto para evoluir hoje?</p>
              </div>
            </div>

            <div className="group relative mt-6 overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white via-[#f7fbff] to-[#eef6ff] p-6 shadow-xl shadow-primary/10">
              <div className="absolute right-0 top-0 p-4 opacity-[0.06] transition-opacity group-hover:opacity-10">
                <BrainCircuit size={88} />
              </div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-700">
                    Missão do dia
                  </span>
                  {missionCompleted && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                      <CheckCircle2 size={10} className="fill-emerald-500" /> Concluída!
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                    Continue sua trilha
                  </p>
                  <h2 className="font-headline text-2xl font-extrabold text-on-surface sm:text-3xl">
                    {humanTrailTitle}
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                    Questões hoje: {missionAnswered}/{missionTarget}
                    {missionCompleted ? " ✓" : ""}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5">
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-500">
                      <span>Missão</span>
                      <span className="font-black text-primary">{missionPercent}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${missionPercent}%` }}
                        className={cn(
                          "h-full rounded-full",
                          missionCompleted
                            ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                            : "bg-gradient-to-r from-primary to-primary-container"
                        )}
                      />
                    </div>
                    {!missionCompleted && (
                      <p className="mt-2 text-[10px] text-gray-400">
                        Recompensa: +{missionXpReward} XP e 🪙 {missionCoinsReward}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5">
                    <p className="text-sm font-semibold text-gray-500">Tempo estimado</p>
                    <p className="font-headline mt-2 text-3xl font-black text-on-surface">
                      {estimatedMissionMinutes} min
                    </p>
                  </div>
                </div>
                <button
                  onClick={onStartSession}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-xl sm:w-fit"
                >
                  Continuar Agora
                  <Play size={16} className="fill-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-4 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
              <Timer size={24} className="text-emerald-500" />
              <div className="font-headline text-2xl font-black">{todayMinutes} min</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hoje</div>
            </div>
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm">
              <BookOpen size={24} className="text-primary" />
              <div className="font-headline text-2xl font-black">{sessionsCount}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sessoes</div>
            </div>
            <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm sm:col-span-2 md:col-span-2">
              <Sparkles size={24} className="text-amber-500" />
              <div className="font-headline text-2xl font-black">{dailyGoalMinutes} min</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Meta</div>
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
              <p className="mt-3 text-sm text-emerald-800/80">
                Faltam {Math.max(100 - averageProgress, 0)}% para completar sua trilha atual.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-headline text-2xl font-extrabold tracking-tight">
                Sua Trilha de Estudo
              </h3>
              <p className="text-sm text-gray-500">Progresso real e proximo passo destacado.</p>
            </div>
            <button onClick={onOpenPlan} className="flex items-center gap-1 text-sm font-bold text-primary">
              Ver mapa completo
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                    Continuar de onde parou
                  </p>
                  <h4 className="font-headline mt-2 text-2xl font-extrabold text-on-surface">
                    {humanTrailTitle}
                  </h4>
                  <p className="mt-2 text-sm text-gray-500">
                    Ultimos nos concluidos e proximo passo em destaque para manter ritmo real.
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/5 px-4 py-3 text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
                    Proximo no
                  </p>
                  <p className="font-headline mt-1 text-lg font-black text-primary">Revisao final</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {[
                  { label: "Introducao", state: "done" },
                  { label: "Conceitos", state: "done" },
                  { label: "Exercicios", state: "active" },
                  { label: "Resumo", state: "locked" },
                ].map((node, index) => (
                  <div key={node.label} className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black",
                        node.state === "done" && "bg-emerald-500 text-white",
                        node.state === "active" &&
                          "bg-gradient-to-br from-primary to-primary-container text-white shadow-lg shadow-primary/20",
                        node.state === "locked" && "bg-gray-100 text-gray-400"
                      )}
                    >
                      {node.state === "done" ? <CheckCircle2 size={18} className="fill-white" /> : index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-on-surface">{node.label}</p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                        {node.state === "done"
                          ? "Concluido"
                          : node.state === "active"
                            ? "Agora"
                            : "Depois"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <Sparkles size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold">Revisao pendente</h4>
                    <p className="text-xs text-gray-500">Itens prontos para reforco rapido</p>
                  </div>
                </div>
                <p className="font-headline text-3xl font-black text-on-surface">{reviewCount}</p>
                <p className="mt-2 text-sm text-gray-500">Voce ja comecou. Bora continuar?</p>
                <button
                  onClick={onOpenLibrary}
                  className="mt-4 w-full rounded-xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/15"
                >
                  Revisar agora
                </button>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <Trophy size={20} className="text-amber-600" />
                    </div>
                    <h4 className="font-headline font-bold">Conquistas</h4>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                    {user?.xp ?? 0} XP
                  </span>
                </div>
                {/* Mostra streak como conquista visual */}
                <div className="space-y-2">
                  {[
                    { icon: "🔥", label: `${user?.streak ?? 0} dias seguidos`, done: (user?.streak ?? 0) > 0 },
                    { icon: "🪙", label: `${user?.coins ?? 0} moedas acumuladas`, done: (user?.coins ?? 0) > 0 },
                    { icon: "⭐", label: `${user?.xp ?? 0} XP no total`, done: (user?.xp ?? 0) > 0 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                        item.done ? "bg-amber-50 text-amber-800" : "bg-gray-50 text-gray-400"
                      )}
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                    <span>Próxima conquista</span>
                    <span>{Math.min(100, Math.round(((user?.xp ?? 0) / 100) * 100))}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.round(((user?.xp ?? 0) / 100) * 100))}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    Meta: 100 XP — Primeiros 100 XP 🏅
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Plano de hoje
                  </p>
                  <h4 className="font-headline mt-2 text-2xl font-extrabold">Sessao objetiva</h4>
                </div>
                <div className="rounded-xl bg-primary/5 px-3 py-2 text-sm font-bold text-primary">
                  {dailyGoalMinutes} min
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {planItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3"
                  >
                    <span className="font-medium text-on-surface">{item}</span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                      Hoje
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onOpenPlan}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-5 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:scale-[1.01]"
              >
                Iniciar Plano
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Seu progresso
              </p>
              <div className="mt-5 space-y-5">
                {progressSubjects.map((subject) => (
                  <div key={subject.subject}>
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span>{subject.subject}</span>
                      <span className="text-gray-400">{subject.progressPercent}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
                        style={{ width: `${subject.progressPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Atividade recente
              </p>
              <div className="mt-5 space-y-3">
                {recentActivity.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
