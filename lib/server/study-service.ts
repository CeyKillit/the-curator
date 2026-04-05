import { supabase } from "@/lib/supabase/server";
import { getLocalUserId } from "./database";
import type {
  AchievementRecord,
  DailyMissionRecord,
  ExtractedQuestionRecord,
  QuestionAttemptRecord,
  QuestionReviewStateRecord,
} from "./types";

const XP_PER_ANSWER = 5;
const XP_BONUS_CORRECT = 10;
const COINS_PER_CORRECT = 3;
const DAILY_MISSION_TARGET = 10;

const createId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const toIso = (value = new Date()) => value.toISOString();

const addMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

// ---- trail progress ----

const computeTrailProgressPercent = (
  questionIds: string[],
  reviewStates: QuestionReviewStateRecord[]
) => {
  if (questionIds.length === 0) return 0;
  const masteredCount = questionIds.filter((id) => {
    const state = reviewStates.find((s) => s.questionId === id);
    return state?.status === "mastered";
  }).length;
  return Math.round((masteredCount / questionIds.length) * 100);
};

const syncTrailProgressForDocument = async (documentId: string, userId: string) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("generated_trail_id, extracted_question_ids, extracted_subject")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow?.generated_trail_id) return;

  const trailId: string = docRow.generated_trail_id;
  const questionIds: string[] = docRow.extracted_question_ids ?? [];

  const { data: reviewRows } = await supabase
    .from("question_review_states")
    .select("*")
    .eq("user_id", userId)
    .eq("pdf_id", documentId);

  const reviewStates = (reviewRows ?? []) as QuestionReviewStateRecord[];
  const progress = computeTrailProgressPercent(questionIds, reviewStates);
  const status =
    progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "not_started";

  await supabase
    .from("study_trails")
    .update({ progress, status })
    .eq("id", trailId);

  // Atualiza nós da trilha
  const { data: nodes } = await supabase
    .from("trail_nodes")
    .select("*")
    .eq("trail_id", trailId);

  for (const node of nodes ?? []) {
    let nodeStatus = node.status as string;
    const relatedIds: string[] = node.related_question_ids ?? [];

    if (node.type === "exercise") {
      const nodeProgress = computeTrailProgressPercent(relatedIds, reviewStates);
      nodeStatus = nodeProgress >= 100 ? "completed" : nodeProgress > 0 ? "in_progress" : "pending";
    } else if (node.type === "summary" && progress > 0) {
      nodeStatus = "completed";
    } else if (node.type === "review") {
      const hasReviewItems = reviewStates.some(
        (s) => s.status === "review" && relatedIds.includes(s.questionId)
      );
      if (hasReviewItems) nodeStatus = "in_progress";
      else if (progress >= 100) nodeStatus = "completed";
    }

    if (nodeStatus !== node.status) {
      await supabase.from("trail_nodes").update({ status: nodeStatus }).eq("id", node.id);
    }
  }

  // Atualiza analytics
  const { data: attempts } = await supabase
    .from("question_attempts")
    .select("is_correct")
    .eq("user_id", userId)
    .eq("pdf_id", documentId);

  const totalAttempts = attempts?.length ?? 0;
  const correctCount = attempts?.filter((a) => a.is_correct).length ?? 0;
  const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
  const subject: string = docRow.extracted_subject;

  await supabase.from("analytics_metrics").upsert({
    id: `${userId}_${subject}`,
    user_id: userId,
    subject,
    accuracy_rate: accuracyRate,
    questions_solved: totalAttempts,
    flashcards_reviewed: 0,
    study_time: totalAttempts * 45,
    progress_percent: progress,
    updated_at: toIso(),
  });
};

// ---- public API ----

export const recordStudyAnswer = async ({
  questionId,
  selectedAnswer,
}: {
  questionId: string;
  selectedAnswer: string;
}) => {
  const userId = getLocalUserId();

  // 1. Busca a questão
  const { data: questionRow } = await supabase
    .from("extracted_questions")
    .select("*")
    .eq("id", questionId)
    .single();

  if (!questionRow) throw new Error("Questão não encontrada.");

  const question = questionRow as ExtractedQuestionRecord & {
    pdf_id: string;
    correct_answer: string | null;
    topic: string;
  };

  const isCorrect = question.correct_answer
    ? question.correct_answer.toUpperCase() === selectedAnswer.toUpperCase()
    : false;

  const pdfId: string = question.pdf_id;
  const subject: string = question.topic;

  // 2. Registra tentativa
  const attempt: QuestionAttemptRecord = {
    id: createId("attempt"),
    userId,
    questionId,
    pdfId,
    subject,
    selectedAnswer: selectedAnswer.toUpperCase(),
    correctAnswer: question.correct_answer?.toUpperCase(),
    isCorrect,
    createdAt: toIso(),
  };

  await supabase.from("question_attempts").insert({
    id: attempt.id,
    user_id: attempt.userId,
    question_id: attempt.questionId,
    pdf_id: attempt.pdfId,
    subject: attempt.subject,
    selected_answer: attempt.selectedAnswer,
    correct_answer: attempt.correctAnswer ?? null,
    is_correct: attempt.isCorrect,
    created_at: attempt.createdAt,
  });

  // 3. Upsert review state
  const { data: existingState } = await supabase
    .from("question_review_states")
    .select("*")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existingState) {
    const newStreak = isCorrect ? (existingState.success_streak + 1) : 0;
    const newStatus =
      isCorrect
        ? newStreak >= 2
          ? "mastered"
          : "review"
        : "review";
    const nextReview =
      newStatus === "mastered" ? addMinutes(24 * 60) : isCorrect ? addMinutes(90) : toIso();

    await supabase.from("question_review_states").update({
      last_result: isCorrect ? "correct" : "wrong",
      last_reviewed_at: toIso(),
      updated_at: toIso(),
      error_count: isCorrect ? existingState.error_count : existingState.error_count + 1,
      success_streak: newStreak,
      status: newStatus,
      next_review_at: nextReview,
    }).eq("id", existingState.id);
  } else {
    await supabase.from("question_review_states").insert({
      id: createId("review"),
      user_id: userId,
      question_id: questionId,
      pdf_id: pdfId,
      subject,
      status: isCorrect ? "new" : "review",
      error_count: isCorrect ? 0 : 1,
      success_streak: isCorrect ? 1 : 0,
      last_result: isCorrect ? "correct" : "wrong",
      last_reviewed_at: toIso(),
      next_review_at: isCorrect ? addMinutes(180) : toIso(),
      updated_at: toIso(),
    });
  }

  // 4. Atualiza usuário (XP, coins, streak)
  const { data: userRow } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  const xpGained = XP_PER_ANSWER + (isCorrect ? XP_BONUS_CORRECT : 0);
  const coinsGained = isCorrect ? COINS_PER_CORRECT : 0;

  let newXp = (userRow?.xp ?? 0) + xpGained;
  let newCoins = (userRow?.coins ?? 0) + coinsGained;
  let newStreak = userRow?.streak ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  if (userRow?.last_study_date !== today) {
    newStreak = userRow?.last_study_date === yesterday ? newStreak + 1 : 1;
  }

  await supabase.from("users").update({
    xp: newXp,
    coins: newCoins,
    streak: newStreak,
    last_study_date: today,
  }).eq("id", userId);

  // 5. Missão diária
  const { data: mission } = await supabase
    .from("daily_missions")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (mission) {
    const newAnswered = mission.answered_questions + 1;
    const completed = !mission.completed && newAnswered >= mission.target_questions;
    if (completed) {
      newXp += mission.xp_reward;
      newCoins += mission.coins_reward;
      await supabase.from("users").update({ xp: newXp, coins: newCoins }).eq("id", userId);
    }
    await supabase.from("daily_missions").update({
      answered_questions: newAnswered,
      completed: mission.completed || completed,
    }).eq("id", mission.id);
  } else {
    await supabase.from("daily_missions").insert({
      id: createId("mission"),
      user_id: userId,
      date: today,
      target_questions: DAILY_MISSION_TARGET,
      answered_questions: 1,
      completed: false,
      xp_reward: 50,
      coins_reward: 20,
    });
  }

  // 6. Achievements
  const { data: allAttempts } = await supabase
    .from("question_attempts")
    .select("id")
    .eq("user_id", userId);

  const { data: existingAchs } = await supabase
    .from("achievements")
    .select("key")
    .eq("user_id", userId);

  const unlockedKeys = new Set((existingAchs ?? []).map((a) => a.key as string));
  const totalAttempts = allAttempts?.length ?? 0;

  const toUnlock: AchievementRecord[] = [];
  const check = (key: string, title: string, description: string, condition: boolean) => {
    if (condition && !unlockedKeys.has(key)) {
      toUnlock.push({
        id: createId("ach"),
        userId,
        key,
        title,
        description,
        unlockedAt: toIso(),
      });
    }
  };

  check("first_answer", "Primeira Resposta", "Respondeu sua primeira questão.", totalAttempts >= 1);
  check("10_answers", "10 Questões", "Respondeu 10 questões.", totalAttempts >= 10);
  check("50_answers", "50 Questões", "Respondeu 50 questões.", totalAttempts >= 50);
  check("streak_3", "3 Dias Seguidos", "Manteve streak de 3 dias.", newStreak >= 3);
  check("streak_7", "Uma Semana!", "7 dias seguidos de estudo.", newStreak >= 7);
  check("100_xp", "Primeiros 100 XP", "Acumulou 100 XP.", newXp >= 100);

  if (toUnlock.length > 0) {
    await supabase.from("achievements").insert(
      toUnlock.map((a) => ({
        id: a.id,
        user_id: a.userId,
        key: a.key,
        title: a.title,
        description: a.description,
        unlocked_at: a.unlockedAt,
      }))
    );
  }

  // 7. Sincroniza progresso da trilha
  void syncTrailProgressForDocument(pdfId, userId);

  return {
    isCorrect,
    correctAnswer: question.correct_answer?.toUpperCase(),
    xpGained,
    coinsGained,
    streak: newStreak,
    totalXp: newXp,
    totalCoins: newCoins,
  };
};

export const getReviewQueue = async () => {
  const userId = getLocalUserId();
  const now = new Date().toISOString();

  const { data: reviewRows } = await supabase
    .from("question_review_states")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "review")
    .lte("next_review_at", now);

  const results = [];

  for (const state of reviewRows ?? []) {
    const { data: questionRow } = await supabase
      .from("extracted_questions")
      .select("*")
      .eq("id", state.question_id)
      .single();

    if (!questionRow) continue;

    const { data: docRow } = await supabase
      .from("pdf_documents")
      .select("id, extracted_title, extracted_subject")
      .eq("id", questionRow.pdf_id)
      .is("deleted_at", null)
      .single();

    if (!docRow) continue;

    results.push({
      id: questionRow.id,
      questionNumber: questionRow.question_number,
      statement: questionRow.statement,
      explanation: questionRow.explanation ?? undefined,
      topic: questionRow.topic,
      subject: docRow.extracted_subject,
      sourceTitle: docRow.extracted_title,
      sourceDocId: docRow.id,
      options: questionRow.options as Array<{ id: string; label: string }>,
      correctAnswer: questionRow.correct_answer ?? undefined,
    });
  }

  return results;
};

export const getTrailOverview = async () => {
  const userId = getLocalUserId();

  const { data: trailRows } = await supabase
    .from("study_trails")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const trails = [];

  for (const trail of trailRows ?? []) {
    const { data: nodeRows } = await supabase
      .from("trail_nodes")
      .select("*")
      .eq("trail_id", trail.id)
      .order("order");

    trails.push({
      id: trail.id,
      userId: trail.user_id,
      pdfId: trail.pdf_id,
      title: trail.title,
      subject: trail.subject,
      progress: trail.progress,
      status: trail.status,
      createdAt: trail.created_at,
      nodes: (nodeRows ?? []).map((n) => ({
        id: n.id,
        trailId: n.trail_id,
        title: n.title,
        type: n.type,
        status: n.status,
        order: n.order,
        relatedQuestionIds: n.related_question_ids ?? [],
        relatedFlashcardIds: n.related_flashcard_ids ?? [],
      })),
    });
  }

  return trails;
};

// ---- user ----

export const getUser = async () => {
  const userId = getLocalUserId();
  const { data } = await supabase.from("users").select("*").eq("id", userId).single();
  if (!data) return null;
  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    xp: data.xp as number,
    streak: data.streak as number,
    coins: data.coins as number,
    lastStudyDate: data.last_study_date as string | null,
    createdAt: data.created_at as string,
    achievements: [] as AchievementRecord[],
    dailyMissions: [] as DailyMissionRecord[],
  };
};

export const getFullUser = async () => {
  const userId = getLocalUserId();
  const { data: userRow } = await supabase.from("users").select("*").eq("id", userId).single();
  if (!userRow) return null;

  const { data: achRows } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId);

  const { data: missionRows } = await supabase
    .from("daily_missions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(7);

  return {
    id: userRow.id as string,
    name: userRow.name as string,
    email: userRow.email as string,
    xp: userRow.xp as number,
    streak: userRow.streak as number,
    coins: userRow.coins as number,
    lastStudyDate: userRow.last_study_date as string | null,
    createdAt: userRow.created_at as string,
    achievements: (achRows ?? []).map((a) => ({
      id: a.id as string,
      userId: a.user_id as string,
      key: a.key as string,
      title: a.title as string,
      description: a.description as string,
      unlockedAt: a.unlocked_at as string,
    })) as AchievementRecord[],
    dailyMissions: (missionRows ?? []).map((m) => ({
      id: m.id as string,
      userId: m.user_id as string,
      date: m.date as string,
      targetQuestions: m.target_questions as number,
      answeredQuestions: m.answered_questions as number,
      completed: m.completed as boolean,
      xpReward: m.xp_reward as number,
      coinsReward: m.coins_reward as number,
    })) as DailyMissionRecord[],
  };
};

// ---- simulado ----

export const saveSimuladoAttempt = async (data: {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  durationSeconds: number;
  subject: string | null;
}) => {
  const userId = getLocalUserId();
  const id = createId("sim");

  await supabase.from("simulado_attempts").insert({
    id,
    user_id: userId,
    total_questions: data.totalQuestions,
    correct_answers: data.correctAnswers,
    wrong_answers: data.wrongAnswers,
    accuracy: data.accuracy,
    duration_seconds: data.durationSeconds,
    subject: data.subject,
    finished_at: new Date().toISOString(),
  });

  return id;
};

export const getSimuladoHistory = async () => {
  const userId = getLocalUserId();
  const { data } = await supabase
    .from("simulado_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("finished_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id as string,
    userId: r.user_id as string,
    totalQuestions: r.total_questions as number,
    correctAnswers: r.correct_answers as number,
    wrongAnswers: r.wrong_answers as number,
    accuracy: r.accuracy as number,
    durationSeconds: r.duration_seconds as number,
    subject: r.subject as string | null,
    finishedAt: r.finished_at as string,
  }));
};
