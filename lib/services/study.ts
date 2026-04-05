"use client";

import type { TrailOverview } from "@/app/components/curator/types";

type ApiStudyQuestion = {
  id: string;
  questionNumber?: string;
  statement: string;
  explanation?: string;
  topic: string;
  subject?: string;
  sourceTitle?: string;
  sourceDocId?: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer?: string;
};

export const recordQuestionAnswer = async ({
  questionId,
  selectedAnswer,
}: {
  questionId: string;
  selectedAnswer: string;
}) => {
  const response = await fetch("/api/study/answer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questionId, selectedAnswer }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    result?: { isCorrect: boolean; correctAnswer?: string };
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Nao foi possivel registrar a resposta.");
  }

  return data.result ?? null;
};

export const fetchReviewQuestions = async () => {
  const response = await fetch("/api/study/review", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as {
    questions?: ApiStudyQuestion[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Nao foi possivel carregar a fila de revisao.");
  }

  return data.questions ?? [];
};

export const fetchTrailOverview = async () => {
  const response = await fetch("/api/trails", { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as {
    trails?: TrailOverview[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Nao foi possivel carregar as trilhas.");
  }

  return data.trails ?? [];
};

export type { ApiStudyQuestion };
