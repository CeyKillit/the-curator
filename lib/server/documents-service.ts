import { supabase } from "@/lib/supabase/server";
import { getLocalUserId } from "./database";
import type {
  AnalyticsMetricRecord,
  CuratedDocumentImportPayload,
  DocumentDetailsPayload,
  ExtractedQuestionRecord,
  FlashcardRecord,
  PdfDocumentRecord,
  StudyTrailRecord,
} from "./types";

// ---- helpers ----

const createId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const slugifyFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

const sanitizeFileTitle = (fileName: string) =>
  fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const hasHighGarbageRatio = (value: string) => {
  const weirdCharCount =
    (value.match(/[ÃÂÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/g) ?? []).length;
  const symbolCount = (value.match(/[^A-Za-zÀ-ÿ0-9\s.,;:!?()[\]'"%-]/g) ?? []).length;
  return (weirdCharCount + symbolCount) / Math.max(value.length, 1) > 0.18;
};

const hasMojibakePattern = (value: string) =>
  /(Ã.|Â.|Ð.|Ñ.|Ò.|Ó.|Ô.|Õ.|Ö.|Ø.|Ù.|Ú.|Û.|Ü.|Ý.|Þ.|ß.)/.test(value) ||
  /[^\s]{8,}Ã[^\s]{4,}/.test(value);

const looksBrokenPdfContent = (value: string | undefined | null) => {
  if (!value) return false;
  const normalized = value.trim();
  return (
    /^[A-F0-9]{20,}$/i.test(normalized) ||
    normalized.includes("/Linearized") ||
    normalized.includes("/Filter/FlateDecode") ||
    normalized.includes("Adobe PDF Library") ||
    normalized.includes("x:xmpmeta") ||
    normalized.includes("rdf:Description") ||
    normalized.includes("xmlns:") ||
    normalized.includes("uuid:") ||
    normalized.includes("http://ns.adobe.com") ||
    normalized.includes("http://purl.org") ||
    normalized.includes("<?xpacket") ||
    normalized.includes("pdfx:") ||
    normalized.startsWith("/Filter/") ||
    normalized.startsWith("/Linearized") ||
    normalized.startsWith("If") ||
    hasMojibakePattern(normalized) ||
    hasHighGarbageRatio(normalized)
  );
};

// ---- row mappers (snake_case DB → camelCase TS) ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function docFromRow(r: any): PdfDocumentRecord {
  return {
    id: r.id,
    userId: r.user_id,
    fileName: r.file_name,
    fileUrl: r.file_url,
    storageKey: r.storage_key,
    fileSize: r.file_size,
    uploadedAt: r.uploaded_at,
    processingStatus: r.processing_status,
    isRead: r.is_read,
    isAnalyzed: r.is_analyzed,
    extractedTitle: r.extracted_title,
    extractedSubject: r.extracted_subject,
    extractedSummary: r.extracted_summary,
    extractedTopics: r.extracted_topics ?? [],
    extractedQuestionIds: r.extracted_question_ids ?? [],
    extractedFlashcardIds: r.extracted_flashcard_ids ?? [],
    generatedTrailId: r.generated_trail_id ?? undefined,
    processingError: r.processing_error ?? null,
    deletedAt: r.deleted_at ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function questionFromRow(r: any): ExtractedQuestionRecord {
  return {
    id: r.id,
    pdfId: r.pdf_id,
    questionNumber: r.question_number,
    statement: r.statement,
    options: r.options as Array<{ id: string; label: string }>,
    correctAnswer: r.correct_answer ?? undefined,
    explanation: r.explanation ?? undefined,
    topic: r.topic,
    difficulty: r.difficulty,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flashcardFromRow(r: any): FlashcardRecord {
  return {
    id: r.id,
    pdfId: r.pdf_id,
    question: r.question,
    answer: r.answer,
    topic: r.topic,
    difficulty: r.difficulty,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function trailFromRow(r: any): StudyTrailRecord {
  return {
    id: r.id,
    userId: r.user_id,
    pdfId: r.pdf_id,
    title: r.title,
    subject: r.subject,
    progress: r.progress,
    status: r.status,
    createdAt: r.created_at,
  };
}

// ---- storage helpers ----

function getPdfPublicUrl(storageKey: string) {
  const { data } = supabase.storage.from("pdfs").getPublicUrl(storageKey);
  return data.publicUrl;
}

// ---- analytics ----

const computeProgressPercent = (
  trail: StudyTrailRecord | undefined,
  questions: ExtractedQuestionRecord[],
  flashcards: FlashcardRecord[]
) => {
  if (!trail) return 0;
  if (questions.length > 0) return 35;
  if (flashcards.length > 0) return 20;
  return 10;
};

const upsertAnalyticsForDocument = async (documentId: string) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return;

  const doc = docFromRow(docRow);

  const { data: trailRow } = doc.generatedTrailId
    ? await supabase.from("study_trails").select("*").eq("id", doc.generatedTrailId).single()
    : { data: null };

  const trail = trailRow ? trailFromRow(trailRow) : undefined;

  const { data: questionRows } = await supabase
    .from("extracted_questions")
    .select("id")
    .eq("pdf_id", documentId);

  const { data: flashcardRows } = await supabase
    .from("flashcards")
    .select("id")
    .eq("pdf_id", documentId);

  const questions = (questionRows ?? []) as ExtractedQuestionRecord[];
  const flashcards = (flashcardRows ?? []) as FlashcardRecord[];

  const metric: AnalyticsMetricRecord = {
    id: `${doc.userId}_${doc.extractedSubject}`,
    userId: doc.userId,
    subject: doc.extractedSubject,
    accuracyRate: 0,
    questionsSolved: 0,
    flashcardsReviewed: 0,
    studyTime: 0,
    progressPercent: computeProgressPercent(trail, questions, flashcards),
    updatedAt: new Date().toISOString(),
  };

  await supabase.from("analytics_metrics").upsert({
    id: metric.id,
    user_id: metric.userId,
    subject: metric.subject,
    accuracy_rate: metric.accuracyRate,
    questions_solved: metric.questionsSolved,
    flashcards_reviewed: metric.flashcardsReviewed,
    study_time: metric.studyTime,
    progress_percent: metric.progressPercent,
    updated_at: metric.updatedAt,
  });
};

// ---- public API ----

export const listDocuments = async () => {
  const { data, error } = await supabase
    .from("pdf_documents")
    .select("*")
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const doc = docFromRow(row);
    return {
      ...doc,
      extractedTitle: looksBrokenPdfContent(doc.extractedTitle)
        ? sanitizeFileTitle(doc.fileName)
        : doc.extractedTitle,
      extractedSummary: looksBrokenPdfContent(doc.extractedSummary) ? "" : doc.extractedSummary,
      extractedTopics: looksBrokenPdfContent(doc.extractedSummary) ? [] : doc.extractedTopics,
      questionsCount: doc.extractedQuestionIds.length,
      flashcardsCount: doc.extractedFlashcardIds.length,
    };
  });
};

export const getDocumentDetails = async (
  documentId: string
): Promise<DocumentDetailsPayload | null> => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return null;

  const doc = docFromRow(docRow);

  const { data: questionRows } = await supabase
    .from("extracted_questions")
    .select("*")
    .eq("pdf_id", documentId)
    .order("question_number");

  const { data: flashcardRows } = await supabase
    .from("flashcards")
    .select("*")
    .eq("pdf_id", documentId);

  const questions = (questionRows ?? []).map(questionFromRow);
  const flashcards = (flashcardRows ?? []).map(flashcardFromRow);
  const extractedSummary = looksBrokenPdfContent(doc.extractedSummary) ? "" : doc.extractedSummary;

  return {
    ...doc,
    extractedTitle: looksBrokenPdfContent(doc.extractedTitle)
      ? sanitizeFileTitle(doc.fileName)
      : doc.extractedTitle,
    extractedSummary,
    extractedTopics: looksBrokenPdfContent(doc.extractedSummary) ? [] : doc.extractedTopics,
    questionsCount: questions.length,
    flashcardsCount: flashcards.length,
    questions,
    flashcards,
  };
};

interface ManualQuestionInput {
  questionNumber?: string;
  statement: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer?: string;
  explanation?: string;
  topic?: string;
}

const uploadPdfToStorage = async (fileBuffer: Buffer, storageKey: string) => {
  const { error } = await supabase.storage.from("pdfs").upload(storageKey, fileBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`Falha ao enviar PDF para o Storage: ${error.message}`);
  return getPdfPublicUrl(storageKey);
};

const createDocumentRecord = async (file: File) => {
  const userId = getLocalUserId();
  const docId = createId("pdf");
  const storageKey = `${docId}/${slugifyFileName(file.name)}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const fileUrl = await uploadPdfToStorage(fileBuffer, storageKey);

  const { error } = await supabase.from("pdf_documents").insert({
    id: docId,
    user_id: userId,
    file_name: file.name,
    file_url: fileUrl,
    storage_key: storageKey,
    file_size: file.size,
    uploaded_at: new Date().toISOString(),
    processing_status: "processing",
    is_read: false,
    is_analyzed: false,
    extracted_title: file.name.replace(/\.[^.]+$/, ""),
    extracted_subject: "Geral",
    extracted_summary: "",
    extracted_topics: [],
    extracted_question_ids: [],
    extracted_flashcard_ids: [],
    generated_trail_id: null,
    processing_error: null,
    deleted_at: null,
  });

  if (error) throw new Error(`Falha ao registrar documento: ${error.message}`);

  return { docId, storageKey, fileBuffer };
};

export const processDocumentById = async (documentId: string) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) throw new Error("Documento não encontrado para processamento.");

  const document = docFromRow(docRow);

  try {
    await supabase
      .from("pdf_documents")
      .update({ processing_status: "processing", processing_error: null })
      .eq("id", documentId);

    // Baixa o PDF do Supabase Storage
    const { data: blob, error: downloadError } = await supabase.storage
      .from("pdfs")
      .download(document.storageKey);

    if (downloadError || !blob) throw new Error(`Falha ao baixar PDF: ${downloadError?.message}`);

    const fileBuffer = Buffer.from(await blob.arrayBuffer());

    const { processPdfDocument } = await import("./document-processing");
    const processed = await processPdfDocument(fileBuffer, document.id, document.fileName);

    const trailId = createId("trail");
    const now = new Date().toISOString();

    // Remove dados antigos
    const oldTrailId = document.generatedTrailId;
    await supabase.from("extracted_questions").delete().eq("pdf_id", document.id);
    await supabase.from("flashcards").delete().eq("pdf_id", document.id);
    if (oldTrailId) {
      await supabase.from("trail_nodes").delete().eq("trail_id", oldTrailId);
      await supabase.from("study_trails").delete().eq("id", oldTrailId);
    }

    // Insere nova trilha
    await supabase.from("study_trails").insert({
      id: trailId,
      user_id: document.userId,
      pdf_id: document.id,
      title: processed.trail.title,
      subject: processed.subject,
      progress: 0,
      status: "not_started",
      created_at: now,
    });

    // Insere nós da trilha
    if (processed.trail.nodes.length > 0) {
      await supabase.from("trail_nodes").insert(
        processed.trail.nodes.map((node, index) => ({
          id: createId("node"),
          trail_id: trailId,
          title: node.title,
          type: node.type,
          status: index === 0 ? "in_progress" : "pending",
          order: index + 1,
          related_question_ids: node.relatedQuestionIds,
          related_flashcard_ids: node.relatedFlashcardIds,
        }))
      );
    }

    // Insere questões
    if (processed.questions.length > 0) {
      await supabase.from("extracted_questions").insert(
        processed.questions.map((q) => ({
          id: q.id,
          pdf_id: q.pdfId,
          question_number: q.questionNumber,
          statement: q.statement,
          options: q.options,
          correct_answer: q.correctAnswer ?? null,
          explanation: q.explanation ?? null,
          topic: q.topic,
          difficulty: q.difficulty,
          created_at: q.createdAt,
        }))
      );
    }

    // Insere flashcards
    if (processed.flashcards.length > 0) {
      await supabase.from("flashcards").insert(
        processed.flashcards.map((f) => ({
          id: f.id,
          pdf_id: f.pdfId,
          question: f.question,
          answer: f.answer,
          topic: f.topic,
          difficulty: f.difficulty,
          created_at: f.createdAt,
        }))
      );
    }

    // Atualiza documento
    await supabase.from("pdf_documents").update({
      processing_status: "processed",
      is_analyzed: true,
      extracted_title: processed.title,
      extracted_subject: processed.subject,
      extracted_summary: processed.summary,
      extracted_topics: processed.topics,
      extracted_question_ids: processed.questions.map((q) => q.id),
      extracted_flashcard_ids: processed.flashcards.map((f) => f.id),
      generated_trail_id: trailId,
      processing_error: null,
    }).eq("id", documentId);

    await upsertAnalyticsForDocument(documentId);
  } catch (error) {
    console.error("Document processing failed:", {
      documentId,
      fileName: document.fileName,
      error: error instanceof Error ? error.message : String(error),
    });

    await supabase.from("pdf_documents").update({
      processing_status: "failed",
      processing_error:
        error instanceof Error ? error.message : "Falha desconhecida ao processar PDF.",
    }).eq("id", documentId);
  }
};

export const createAndProcessDocument = async (file: File) => {
  const { docId } = await createDocumentRecord(file);
  void processDocumentById(docId);
  const documents = await listDocuments();
  return documents.find((d) => d.id === docId);
};

export const queueDocumentProcessing = async (documentId: string) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return null;

  await supabase.from("pdf_documents").update({
    processing_status: "processing",
    processing_error: null,
  }).eq("id", documentId);

  void processDocumentById(documentId);

  const documents = await listDocuments();
  return documents.find((d) => d.id === documentId) ?? null;
};

export const addManualQuestionToDocument = async (
  documentId: string,
  input: ManualQuestionInput
) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return null;

  const doc = docFromRow(docRow);

  const sanitizedStatement = input.statement.trim();
  const sanitizedOptions = input.options
    .map((o) => ({ id: o.id.trim().toUpperCase(), label: o.label.trim() }))
    .filter((o) => o.id && o.label);

  if (!sanitizedStatement || sanitizedOptions.length < 2) {
    throw new Error("Questão inválida. Informe enunciado e pelo menos duas alternativas.");
  }

  const questionId = createId("question");

  const { data: existingQuestions } = await supabase
    .from("extracted_questions")
    .select("id")
    .eq("pdf_id", documentId);

  const nextNumber =
    input.questionNumber?.trim() || String((existingQuestions?.length ?? 0) + 1);

  const newQuestion = {
    id: questionId,
    pdf_id: documentId,
    question_number: nextNumber,
    statement: sanitizedStatement,
    options: sanitizedOptions,
    correct_answer: input.correctAnswer?.trim().toUpperCase() ?? null,
    explanation: input.explanation?.trim() ?? null,
    topic: input.topic?.trim() || doc.extractedSubject || "Geral",
    difficulty: sanitizedOptions.length >= 5 ? "medium" : "easy",
    created_at: new Date().toISOString(),
  };

  await supabase.from("extracted_questions").insert(newQuestion);

  const newQuestionIds = [...doc.extractedQuestionIds, questionId];
  await supabase.from("pdf_documents").update({
    extracted_question_ids: newQuestionIds,
    processing_status: "processed",
    is_analyzed: true,
    processing_error: null,
  }).eq("id", documentId);

  // Adiciona questão ao nó "exercise" da trilha
  if (doc.generatedTrailId) {
    const { data: exerciseNode } = await supabase
      .from("trail_nodes")
      .select("*")
      .eq("trail_id", doc.generatedTrailId)
      .eq("type", "exercise")
      .single();

    if (exerciseNode) {
      const ids: string[] = exerciseNode.related_question_ids ?? [];
      if (!ids.includes(questionId)) {
        await supabase
          .from("trail_nodes")
          .update({ related_question_ids: [...ids, questionId] })
          .eq("id", exerciseNode.id);
      }
    }
  }

  await upsertAnalyticsForDocument(documentId);
  return getDocumentDetails(documentId);
};

export const updateQuestion = async (
  documentId: string,
  questionId: string,
  input: {
    statement?: string;
    options?: Array<{ id: string; label: string }>;
    correctAnswer?: string | null;
    explanation?: string | null;
    topic?: string;
  }
) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("id")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return null;

  const { data: questionRow } = await supabase
    .from("extracted_questions")
    .select("*")
    .eq("id", questionId)
    .eq("pdf_id", documentId)
    .single();

  if (!questionRow) return null;

  const updates: Record<string, unknown> = {};
  if (input.statement !== undefined) updates.statement = input.statement.trim();
  if (input.options !== undefined) {
    updates.options = input.options
      .map((o) => ({ id: o.id.trim().toUpperCase(), label: o.label.trim() }))
      .filter((o) => o.id && o.label);
  }
  if (input.correctAnswer !== undefined) {
    updates.correct_answer = input.correctAnswer?.trim().toUpperCase() ?? null;
  }
  if (input.explanation !== undefined) {
    updates.explanation = input.explanation?.trim() ?? null;
  }
  if (input.topic !== undefined) {
    updates.topic = input.topic.trim() || questionRow.topic;
  }

  await supabase.from("extracted_questions").update(updates).eq("id", questionId);

  return getDocumentDetails(documentId);
};

export const deleteQuestion = async (documentId: string, questionId: string) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return false;

  const doc = docFromRow(docRow);

  const { data: questionRow } = await supabase
    .from("extracted_questions")
    .select("id")
    .eq("id", questionId)
    .eq("pdf_id", documentId)
    .single();

  if (!questionRow) return false;

  await supabase.from("extracted_questions").delete().eq("id", questionId);

  await supabase.from("pdf_documents").update({
    extracted_question_ids: doc.extractedQuestionIds.filter((id) => id !== questionId),
  }).eq("id", documentId);

  // Remove dos nós da trilha
  if (doc.generatedTrailId) {
    const { data: nodes } = await supabase
      .from("trail_nodes")
      .select("*")
      .eq("trail_id", doc.generatedTrailId);

    for (const node of nodes ?? []) {
      const ids: string[] = node.related_question_ids ?? [];
      if (ids.includes(questionId)) {
        await supabase
          .from("trail_nodes")
          .update({ related_question_ids: ids.filter((id) => id !== questionId) })
          .eq("id", node.id);
      }
    }
  }

  return true;
};

export const deleteDocumentCascade = async (documentId: string) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return false;

  const doc = docFromRow(docRow);

  // Soft-delete do documento
  await supabase.from("pdf_documents").update({
    deleted_at: new Date().toISOString(),
  }).eq("id", documentId);

  // Remove questões, flashcards, trilha
  await supabase.from("extracted_questions").delete().eq("pdf_id", documentId);
  await supabase.from("flashcards").delete().eq("pdf_id", documentId);
  if (doc.generatedTrailId) {
    await supabase.from("trail_nodes").delete().eq("trail_id", doc.generatedTrailId);
    await supabase.from("study_trails").delete().eq("id", doc.generatedTrailId);
  }
  await supabase
    .from("analytics_metrics")
    .delete()
    .eq("subject", doc.extractedSubject)
    .eq("user_id", doc.userId);

  // Remove arquivo do Storage
  try {
    await supabase.storage.from("pdfs").remove([doc.storageKey]);
  } catch {
    // Ignora erro se arquivo já não existir
  }

  return true;
};

export const getDashboardOverview = async () => {
  const { data: allDocs } = await supabase
    .from("pdf_documents")
    .select("*")
    .is("deleted_at", null);

  const { data: questionRows } = await supabase.from("extracted_questions").select("id");
  const { data: flashcardRows } = await supabase.from("flashcards").select("id");
  const { data: trailRows } = await supabase.from("study_trails").select("*");
  const { data: analyticsRows } = await supabase.from("analytics_metrics").select("*");

  const docs = allDocs ?? [];
  const nextTrail = (trailRows ?? []).find((t) => t.status !== "completed");

  return {
    documentsUploaded: docs.length,
    documentsAnalyzed: docs.filter((d) => d.is_analyzed).length,
    questionsExtracted: questionRows?.length ?? 0,
    flashcardsGenerated: flashcardRows?.length ?? 0,
    trailsCreated: trailRows?.length ?? 0,
    nextTrailTitle: nextTrail?.title ?? "Nenhuma trilha criada ainda",
    subjects: (analyticsRows ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      subject: r.subject,
      accuracyRate: r.accuracy_rate,
      questionsSolved: r.questions_solved,
      flashcardsReviewed: r.flashcards_reviewed,
      studyTime: r.study_time,
      progressPercent: r.progress_percent,
      updatedAt: r.updated_at,
    })) as AnalyticsMetricRecord[],
  };
};

export const readDocumentFile = async (documentId: string) => {
  const { data: docRow } = await supabase
    .from("pdf_documents")
    .select("file_url, file_name")
    .eq("id", documentId)
    .is("deleted_at", null)
    .single();

  if (!docRow) return null;

  return {
    redirectUrl: docRow.file_url as string,
    fileName: docRow.file_name as string,
  };
};

// ---- importação curada (development/seeding) ----

const defaultTrailNodes = (
  title: string,
  questions: ExtractedQuestionRecord[],
  flashcards: FlashcardRecord[]
) => [
  {
    title: `Introducao a ${title}`,
    type: "summary" as const,
    relatedQuestionIds: [],
    relatedFlashcardIds: [],
  },
  {
    title: "Questoes principais",
    type: "exercise" as const,
    relatedQuestionIds: questions.map((q) => q.id),
    relatedFlashcardIds: [],
  },
  {
    title: "Revisao ativa",
    type: "review" as const,
    relatedQuestionIds: [],
    relatedFlashcardIds: flashcards.map((f) => f.id),
  },
];

export const importCuratedDocument = async (payload: CuratedDocumentImportPayload) => {
  const { stat, readFile } = await import("node:fs/promises");
  const sourceFile = await stat(payload.sourcePdfPath.trim()).catch(() => null);
  if (!sourceFile?.isFile()) throw new Error("Arquivo PDF não encontrado.");

  const userId = getLocalUserId();
  const docId = createId("pdf");
  const storageKey = `${docId}/${slugifyFileName(payload.fileName)}`;
  const fileBuffer = await readFile(payload.sourcePdfPath.trim());
  const fileUrl = await uploadPdfToStorage(fileBuffer, storageKey);

  const normalizedQuestions: ExtractedQuestionRecord[] = payload.questions.map((q) => {
    const questionId = createId("question");
    const options = q.options
      .map((o) => ({ id: o.id.trim().toUpperCase(), label: o.label.trim() }))
      .filter((o) => o.id && o.label);
    if (!q.statement.trim() || options.length < 2) {
      throw new Error(`Questão inválida: ${q.questionNumber || "sem número"}.`);
    }
    return {
      id: questionId,
      pdfId: docId,
      questionNumber: q.questionNumber.trim(),
      statement: q.statement.trim(),
      options,
      correctAnswer: q.correctAnswer?.trim().toUpperCase() || undefined,
      explanation: q.explanation?.trim() || undefined,
      topic: q.topic?.trim() || payload.subject.trim(),
      difficulty: q.difficulty || (options.length >= 5 ? "medium" : "easy"),
      createdAt: new Date().toISOString(),
    };
  });

  const normalizedFlashcards: FlashcardRecord[] = (payload.flashcards ?? [])
    .map((f) => ({
      id: createId("flashcard"),
      pdfId: docId,
      question: f.question.trim(),
      answer: f.answer.trim(),
      topic: f.topic?.trim() || payload.subject.trim(),
      difficulty: f.difficulty || "medium",
      createdAt: new Date().toISOString(),
    }))
    .filter((f) => f.question && f.answer);

  const trailId = createId("trail");
  const questionIdByNumber = new Map(normalizedQuestions.map((q) => [q.questionNumber, q.id]));

  const trailNodesSource =
    payload.trail?.nodes && payload.trail.nodes.length > 0
      ? payload.trail.nodes.map((node) => ({
          title: node.title.trim(),
          type: node.type,
          relatedQuestionIds: (node.relatedQuestionNumbers ?? [])
            .map((n) => questionIdByNumber.get(n))
            .filter((v): v is string => Boolean(v)),
          relatedFlashcardIds: (node.relatedFlashcardIndexes ?? [])
            .map((i) => normalizedFlashcards[i]?.id)
            .filter((v): v is string => Boolean(v)),
        }))
      : defaultTrailNodes(payload.title.trim(), normalizedQuestions, normalizedFlashcards);

  const now = new Date().toISOString();

  await supabase.from("pdf_documents").insert({
    id: docId,
    user_id: userId,
    file_name: payload.fileName,
    file_url: fileUrl,
    storage_key: storageKey,
    file_size: sourceFile.size,
    uploaded_at: now,
    processing_status: "processed",
    is_read: false,
    is_analyzed: true,
    extracted_title: payload.title.trim(),
    extracted_subject: payload.subject.trim(),
    extracted_summary: payload.summary?.trim() || "",
    extracted_topics: payload.topics?.map((t) => t.trim()).filter(Boolean) || [],
    extracted_question_ids: normalizedQuestions.map((q) => q.id),
    extracted_flashcard_ids: normalizedFlashcards.map((f) => f.id),
    generated_trail_id: trailId,
    processing_error: null,
    deleted_at: null,
  });

  if (normalizedQuestions.length > 0) {
    await supabase.from("extracted_questions").insert(
      normalizedQuestions.map((q) => ({
        id: q.id,
        pdf_id: q.pdfId,
        question_number: q.questionNumber,
        statement: q.statement,
        options: q.options,
        correct_answer: q.correctAnswer ?? null,
        explanation: q.explanation ?? null,
        topic: q.topic,
        difficulty: q.difficulty,
        created_at: q.createdAt,
      }))
    );
  }

  if (normalizedFlashcards.length > 0) {
    await supabase.from("flashcards").insert(
      normalizedFlashcards.map((f) => ({
        id: f.id,
        pdf_id: f.pdfId,
        question: f.question,
        answer: f.answer,
        topic: f.topic,
        difficulty: f.difficulty,
        created_at: f.createdAt,
      }))
    );
  }

  await supabase.from("study_trails").insert({
    id: trailId,
    user_id: userId,
    pdf_id: docId,
    title: payload.trail?.title?.trim() || `Trilha: ${payload.title.trim()}`,
    subject: payload.trail?.subject?.trim() || payload.subject.trim(),
    progress: 0,
    status: "not_started",
    created_at: now,
  });

  if (trailNodesSource.length > 0) {
    await supabase.from("trail_nodes").insert(
      trailNodesSource.map((node, index) => ({
        id: createId("node"),
        trail_id: trailId,
        title: node.title,
        type: node.type,
        status: index === 0 ? "in_progress" : "pending",
        order: index + 1,
        related_question_ids: node.relatedQuestionIds,
        related_flashcard_ids: node.relatedFlashcardIds,
      }))
    );
  }

  await upsertAnalyticsForDocument(docId);
  return getDocumentDetails(docId);
};
