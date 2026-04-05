"use client";

type ApiDocument = {
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
};

type ApiDocumentQuestion = {
  id: string;
  questionNumber: string;
  statement: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer?: string;
  explanation?: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
};

type ApiFlashcard = {
  id: string;
  pdfId: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
};

type ApiDocumentDetails = ApiDocument & {
  extractedSummary: string;
  extractedTopics: string[];
  questions: ApiDocumentQuestion[];
  flashcards: ApiFlashcard[];
};

type ManualQuestionPayload = {
  questionNumber?: string;
  statement: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer?: string;
  explanation?: string;
  topic?: string;
};

type UploadDocumentsResult = {
  documents: ApiDocument[];
  rejectedFiles: string[];
};

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const validatePdfFiles = (files: FileList | null) => {
  const list = Array.from(files ?? []);

  return {
    validFiles: list.filter(isPdfFile),
    invalidFiles: list.filter((file) => !isPdfFile(file)),
  };
};

export const fetchDocuments = async () => {
  const response = await fetch("/api/documents", { cache: "no-store" });
  const data = (await response.json()) as {
    documents?: ApiDocument[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Falha ao carregar documentos.");
  }

  return data.documents ?? [];
};

export const uploadDocuments = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/documents", {
    method: "POST",
    body: formData,
  });
  const data = (await response.json()) as {
    documents?: ApiDocument[];
    rejectedFiles?: string[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Falha ao enviar arquivos.");
  }

  return {
    documents: data.documents ?? [],
    rejectedFiles: data.rejectedFiles ?? [],
  } satisfies UploadDocumentsResult;
};

export const deleteDocument = async (id: string) => {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Não foi possível excluir o documento.");
  }
};

export const reprocessDocument = async (id: string) => {
  const response = await fetch(`/api/documents/${id}`, {
    method: "PATCH",
  });
  const data = (await response.json().catch(() => ({}))) as {
    document?: ApiDocument;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Não foi possível reprocessar o documento.");
  }

  return data.document ?? null;
};

export const fetchDocumentById = async (id: string) => {
  const response = await fetch(`/api/documents/${id}`, { cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as {
    document?: ApiDocumentDetails;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Nao foi possivel carregar o documento.");
  }

  return data.document ?? null;
};

export const addManualQuestion = async (id: string, payload: ManualQuestionPayload) => {
  const response = await fetch(`/api/documents/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as {
    document?: ApiDocumentDetails;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Nao foi possivel salvar a questao manual.");
  }

  return data.document ?? null;
};

export type { ApiDocument, ApiDocumentDetails, ApiFlashcard, UploadDocumentsResult, ManualQuestionPayload };
