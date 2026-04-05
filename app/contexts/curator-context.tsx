"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  addManualQuestion,
  deleteDocument,
  fetchDocumentById,
  fetchDocuments,
  reprocessDocument,
  uploadDocuments,
  validatePdfFiles,
  type ApiDocument,
} from "@/lib/services/documents";
import { fetchReviewQuestions, fetchTrailOverview, recordQuestionAnswer } from "@/lib/services/study";
import { mapApiQuestionToStudyQuestion, shuffleQuestions } from "@/app/components/curator/study-helpers";
import type { Doc, DashboardOverview, Flashcard, Notification, StudyProgress, StudyQuestion, TrailOverview } from "@/app/components/curator/types";

// ---- tipos exportados ----

export interface UserStats {
  id: string;
  name: string;
  xp: number;
  streak: number;
  coins: number;
  lastStudyDate: string | null;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface DailyMission {
  id: string;
  date: string;
  targetQuestions: number;
  answeredQuestions: number;
  completed: boolean;
  xpReward: number;
  coinsReward: number;
}

export interface StudySessionState {
  questions: StudyQuestion[];
  flashcards: Flashcard[];
  progress: StudyProgress;
  mode: "doc" | "review" | "random" | "simulado" | "flashcard";
  title?: string;
}

const initialStudyProgress: StudyProgress = {
  currentQuestionIndex: 0,
  answers: {},
  completed: false,
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---- context ----

interface CuratorContextValue {
  // dados
  docs: Doc[];
  trails: TrailOverview[];
  overview: DashboardOverview | null;
  user: UserStats | null;
  dailyMission: DailyMission | null;
  achievements: Achievement[];
  reviewQuestionCount: number;
  // sessão de estudo (estado global para passar entre rotas)
  studySession: StudySessionState | null;
  setStudySession: (session: StudySessionState | null) => void;
  studyProgress: StudyProgress;
  setStudyProgress: React.Dispatch<React.SetStateAction<StudyProgress>>;
  // notificações
  notifications: Notification[];
  addNotification: (title: string, message: string, type?: Notification["type"]) => void;
  removeNotification: (id: string) => void;
  // ações de documentos
  handleUpload: (files: FileList | null) => Promise<void>;
  handleAnalyze: (id: string) => Promise<void>;
  handleRemoveDoc: (id: string) => Promise<void>;
  handleAddManualQuestion: (id: string, payload: Parameters<typeof addManualQuestion>[1]) => Promise<void>;
  // ações de estudo
  buildStudySessionFromDoc: (docId: string) => Promise<StudySessionState | null>;
  buildStudySessionFromNode: (trailId: string, nodeId: string) => Promise<StudySessionState | null>;
  buildFlashcardSession: (docId: string) => Promise<StudySessionState | null>;
  buildReviewSession: () => Promise<StudySessionState | null>;
  buildSimuladoSession: () => Promise<StudySessionState | null>;
  handleSelectOption: (questionId: string, optionId: string) => void;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => void;
  handleRestartStudy: () => void;
  handleReviewWrong: (questionIds: string[]) => void;
  // recarregar dados
  reloadUser: () => Promise<void>;
  reloadDocs: () => Promise<void>;
  reloadTrails: () => Promise<void>;
}

const CuratorContext = createContext<CuratorContextValue | null>(null);

export const useCurator = () => {
  const ctx = useContext(CuratorContext);
  if (!ctx) throw new Error("useCurator deve ser usado dentro de CuratorProvider");
  return ctx;
};

// ---- helpers de mapeamento ----

const formatRelativeTime = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(1, Math.round(diff / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} horas`;
  return `${Math.round(hours / 24)} dias`;
};

const formatDocSize = (bytes: number) => {
  if (bytes < 1_048_576) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
};

const mapApiDoc = (doc: ApiDocument): Doc => ({
  id: doc.id,
  userId: doc.userId,
  fileName: doc.fileName,
  fileUrl: doc.fileUrl,
  fileSize: doc.fileSize,
  uploadedAt: doc.uploadedAt,
  title: doc.extractedTitle || doc.fileName,
  time: formatRelativeTime(doc.uploadedAt),
  size: formatDocSize(doc.fileSize),
  status:
    doc.processingStatus === "processed" ? "analyzed"
    : doc.processingStatus === "processing" ? "analyzing"
    : doc.processingStatus === "failed" ? "failed"
    : "idle",
  processingStatus: doc.processingStatus,
  processingError: doc.processingError,
  isRead: doc.isRead,
  isAnalyzed: doc.isAnalyzed,
  subject: doc.extractedSubject,
  extractedTitle: doc.extractedTitle,
  extractedSubject: doc.extractedSubject,
  extractedTopics: doc.extractedTopics,
  generatedTrailId: doc.generatedTrailId,
  questionsCount: doc.questionsCount,
  flashcardsCount: doc.flashcardsCount,
  summary: doc.extractedSummary,
});

// ---- provider ----

export const CuratorProvider = ({ children }: { children: React.ReactNode }) => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [trails, setTrails] = useState<TrailOverview[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [user, setUser] = useState<UserStats | null>(null);
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reviewQuestionCount, setReviewQuestionCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [studySession, setStudySession] = useState<StudySessionState | null>(null);
  const [studyProgress, setStudyProgress] = useState<StudyProgress>(initialStudyProgress);
  const [isHydrated, setIsHydrated] = useState(false);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((title: string, message: string, type: Notification["type"] = "info") => {
    const id = generateId();
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  const reloadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user", { cache: "no-store" });
      const data = (await res.json()) as {
        user?: UserStats;
        dailyMission?: DailyMission | null;
        achievements?: Achievement[];
      };
      if (res.ok) {
        setUser(data.user ?? null);
        setDailyMission(data.dailyMission ?? null);
        setAchievements(data.achievements ?? []);
      }
    } catch {
      // mantém estado atual
    }
  }, []);

  const reloadDocs = useCallback(async () => {
    try {
      const documents = await fetchDocuments();
      setDocs(documents.map(mapApiDoc));
    } catch {
      addNotification("Biblioteca indisponível", "Não foi possível carregar os documentos.", "warning");
    }
  }, [addNotification]);

  const reloadTrails = useCallback(async () => {
    try {
      const data = await fetchTrailOverview();
      setTrails(data);
    } catch {
      setTrails([]);
    }
  }, []);

  const reloadOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/overview", { cache: "no-store" });
      const data = (await res.json()) as { overview?: DashboardOverview };
      setOverview(res.ok ? (data.overview ?? null) : null);
    } catch {
      setOverview(null);
    }
  }, []);

  const reloadReviewCount = useCallback(async () => {
    try {
      const questions = await fetchReviewQuestions();
      setReviewQuestionCount(questions.length);
    } catch {
      setReviewQuestionCount(0);
    }
  }, []);

  // hidratação inicial
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void reloadUser();
    void reloadDocs();
    void reloadOverview();
    void reloadTrails();
    void reloadReviewCount();
  }, [isHydrated, reloadUser, reloadDocs, reloadOverview, reloadTrails, reloadReviewCount]);

  // polling para docs em processamento
  const docsRef = useRef(docs);
  docsRef.current = docs;
  useEffect(() => {
    if (!isHydrated) return;
    if (!docs.some((d) => d.processingStatus === "processing")) return;
    const id = window.setInterval(async () => {
      try {
        const documents = await fetchDocuments();
        setDocs(documents.map(mapApiDoc));
      } catch { /* ignora */ }
    }, 4000);
    return () => window.clearInterval(id);
  }, [docs, isHydrated]);

  // --- ações de documentos ---

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const { validFiles, invalidFiles } = validatePdfFiles(files);
    if (invalidFiles.length > 0) {
      addNotification("Formato não suportado", `Apenas PDFs são aceitos. Ignorados: ${invalidFiles.map((f) => f.name).join(", ")}.`, "warning");
    }
    if (validFiles.length === 0) return;
    addNotification("Upload iniciado", "Enviando material para processamento...", "info");
    try {
      const { documents, rejectedFiles } = await uploadDocuments(validFiles);
      const created = documents.map(mapApiDoc);
      setDocs((prev) => [...created, ...prev]);
      if (rejectedFiles.length > 0) {
        addNotification("Arquivos ignorados", `Não processamos: ${rejectedFiles.join(", ")}.`, "warning");
      }
      addNotification("PDF enviado", `${created.length} arquivo(s) adicionado(s) à biblioteca.`, "success");
    } catch (error) {
      addNotification("Falha no upload", error instanceof Error ? error.message : "Não foi possível enviar.", "warning");
    }
  };

  const handleAnalyze = async (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    if (doc.status === "analyzed") { addNotification("Documento pronto", "Já foi analisado.", "info"); return; }
    if (doc.status === "analyzing") { addNotification("Em processamento", "Já está sendo preparado.", "info"); return; }
    try {
      const updated = await reprocessDocument(id);
      if (updated) setDocs((prev) => prev.map((d) => (d.id === id ? mapApiDoc(updated) : d)));
      addNotification("Análise iniciada", `Reprocessando ${doc.title}.`, "success");
    } catch (error) {
      addNotification("Falha", error instanceof Error ? error.message : "Não foi possível reprocessar.", "warning");
    }
  };

  const handleRemoveDoc = async (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (!doc) return;
    if (!window.confirm(`Excluir ${doc.title} e todos os dados derivados?`)) return;
    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      addNotification("Documento removido", `${doc.title} foi excluído.`, "success");
    } catch (error) {
      addNotification("Falha", error instanceof Error ? error.message : "Erro ao excluir.", "warning");
    }
  };

  const handleAddManualQuestion = async (id: string, payload: Parameters<typeof addManualQuestion>[1]) => {
    try {
      const updated = await addManualQuestion(id, payload);
      if (updated) setDocs((prev) => prev.map((d) => (d.id === id ? mapApiDoc(updated) : d)));
      addNotification("Questão adicionada", "Entrou no documento e já pode ser usada.", "success");
    } catch (error) {
      addNotification("Falha", error instanceof Error ? error.message : "Não foi possível salvar.", "warning");
      throw error;
    }
  };

  // --- helpers de sessão ---

  const buildQuestionPool = async (candidateDocs: Doc[]) => {
    const details = await Promise.all(candidateDocs.map((d) => fetchDocumentById(d.id)));
    return details
      .flatMap((detail, i) =>
        (detail?.questions ?? []).map((q) =>
          mapApiQuestionToStudyQuestion({ ...q, subject: candidateDocs[i]?.subject, sourceTitle: candidateDocs[i]?.title, sourceDocId: candidateDocs[i]?.id })
        )
      )
      .filter((q) => q.options.length >= 2);
  };

  const buildStudySessionFromDoc = async (docId: string): Promise<StudySessionState | null> => {
    const doc = docs.find((d) => d.id === docId);
    if (!doc?.questionsCount) {
      addNotification("Sem questões", "Não foram encontradas questões neste PDF.", "warning");
      return null;
    }
    try {
      const detail = await fetchDocumentById(docId);
      const mapped = (detail?.questions ?? [])
        .map((q) => mapApiQuestionToStudyQuestion({ ...q, subject: doc.subject, sourceTitle: doc.title, sourceDocId: doc.id }))
        .filter((q) => q.options.length >= 2);
      if (mapped.length === 0) {
        addNotification("Questões indisponíveis", "Ainda não foi possível estruturar questões para este PDF.", "warning");
        return null;
      }
      return { questions: shuffleQuestions(mapped), flashcards: [], progress: { ...initialStudyProgress }, mode: "doc", title: doc.title };
    } catch (error) {
      addNotification("Falha", error instanceof Error ? error.message : "Não foi possível carregar as questões.", "warning");
      return null;
    }
  };

  const buildReviewSession = async (): Promise<StudySessionState | null> => {
    try {
      const queued = (await fetchReviewQuestions()).map(mapApiQuestionToStudyQuestion);
      const candidateDocs = docs.filter((d) => d.status === "analyzed" && (d.questionsCount ?? 0) > 0);
      const fallback = queued.length > 0 ? queued : await buildQuestionPool(candidateDocs);
      if (fallback.length === 0) {
        addNotification("Revisão indisponível", "Ainda não há questões suficientes.", "warning");
        return null;
      }
      const title = queued.length > 0 ? "Revisão de questões erradas" : "Revisão geral aleatória";
      return { questions: shuffleQuestions(fallback), flashcards: [], progress: { ...initialStudyProgress }, mode: "review", title };
    } catch (error) {
      addNotification("Falha", error instanceof Error ? error.message : "Não foi possível montar a revisão.", "warning");
      return null;
    }
  };

  const buildSimuladoSession = async (): Promise<StudySessionState | null> => {
    const candidateDocs = docs.filter((d) => d.status === "analyzed" && (d.questionsCount ?? 0) > 0);
    if (candidateDocs.length === 0) {
      addNotification("Simulado indisponível", "Ainda não há questões suficientes.", "warning");
      return null;
    }
    try {
      const pool = await buildQuestionPool(candidateDocs);
      if (pool.length === 0) {
        addNotification("Simulado indisponível", "Questões ainda não estruturadas.", "warning");
        return null;
      }
      return { questions: shuffleQuestions(pool), flashcards: [], progress: { ...initialStudyProgress }, mode: "simulado", title: "Simulado" };
    } catch (error) {
      addNotification("Falha", error instanceof Error ? error.message : "Não foi possível montar o simulado.", "warning");
      return null;
    }
  };

  const buildStudySessionFromNode = async (trailId: string, nodeId: string): Promise<StudySessionState | null> => {
    const trail = trails.find((t) => t.id === trailId);
    const node = trail?.nodes.find((n) => n.id === nodeId);
    if (!trail || !node) {
      addNotification("Trilha indisponível", "Não foi possível localizar este nó.", "warning");
      return null;
    }

    // Nó de flashcard
    if (node.type === "review" && (node.relatedFlashcardIds?.length ?? 0) > 0) {
      return buildFlashcardSession(trail.pdfId);
    }

    // Nó de exercício: carrega apenas as questões vinculadas ao nó
    if (node.type === "exercise" || node.type === "topic" || node.type === "module") {
      const relatedIds = node.relatedQuestionIds ?? [];
      if (relatedIds.length === 0) return buildStudySessionFromDoc(trail.pdfId);
      try {
        const detail = await fetchDocumentById(trail.pdfId);
        const doc = docs.find((d) => d.id === trail.pdfId);
        const nodeQuestions = (detail?.questions ?? [])
          .filter((q) => relatedIds.includes(q.id))
          .map((q) => mapApiQuestionToStudyQuestion({ ...q, subject: doc?.subject, sourceTitle: doc?.title, sourceDocId: doc?.id }))
          .filter((q) => q.options.length >= 2);
        if (nodeQuestions.length === 0) return buildStudySessionFromDoc(trail.pdfId);
        return { questions: shuffleQuestions(nodeQuestions), flashcards: [], progress: { ...initialStudyProgress }, mode: "doc", title: node.title };
      } catch {
        return buildStudySessionFromDoc(trail.pdfId);
      }
    }

    // Nó de resumo/summary: abre o PDF
    return null;
  };

  const buildFlashcardSession = async (docId: string): Promise<StudySessionState | null> => {
    const doc = docs.find((d) => d.id === docId);
    if (!doc) {
      addNotification("Documento não encontrado", "Não foi possível localizar o documento.", "warning");
      return null;
    }
    try {
      const { fetchDocumentById } = await import("@/lib/services/documents");
      const detail = await fetchDocumentById(docId);
      const flashcards = (detail?.flashcards ?? []).map((f) => ({
        id: f.id,
        pdfId: f.pdfId,
        question: f.question,
        answer: f.answer,
        topic: f.topic,
        difficulty: f.difficulty,
      }));
      if (flashcards.length === 0) {
        addNotification("Sem flashcards", "Este documento ainda não tem flashcards gerados.", "warning");
        return null;
      }
      return { questions: [], flashcards, progress: { ...initialStudyProgress }, mode: "flashcard", title: doc.title };
    } catch (error) {
      addNotification("Falha", error instanceof Error ? error.message : "Não foi possível carregar flashcards.", "warning");
      return null;
    }
  };

  // --- controles da sessão de estudo ---

  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    setStudyProgress((prev) => {
      if (prev.completed) return prev;
      return { ...prev, answers: { ...prev.answers, [questionId]: optionId } };
    });
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    if (!studySession) return;
    const currentQ = studySession.questions[studyProgress.currentQuestionIndex];
    const selected = currentQ ? studyProgress.answers[currentQ.id] : undefined;
    if (currentQ && selected) {
      recordQuestionAnswer({ questionId: currentQ.id, selectedAnswer: selected })
        .then((result) => {
          void reloadUser();
          void reloadTrails();
          if (result?.isCorrect) {
            const xp = 15; // XP_PER_ANSWER + XP_BONUS_CORRECT
            const coins = 3; // COINS_PER_CORRECT
            addNotification(
              `+${xp} XP 🪙 +${coins}`,
              "Resposta correta! Continue assim.",
              "success"
            );
          }
        })
        .catch(() => void reloadUser());
    }
    setStudyProgress((prev) => ({ ...prev, completed: true }));
  }, [studySession, studyProgress, reloadUser, addNotification]);

  const handleNextQuestion = useCallback(() => {
    setStudyProgress((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      completed: false,
    }));
  }, []);

  const handleRestartStudy = useCallback(() => {
    setStudyProgress({ ...initialStudyProgress, activeMaterialTitle: studyProgress.activeMaterialTitle });
  }, [studyProgress.activeMaterialTitle]);

  const handleReviewWrong = useCallback((questionIds: string[]) => {
    if (!studySession) return;
    const wrong = studySession.questions.filter((q) => questionIds.includes(q.id));
    if (wrong.length === 0) {
      addNotification("Sem erros", "Nenhum erro acumulado nesta rodada.", "info");
      return;
    }
    setStudySession({ ...studySession, questions: shuffleQuestions(wrong), title: "Revisão imediata dos erros" });
    setStudyProgress({ ...initialStudyProgress });
  }, [studySession, addNotification]);

  const value: CuratorContextValue = {
    docs, trails, overview, user, dailyMission, achievements, reviewQuestionCount,
    studySession, setStudySession, studyProgress, setStudyProgress,
    notifications, addNotification, removeNotification,
    handleUpload, handleAnalyze, handleRemoveDoc, handleAddManualQuestion,
    buildStudySessionFromDoc, buildStudySessionFromNode, buildFlashcardSession, buildReviewSession, buildSimuladoSession,
    handleSelectOption, handleSubmitAnswer, handleNextQuestion, handleRestartStudy, handleReviewWrong,
    reloadUser, reloadDocs, reloadTrails,
  };

  return <CuratorContext.Provider value={value}>{children}</CuratorContext.Provider>;
};