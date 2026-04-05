"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useCurator } from "@/app/contexts/curator-context";
import { PdfViewerScreen } from "@/app/components/curator/screens-content";

export default function PdfViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    docs,
    buildStudySessionFromDoc,
    setStudySession,
    setStudyProgress,
    handleAddManualQuestion,
    addNotification,
  } = useCurator();

  const doc = docs.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Documento não encontrado.</p>
      </div>
    );
  }

  const handleStartQuestions = async (docId: string) => {
    const session = await buildStudySessionFromDoc(docId);
    if (session) {
      setStudySession(session);
      setStudyProgress({ currentQuestionIndex: 0, answers: {}, completed: false });
      router.push("/sessao");
    }
  };

  const handleOpenSummary = (docId: string) => {
    const d = docs.find((x) => x.id === docId);
    addNotification(
      "Resumo",
      d?.summary ? d.summary.slice(0, 120) + "..." : "Este documento ainda não tem resumo.",
      "info"
    );
  };

  return (
    <PdfViewerScreen
      doc={doc}
      onBack={() => router.push("/biblioteca")}
      onStartQuestions={(docId) => void handleStartQuestions(docId)}
      onOpenSummary={handleOpenSummary}
      onAddManualQuestion={(docId, payload) => handleAddManualQuestion(docId, payload)}
    />
  );
}