"use client";

import { useRouter } from "next/navigation";
import { useCurator } from "@/app/contexts/curator-context";
import { LibraryScreen } from "@/app/components/curator/screens-content";

export default function BibliotecaPage() {
  const router = useRouter();
  const {
    docs,
    handleUpload,
    handleAnalyze,
    handleRemoveDoc,
    buildStudySessionFromDoc,
    buildFlashcardSession,
    setStudySession,
    setStudyProgress,
    addNotification,
  } = useCurator();

  const handleStartQuestions = async (id: string) => {
    const session = await buildStudySessionFromDoc(id);
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/sessao");
    }
  };

  const handleGenerateFlashcardsNav = async (id: string) => {
    const session = await buildFlashcardSession(id);
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/flashcard");
    }
  };

  const handleOpenDocument = (id: string) => {
    router.push(`/pdf-viewer/${id}`);
  };

  const handleOpenSummary = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    addNotification(
      "Resumo",
      doc?.summary ? doc.summary.slice(0, 120) + "..." : "Este documento ainda não tem resumo.",
      "info"
    );
  };

  return (
    <LibraryScreen
      docs={docs}
      onUpload={(files) => void handleUpload(files)}
      onAnalyze={(id) => void handleAnalyze(id)}
      onOpenDocument={handleOpenDocument}
      onStartQuestions={(id) => void handleStartQuestions(id)}
      onGenerateFlashcards={(id) => void handleGenerateFlashcardsNav(id)}
      onOpenSummary={handleOpenSummary}
      onRemoveDoc={(id) => void handleRemoveDoc(id)}
      onManageQuestions={(id) => router.push(`/biblioteca/${id}/questoes`)}
    />
  );
}
