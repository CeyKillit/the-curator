"use client";

import { useEffect, useState } from "react";
import {
  addManualQuestion,
  deleteDocument,
  fetchDocumentById,
  fetchDocuments,
  reprocessDocument,
  uploadDocuments,
  validatePdfFiles,
} from "@/lib/services/documents";
import {
  fetchReviewQuestions,
  fetchTrailOverview,
  recordQuestionAnswer,
} from "@/lib/services/study";
import { attachPlanIcons, initialPlanTasks } from "./plan-data";
import { initialStudyProgress, studyQuestions } from "./study-data";
import {
  loadStoredAppState,
  loadStoredTasks,
  saveStoredAppState,
  saveStoredTasks,
} from "./storage";
import { mapApiQuestionToStudyQuestion, shuffleQuestions } from "./study-helpers";
import type {
  DashboardOverview,
  Doc,
  Notification,
  PlanIconKey,
  PlanTask,
  Screen,
  StudyProgress,
  StudyQuestion,
  TrailOverview,
} from "./types";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const colorByIconKey: Record<PlanIconKey, string> = {
  book: "bg-primary/10 text-primary",
  chart: "bg-secondary-container/30 text-secondary",
  sparkles: "bg-tertiary-container/10 text-tertiary",
  brain: "bg-emerald-100 text-emerald-700",
};

const formatRelativeTime = (dateString: string) => {
  const timestamp = new Date(dateString).getTime();
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / (1000 * 60)));

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} horas`;

  const days = Math.round(hours / 24);
  return `${days} dias`;
};

const formatDocSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const mapApiDocumentToClient = (document: {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  processingStatus: "uploaded" | "processing" | "processed" | "failed";
  processingError?: string | null;
  isRead: boolean;
  isAnalyzed: boolean;
  extractedTitle: string;
  extractedSubject: string;
  extractedSummary: string;
  extractedTopics: string[];
  generatedTrailId?: string;
  questionsCount: number;
  flashcardsCount: number;
}): Doc => ({
  id: document.id,
  userId: document.userId,
  fileName: document.fileName,
  fileUrl: document.fileUrl,
  fileSize: document.fileSize,
  uploadedAt: document.uploadedAt,
  title: document.extractedTitle || document.fileName,
  time: formatRelativeTime(document.uploadedAt),
  size: formatDocSize(document.fileSize),
  status:
    document.processingStatus === "processed"
      ? "analyzed"
      : document.processingStatus === "processing"
        ? "analyzing"
        : document.processingStatus === "failed"
          ? "failed"
          : "idle",
  processingStatus: document.processingStatus,
  processingError: document.processingError,
  isRead: document.isRead,
  isAnalyzed: document.isAnalyzed,
  subject: document.extractedSubject,
  extractedTitle: document.extractedTitle,
  extractedSubject: document.extractedSubject,
  extractedTopics: document.extractedTopics,
  generatedTrailId: document.generatedTrailId,
  questionsCount: document.questionsCount,
  flashcardsCount: document.flashcardsCount,
  summary: document.extractedSummary,
});

export const useCuratorApp = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiContext, setAiContext] = useState<string | undefined>();
  const [tasks, setTasks] = useState<PlanTask[]>(initialPlanTasks);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [studyProgress, setStudyProgress] = useState<StudyProgress>(initialStudyProgress);
  const [activeStudyQuestions, setActiveStudyQuestions] = useState<StudyQuestion[]>(studyQuestions);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [simuladoQuestions, setSimuladoQuestions] = useState<StudyQuestion[]>([]);
  const [reviewQuestionCount, setReviewQuestionCount] = useState(0);
  const [trails, setTrails] = useState<TrailOverview[]>([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const addNotification = (
    title: string,
    message: string,
    type: Notification["type"] = "info"
  ) => {
    const id = generateId();
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const openAI = (context?: string) => {
    setAiContext(context);
    setIsAIModalOpen(true);
  };

  const resetStudySession = (materialTitle?: string) => {
    setStudyProgress({
      ...initialStudyProgress,
      activeMaterialTitle: materialTitle,
    });
  };

  useEffect(() => {
    const initialAppState = loadStoredAppState();
    const storedTasks = loadStoredTasks();

    setTasks(storedTasks ?? initialPlanTasks);
    setHasCompletedOnboarding(initialAppState.hasCompletedOnboarding);
    setScreen(initialAppState.hasCompletedOnboarding ? initialAppState.lastScreen : "onboarding");
    setStudyProgress(initialAppState.studyProgress ?? initialStudyProgress);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveStoredTasks(tasks);
  }, [isHydrated, tasks]);

  useEffect(() => {
    if (!isHydrated) return;
    saveStoredAppState({
      hasCompletedOnboarding,
      lastScreen: screen === "onboarding" ? "dashboard" : screen,
      studyProgress,
    });
  }, [hasCompletedOnboarding, isHydrated, screen, studyProgress]);

  useEffect(() => {
    if (!isHydrated) return;

    const loadDocuments = async () => {
      try {
        const documents = await fetchDocuments();
        setDocs(documents.map(mapApiDocumentToClient));
      } catch {
        const id = generateId();
        setNotifications((prev) => [
          ...prev,
          {
            id,
            title: "Biblioteca indisponivel",
            message: "Nao foi possivel carregar os documentos agora.",
            type: "warning",
          },
        ]);
        setTimeout(() => removeNotification(id), 5000);
      }
    };

    void loadDocuments();
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!docs.some((doc) => doc.processingStatus === "processing")) return;

    const intervalId = window.setInterval(async () => {
      try {
        const documents = await fetchDocuments();
        setDocs(documents.map(mapApiDocumentToClient));
      } catch {
        // Keep current client state and try again on the next tick.
      }
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [docs, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const loadOverview = async () => {
      try {
        const response = await fetch("/api/overview", { cache: "no-store" });
        const data = (await response.json()) as { overview?: DashboardOverview };

        if (!response.ok) {
          throw new Error("Falha ao carregar overview.");
        }

        setOverview(data.overview ?? null);
      } catch {
        setOverview(null);
      }
    };

    void loadOverview();
  }, [docs.length, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const loadTrails = async () => {
      try {
        const trailOverview = await fetchTrailOverview();
        setTrails(trailOverview);
      } catch {
        setTrails([]);
      }
    };

    void loadTrails();
  }, [docs.length, isHydrated, reviewQuestionCount, screen, studyProgress.currentQuestionIndex]);

  useEffect(() => {
    if (!isHydrated) return;

    const loadReviewCount = async () => {
      try {
        const questions = await fetchReviewQuestions();
        setReviewQuestionCount(questions.length);
      } catch {
        setReviewQuestionCount(0);
      }
    };

    void loadReviewCount();
  }, [docs.length, isHydrated, screen, studyProgress.currentQuestionIndex, studyProgress.completed]);

  const buildQuestionPool = async () => {
    const candidateDocs = docs.filter(
      (doc) => doc.status === "analyzed" && (doc.questionsCount ?? 0) > 0
    );

    if (candidateDocs.length === 0) {
      return [];
    }

    const details = await Promise.all(candidateDocs.map((doc) => fetchDocumentById(doc.id)));

    return details
      .flatMap((detail, index) =>
        (detail?.questions ?? []).map((question) =>
          mapApiQuestionToStudyQuestion({
            ...question,
            subject: candidateDocs[index]?.subject,
            sourceTitle: candidateDocs[index]?.title,
            sourceDocId: candidateDocs[index]?.id,
          })
        )
      )
      .filter((question) => question.options.length >= 2);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const { validFiles, invalidFiles } = validatePdfFiles(files);

    if (invalidFiles.length > 0) {
      addNotification(
        "Formato nao suportado",
        `Apenas PDFs sao aceitos agora. Ignoramos: ${invalidFiles.map((file) => file.name).join(", ")}.`,
        "warning"
      );
    }

    if (validFiles.length === 0) return;

    addNotification("Upload iniciado", "Enviando material para processamento...", "info");

    try {
      const { documents, rejectedFiles } = await uploadDocuments(validFiles);
      const createdDocs = documents.map(mapApiDocumentToClient);
      setDocs((prev) => [...createdDocs, ...prev]);

      if (rejectedFiles.length > 0) {
        addNotification(
          "Arquivos ignorados",
          `Nao processamos: ${rejectedFiles.join(", ")}.`,
          "warning"
        );
      }

      addNotification(
        "PDF enviado com sucesso",
        `${createdDocs.length} arquivo(s) processado(s) e adicionados a biblioteca.`,
        "success"
      );
    } catch (error) {
      addNotification(
        "Falha no upload",
        error instanceof Error ? error.message : "Nao foi possivel enviar os arquivos.",
        "warning"
      );
    }
  };

  const handleAnalyze = async (id: string) => {
    const doc = docs.find((item) => item.id === id);

    if (!doc) return;

    if (doc.status === "analyzed") {
      addNotification("Documento pronto", "Este material ja foi analisado.", "info");
      return;
    }

    if (doc.status === "analyzing") {
      addNotification(
        "Documento em processamento",
        "O arquivo ja esta sendo preparado no backend.",
        "info"
      );
      return;
    }

    try {
      const updatedDocument = await reprocessDocument(id);

      if (updatedDocument) {
        setDocs((prev) =>
          prev.map((item) => (item.id === id ? mapApiDocumentToClient(updatedDocument) : item))
        );
      }

      addNotification(
        "Analise iniciada",
        `Reprocessando ${doc.title}. O card sera atualizado automaticamente.`,
        "success"
      );
    } catch (error) {
      addNotification(
        "Falha ao iniciar analise",
        error instanceof Error ? error.message : "Nao foi possivel reprocessar o documento.",
        "warning"
      );
    }
  };

  const handleRemoveDoc = async (id: string) => {
    const doc = docs.find((item) => item.id === id);

    if (!doc) return;

    const confirmed = window.confirm(`Deseja excluir ${doc.title} e todos os dados derivados?`);

    if (!confirmed) return;

    try {
      await deleteDocument(id);
      setDocs((prev) => prev.filter((item) => item.id !== id));
      addNotification("Documento removido", `${doc.title} foi excluido com sucesso.`, "success");
    } catch (error) {
      addNotification(
        "Falha na exclusao",
        error instanceof Error ? error.message : "Erro ao excluir documento.",
        "warning"
      );
    }
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "completed" ? "pending" : "completed" }
          : task
      )
    );
  };

  const handleCreateTask = (draft: {
    title: string;
    duration: string;
    iconKey: PlanIconKey;
  }) => {
    const createdTask = attachPlanIcons([
      {
        id: Date.now(),
        title: draft.title,
        duration: draft.duration,
        iconKey: draft.iconKey,
        color: colorByIconKey[draft.iconKey],
        status: "pending",
      },
    ])[0];

    setTasks((prev) => [createdTask, ...prev]);
    addNotification("Tarefa criada", `${draft.title} entrou no seu plano.`, "success");
  };

  const handleDeleteTask = (id: number) => {
    const task = tasks.find((item) => item.id === id);
    setTasks((prev) => prev.filter((item) => item.id !== id));
    addNotification("Tarefa removida", `${task?.title ?? "A tarefa"} foi removida do plano.`, "info");
  };

  const handleRecalculatePlan = () => {
    setTasks((prev) =>
      [...prev]
        .sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed"))
        .map((task, index) => ({
          ...task,
          status: index === 0 ? "pending" : task.status,
        }))
    );
    addNotification("Plano reorganizado", "Recalculamos suas prioridades para hoje.", "success");
  };

  const handleStartQuestions = async (id: string) => {
    const doc = docs.find((item) => item.id === id);

    if (!doc?.questionsCount) {
      addNotification(
        "Sem questoes extraidas",
        "Nao foram encontradas questoes neste PDF. Use resumo e flashcards para revisao.",
        "warning"
      );
      return;
    }

    try {
      const documentDetails = await fetchDocumentById(id);
      const mappedQuestions =
        documentDetails?.questions
          ?.map((question) =>
            mapApiQuestionToStudyQuestion({
              ...question,
              subject: doc.subject,
              sourceTitle: doc.title,
              sourceDocId: doc.id,
            })
          )
          .filter((question) => question.options.length >= 2) ?? [];

      if (mappedQuestions.length === 0) {
        addNotification(
          "Questoes indisponiveis",
          "Ainda nao conseguimos estruturar questoes validas para este PDF.",
          "warning"
        );
        return;
      }

      setActiveStudyQuestions(shuffleQuestions(mappedQuestions));
      setStudyProgress({
        ...initialStudyProgress,
        activeMaterialTitle: doc.title,
      });
      setScreen("study");
      addNotification(
        "Sessao iniciada",
        `Abrimos ${mappedQuestions.length} questoes reais com base em ${doc.title}.`,
        "success"
      );
    } catch (error) {
      addNotification(
        "Falha ao abrir questoes",
        error instanceof Error ? error.message : "Nao foi possivel carregar as questoes deste PDF.",
        "warning"
      );
    }
  };

  const handleStartReview = async () => {
    try {
      const queuedQuestions = (await fetchReviewQuestions()).map(mapApiQuestionToStudyQuestion);
      const fallbackPool = queuedQuestions.length > 0 ? queuedQuestions : await buildQuestionPool();

      if (fallbackPool.length === 0) {
        addNotification(
          "Revisao indisponivel",
          "Ainda nao ha questoes reais suficientes para montar sua revisao.",
          "warning"
        );
        return;
      }

      const randomizedQuestions = shuffleQuestions(fallbackPool);

      setActiveStudyQuestions(randomizedQuestions);
      setStudyProgress({
        ...initialStudyProgress,
        activeMaterialTitle:
          queuedQuestions.length > 0 ? "Revisao de questoes erradas" : "Revisao geral aleatoria",
      });
      setScreen("study");

      addNotification(
        "Revisao iniciada",
        queuedQuestions.length > 0
          ? `${randomizedQuestions.length} questoes erradas voltaram para sua revisao.`
          : `${randomizedQuestions.length} questoes aleatorias foram carregadas para revisar.`,
        "success"
      );
    } catch (error) {
      addNotification(
        "Falha ao abrir revisao",
        error instanceof Error ? error.message : "Nao foi possivel montar a revisao agora.",
        "warning"
      );
    }
  };

  const handleGenerateFlashcards = (id: string) => {
    const doc = docs.find((item) => item.id === id);

    addNotification(
      "Flashcards disponiveis",
      doc?.flashcardsCount
        ? `${doc.flashcardsCount} flashcards foram gerados para ${doc.title}.`
        : "Este documento ainda nao gerou flashcards utilizaveis.",
      doc?.flashcardsCount ? "success" : "warning"
    );
  };

  const handleOpenSummary = (id: string) => {
    const doc = docs.find((item) => item.id === id);

    openAI(
      doc?.summary
        ? `Explique este resumo em linguagem simples e destaque 3 pontos de revisao: ${doc.summary}`
        : "Este documento ainda nao possui resumo extraido."
    );
  };

  const handleOpenDocument = (id: string) => {
    const doc = docs.find((item) => item.id === id);

    if (!doc) return;

    setSelectedDocId(id);
    setScreen("pdf-viewer");
  };

  const handleOpenTrailNode = async (trailId: string, nodeId: string) => {
    const trail = trails.find((item) => item.id === trailId);
    const node = trail?.nodes.find((item) => item.id === nodeId);

    if (!trail || !node) {
      addNotification("Trilha indisponivel", "Nao foi possivel localizar este no agora.", "warning");
      return;
    }

    if (node.type === "exercise") {
      await handleStartQuestions(trail.pdfId);
      return;
    }

    if (node.type === "review") {
      await handleStartReview();
      return;
    }

    if (node.type === "summary" || node.type === "module" || node.type === "topic") {
      handleOpenDocument(trail.pdfId);
      addNotification("Modulo aberto", `${node.title} foi aberto para leitura e apoio.`, "info");
      return;
    }

    if (node.type === "flashcards") {
      handleOpenDocument(trail.pdfId);
      addNotification("Flashcards do modulo", "Abra o resumo e os flashcards do modulo a partir do viewer.", "info");
      return;
    }

    handleOpenDocument(trail.pdfId);
  };

  const handleAddManualQuestion = async (
    id: string,
    payload: {
      questionNumber?: string;
      statement: string;
      options: Array<{ id: string; label: string }>;
      correctAnswer?: string;
      explanation?: string;
      topic?: string;
    }
  ) => {
    try {
      const updatedDocument = await addManualQuestion(id, payload);

      if (updatedDocument) {
        const mappedDocument = mapApiDocumentToClient(updatedDocument);
        setDocs((prev) => prev.map((item) => (item.id === id ? mappedDocument : item)));
      }

      addNotification(
        "Questao adicionada",
        "A questao manual entrou no documento e ja pode ser usada na sessao.",
        "success"
      );
    } catch (error) {
      addNotification(
        "Falha ao salvar questao",
        error instanceof Error ? error.message : "Nao foi possivel salvar a questao manual.",
        "warning"
      );
      throw error;
    }
  };

  const handleOpenSimulado = async () => {
    const candidateDocs = docs.filter(
      (doc) => doc.status === "analyzed" && (doc.questionsCount ?? 0) > 0
    );

    if (candidateDocs.length === 0) {
      addNotification(
        "Simulado indisponivel",
        "Ainda nao existem questoes reais suficientes para montar um simulado.",
        "warning"
      );
      return;
    }

    try {
      const validQuestions = await buildQuestionPool();

      if (validQuestions.length === 0) {
        addNotification(
          "Simulado indisponivel",
          "As questoes extraidas ainda nao estao estruturadas para simulado.",
          "warning"
        );
        return;
      }

      setSimuladoQuestions(shuffleQuestions(validQuestions));
      setScreen("simulado");
      addNotification(
        "Simulado pronto",
        `${validQuestions.length} questoes reais foram carregadas para treino.`,
        "success"
      );
    } catch (error) {
      addNotification(
        "Falha ao montar simulado",
        error instanceof Error ? error.message : "Nao foi possivel carregar o banco de questoes.",
        "warning"
      );
    }
  };

  const handleSaveForLater = () => {
    addNotification("Salvo para depois", "Guardamos esta recomendacao para a proxima revisao.", "info");
  };

  const handleAddToPlan = () => {
    const alreadyAdded = tasks.some((task) => task.title.includes("GABA"));

    if (!alreadyAdded) {
      const createdTask = attachPlanIcons([
        {
          id: Date.now(),
          title: "Neurobiologia: moduladores de sinapse GABAergica",
          duration: "30min",
          iconKey: "brain",
          color: colorByIconKey.brain,
          status: "pending",
        },
      ])[0];

      setTasks((prev) => [...prev, createdTask]);
    }

    setScreen("plan");
    addNotification("Adicionado ao plano", "Incluimos esta recomendacao na sua proxima revisao.", "success");
  };

  const handleSelectStudyOption = (questionId: string, optionId: string) => {
    setStudyProgress((prev) => {
      if (prev.completed) return prev;

      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: optionId,
        },
      };
    });
  };

  const handleSubmitStudyAnswer = () => {
    const currentQuestion = activeStudyQuestions[studyProgress.currentQuestionIndex];
    const selectedOption = currentQuestion
      ? studyProgress.answers[currentQuestion.id]
      : undefined;

    if (currentQuestion && selectedOption) {
      void recordQuestionAnswer({
        questionId: currentQuestion.id,
        selectedAnswer: selectedOption,
      });
    }

    setStudyProgress((prev) => ({
      ...prev,
      completed: true,
    }));
  };

  const handleNextStudyQuestion = () => {
    setStudyProgress((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      completed: false,
    }));
  };

  const handleRestartStudy = () => {
    resetStudySession(studyProgress.activeMaterialTitle);
    addNotification("Sessao reiniciada", "Voce pode responder tudo novamente desde o inicio.", "success");
  };

  const handleReviewWrongQuestions = (questionIds: string[]) => {
    const wrongQuestions = activeStudyQuestions.filter((question) => questionIds.includes(question.id));

    if (wrongQuestions.length === 0) {
      addNotification(
        "Sem erros na sessao",
        "Voce nao acumulou erros suficientes nesta rodada para uma revisao dedicada.",
        "info"
      );
      return;
    }

    setActiveStudyQuestions(shuffleQuestions(wrongQuestions));
    setStudyProgress({
      ...initialStudyProgress,
      activeMaterialTitle: "Revisao imediata dos erros",
    });
    addNotification(
      "Erros separados",
      `${wrongQuestions.length} questoes erradas voltaram para uma nova rodada.`,
      "success"
    );
  };

  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
    setScreen("dashboard");
    addNotification("Bem-vindo!", "Sua jornada personalizada comecou.", "success");
  };

  const handleOpenDashboardStudy = () => {
    setActiveStudyQuestions(studyQuestions);
    if (!studyProgress.activeMaterialTitle) {
      resetStudySession();
    }

    setScreen("study");
  };

  return {
    notifications,
    removeNotification,
    isAIModalOpen,
    setIsAIModalOpen,
    aiContext,
    openAI,
    screen,
    setScreen,
    hasCompletedOnboarding,
    handleCompleteOnboarding,
    overview,
    tasks,
    docs,
    trails,
    reviewQuestionCount,
    selectedDocId,
    activeStudyQuestions,
    studyProgress,
    simuladoQuestions,
    handleOpenDashboardStudy,
    handleUpload,
    handleAnalyze,
    handleOpenDocument,
    handleStartQuestions,
    handleGenerateFlashcards,
    handleOpenSummary,
    handleOpenTrailNode,
    handleRemoveDoc,
    handleStartReview,
    handleOpenSimulado,
    handleToggleTask,
    handleRecalculatePlan,
    handleCreateTask,
    handleDeleteTask,
    handleAddManualQuestion,
    handleSelectStudyOption,
    handleSubmitStudyAnswer,
    handleNextStudyQuestion,
    handleRestartStudy,
    handleReviewWrongQuestions,
    handleSaveForLater,
    handleAddToPlan,
  };
};
