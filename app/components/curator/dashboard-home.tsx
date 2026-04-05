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
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./chrome";
import { dashboardContent } from "./dashboard-data";
import { useCurator } from "@/app/contexts/curator-context";
import type { DashboardOverview, PlanTask } from "./types";

// Circular progress ring usando SVG
function CircularProgress({
  percent,
  size = 120,
  strokeWidth = 9,
  completed = false,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  completed?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = completed ? "#10b981" : "#6366f1";
  const trackColor = completed ? "#d1fae5" : "#e0e7ff";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

// Card de streak animado
function StreakCard({ streak }: { streak: number }) {
  const isActive = streak > 0;
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-5 shadow-sm transition-all",
      isActive
        ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-orange-500/25"
        : "border border-black/5 bg-white"
    )}>
      {isActive && (
        <>
          <div className="pointer-events-none absolute -right-4 -top-4 text-[80px] opacity-10 select-none">🔥</div>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{
                width: 8 + i * 6,
                height: 8 + i * 6,
                right: 16 + i * 14,
                bottom: 12,
              }}
              animate={{ y: [-4, 4, -4], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </>
      )}
      <div className="relative z-10 flex items-center gap-2">
        <motion.div
          animate={isActive ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame size={20} className={isActive ? "fill-white text-white" : "text-gray-300"} />
        </motion.div>
        <p className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-white/80" : "text-gray-400")}>
          Sequência
        </p>
      </div>
      <p className={cn("font-headline mt-2 text-4xl font-black", isActive ? "text-white" : "text-gray-300")}>
        {streak}
      </p>
      <p className={cn("mt-1 text-sm font-medium", isActive ? "text-white/70" : "text-gray-400")}>
        {streak === 1 ? "dia" : "dias"} seguidos
      </p>
    </div>
  );
}

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

  // Missão diária
  const missionAnswered = dailyMission?.answeredQuestions ?? 0;
  const missionTarget = dailyMission?.targetQuestions ?? 10;
  const missionCompleted = dailyMission?.completed ?? false;
  const missionPercent = Math.min(100, Math.round((missionAnswered / missionTarget) * 100));
  const missionXpReward = dailyMission?.xpReward ?? 50;
  const missionCoinsReward = dailyMission?.coinsReward ?? 20;

  // Dados do overview
  const averageProgress = overview?.subjects.length
    ? Math.round(
        overview.subjects.reduce((t, s) => t + s.progressPercent, 0) / overview.subjects.length
      )
    : 0;
  const totalStudyMinutes = overview?.subjects.length
    ? Math.round(overview.subjects.reduce((t, s) => t + s.studyTime, 0) / 60)
    : 0;
  const sessionsCount = Math.max(overview?.documentsAnalyzed ?? 0, 0);
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const reviewCount = Math.max(overview?.flashcardsGenerated ?? 0, 0);
  const nextTrailTitle = overview?.nextTrailTitle || dashboardContent.nextTopic;
  const humanTrailTitle = nextTrailTitle.replace(/^Trilha:\s*/i, "");
  const topSubjects = (overview?.subjects ?? []).slice(0, 3);
  const estimatedMissionMinutes = Math.max(5, Math.round(((missionTarget - missionAnswered) * 1.5)));
  const planItems = topSubjects.length
    ? topSubjects.map((s) => s.subject)
    : ["Matemática", "Português", "Redação"];

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-6xl space-y-10 px-4 pb-4 pt-20 sm:px-6 lg:px-8">

        {/* Saudação */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <p className="text-sm font-semibold text-gray-400">{greetingPeriod} 👋</p>
            <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tight">
              <span className="text-primary">{userName}</span>,<br />
              <span className="text-on-surface">pronto para evoluir?</span>
            </h1>
          </motion.div>
        </section>

        {/* Hero: Missão + Stats */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

          {/* Missão do dia — card principal */}
          <div className="group relative overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#eff4ff] p-6 shadow-xl shadow-primary/10 sm:p-8">
            <div className="pointer-events-none absolute right-0 top-0 p-6 opacity-[0.05] transition-opacity group-hover:opacity-10">
              <BrainCircuit size={100} />
            </div>

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Circular progress */}
              <div className="relative flex shrink-0 items-center justify-center">
                <CircularProgress percent={missionPercent} completed={missionCompleted} size={110} />
                <div className="absolute flex flex-col items-center">
                  <span className={cn(
                    "font-headline text-2xl font-black",
                    missionCompleted ? "text-emerald-600" : "text-primary"
                  )}>
                    {missionPercent}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    {missionCompleted ? "Feito!" : "Missão"}
                  </span>
                </div>
              </div>

              {/* Conteúdo da missão */}
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Missão do dia
                  </span>
                  {missionCompleted && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700"
                    >
                      <CheckCircle2 size={10} className="fill-emerald-500" /> Concluída!
                    </motion.span>
                  )}
                </div>

                <div>
                  <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                    {humanTrailTitle}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {missionAnswered} de {missionTarget} questões respondidas hoje
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {!missionCompleted && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-gray-500 ring-1 ring-black/5">
                      <Timer size={13} />
                      ~{estimatedMissionMinutes} min restantes
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-xs font-semibold text-primary ring-1 ring-primary/10">
                    <Zap size={13} className="fill-primary" />
                    +{missionXpReward} XP · 🪙 {missionCoinsReward}
                  </div>
                </div>

                <button
                  onClick={onStartSession}
                  className="flex w-fit items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-3.5 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                >
                  {missionCompleted ? "Continuar Estudando" : "Continuar Agora"}
                  <Play size={15} className="fill-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Coluna lateral: Streak + mini stats */}
          <div className="flex flex-row gap-4 lg:flex-col lg:w-52">
            <StreakCard streak={user?.streak ?? 0} />

            <div className="flex flex-1 flex-col gap-3 lg:flex-col">
              <div className="flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">XP Total</p>
                </div>
                <p className="font-headline text-2xl font-black text-on-surface">{user?.xp ?? 0}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((user?.xp ?? 0) % 100))}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🪙</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Moedas</p>
                </div>
                <p className="font-headline text-2xl font-black text-amber-600">{user?.coins ?? 0}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Progresso geral + Matérias */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Progresso circular geral */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Progresso geral</p>
            <div className="mt-4 flex items-center gap-6">
              <div className="relative flex shrink-0 items-center justify-center">
                <CircularProgress percent={averageProgress} size={90} strokeWidth={8} />
                <div className="absolute flex flex-col items-center">
                  <span className="font-headline text-lg font-black text-on-surface">{averageProgress}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {topSubjects.slice(0, 2).map((s) => (
                  <div key={s.subject}>
                    <div className="mb-1 flex justify-between text-xs font-bold">
                      <span className="truncate text-on-surface">{s.subject}</span>
                      <span className="text-gray-400">{s.progressPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.progressPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
                      />
                    </div>
                  </div>
                ))}
                {!topSubjects.length && (
                  <p className="text-sm text-gray-400">Processe um PDF para ver o progresso por matéria.</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: <Timer size={18} className="text-emerald-600" />,
                value: totalStudyMinutes > 0 ? `${totalStudyMinutes}m` : "—",
                label: "Tempo total",
                bg: "bg-emerald-50",
              },
              {
                icon: <BookOpen size={18} className="text-primary" />,
                value: sessionsCount > 0 ? String(sessionsCount) : "—",
                label: "PDFs analisados",
                bg: "bg-primary/5",
              },
              {
                icon: <Target size={18} className="text-rose-500" />,
                value: reviewCount > 0 ? String(reviewCount) : "—",
                label: "Flashcards gerados",
                bg: "bg-rose-50",
              },
              {
                icon: <CheckCircle2 size={18} className="text-violet-600" />,
                value: completedTasks > 0 ? String(completedTasks) : "—",
                label: "Tarefas concluídas",
                bg: "bg-violet-50",
              },
            ].map((stat) => (
              <div key={stat.label} className={cn("rounded-2xl p-4 shadow-sm", stat.bg)}>
                {stat.icon}
                <p className="font-headline mt-2 text-2xl font-black text-on-surface">{stat.value}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plano de hoje + Revisão + Conquistas */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Plano do dia */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Plano de hoje</p>
                <h4 className="font-headline mt-1 text-xl font-extrabold text-on-surface">Sessão objetiva</h4>
              </div>
              <span className="rounded-xl bg-primary/8 px-3 py-1.5 text-xs font-bold text-primary">20 min</span>
            </div>
            <ul className="mt-5 space-y-2">
              {planItems.map((item, i) => (
                <li key={item} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary">{i + 1}</span>
                  <span className="text-sm font-medium text-on-surface">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onOpenPlan}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:scale-[1.01]"
            >
              Ver mapa completo <ArrowRight size={15} />
            </button>
          </div>

          {/* Revisão pendente */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Sparkles size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Revisão</p>
                <p className="font-headline text-sm font-bold text-on-surface">Flashcards prontos</p>
              </div>
            </div>
            <p className="font-headline mt-5 text-5xl font-black text-on-surface">
              {reviewCount > 0 ? reviewCount : "—"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {reviewCount > 0 ? "Itens prontos para reforço rápido." : "Gere flashcards ao processar um PDF."}
            </p>
            <button
              onClick={onOpenLibrary}
              className="mt-5 w-full rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
            >
              Revisar agora
            </button>
          </div>

          {/* Conquistas */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Trophy size={20} className="text-amber-600" />
                </div>
                <p className="font-headline text-sm font-bold text-on-surface">Conquistas</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">
                {user?.xp ?? 0} XP
              </span>
            </div>
            <div className="mt-5 space-y-2">
              {[
                { icon: "🔥", label: `${user?.streak ?? 0} dias seguidos`, done: (user?.streak ?? 0) > 0 },
                { icon: "🪙", label: `${user?.coins ?? 0} moedas`, done: (user?.coins ?? 0) > 0 },
                { icon: "⭐", label: `${user?.xp ?? 0} XP`, done: (user?.xp ?? 0) > 0 },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    item.done ? "bg-amber-50 text-amber-800" : "bg-gray-50 text-gray-400"
                  )}
                >
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-gray-400">
                <span>Próxima conquista</span>
                <span>{Math.min(100, (user?.xp ?? 0) % 100)}/100 XP</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (user?.xp ?? 0) % 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
