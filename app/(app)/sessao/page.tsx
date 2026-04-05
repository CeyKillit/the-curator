"use client";

import { useRouter } from "next/navigation";
import { useCurator } from "@/app/contexts/curator-context";
import { StudyScreen } from "@/app/components/curator/screens-content";
import { useEffect } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SessaoPage() {
  const router = useRouter();
  const {
    studySession,
    studyProgress,
    handleSelectOption,
    handleSubmitAnswer,
    handleNextQuestion,
    handleRestartStudy,
    handleReviewWrong,
  } = useCurator();

  // Se navegar para /sessao sem sessão, redireciona para biblioteca após 2s
  // (ou o usuário clica no botão)
  useEffect(() => {
    if (!studySession) {
      const timer = setTimeout(() => router.replace("/biblioteca"), 1500);
      return () => clearTimeout(timer);
    }
  }, [studySession, router]);

  if (!studySession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 pb-28 pt-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen size={32} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="font-headline text-xl font-bold text-on-surface">Nenhuma sessão ativa</h2>
          <p className="mt-2 text-sm text-gray-500">
            Escolha um documento na Biblioteca para começar a estudar.
          </p>
        </div>
        <Link
          href="/biblioteca"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
        >
          Ir para a Biblioteca
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <StudyScreen
      questions={studySession.questions}
      progress={studyProgress}
      onSelectOption={handleSelectOption}
      onSubmitAnswer={handleSubmitAnswer}
      onNextQuestion={handleNextQuestion}
      onRestartSession={handleRestartStudy}
      onReviewWrongQuestions={handleReviewWrong}
      onSaveForLater={() => {}}
      onAddToPlan={() => router.push("/trilhas")}
      onExit={() => router.push("/home")}
    />
  );
}
