import type { StudyQuestion } from "./types";

export const shuffleQuestions = <T,>(items: T[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

export const mapApiQuestionToStudyQuestion = (question: {
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
}): StudyQuestion => ({
  id: question.id,
  questionNumber: question.questionNumber,
  prompt: question.statement,
  explanation:
    question.explanation ??
    "Revise o enunciado e volte ao trecho do documento relacionado para consolidar a resposta.",
  recommendation: question.topic || "Revisar os conceitos centrais deste material.",
  subject: question.subject,
  sourceTitle: question.sourceTitle,
  sourceDocId: question.sourceDocId,
  options: question.options.map((option) => ({
    id: option.id,
    label: option.label,
    correct: question.correctAnswer ? option.id === question.correctAnswer : undefined,
  })),
});
