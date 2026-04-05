"use client";

import { useRouter } from "next/navigation";
import { useCurator } from "@/app/contexts/curator-context";
import { ReviewScreen } from "@/app/components/curator/screens-content";

export default function RevisaoPage() {
  const router = useRouter();
  const {
    docs,
    reviewQuestionCount,
    buildStudySessionFromDoc,
    buildReviewSession,
    buildSimuladoSession,
    setStudySession,
    setStudyProgress,
  } = useCurator();

  const handleStartReview = async () => {
    const session = await buildReviewSession();
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/sessao");
    }
  };

  const handleStartQuestions = async (id: string) => {
    const session = await buildStudySessionFromDoc(id);
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/sessao");
    }
  };

  const handleOpenSimulado = async () => {
    const session = await buildSimuladoSession();
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/simulado");
    }
  };

  return (
    <ReviewScreen
      docs={docs}
      reviewQuestionCount={reviewQuestionCount}
      onStartReview={() => void handleStartReview()}
      onStartQuestions={(id) => void handleStartQuestions(id)}
      onOpenLibrary={() => router.push("/biblioteca")}
      onOpenMockExam={() => void handleOpenSimulado()}
    />
  );
}