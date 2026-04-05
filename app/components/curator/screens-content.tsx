"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  Eye,
  FileSearch,
  FileText,
  GraduationCap,
  Layers3,
  Lightbulb,
  Plus,
  RefreshCcw,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./chrome";
import type { Doc, StudyProgress, StudyQuestion } from "./types";

export const LibraryScreen = ({
  docs,
  onUpload,
  onAnalyze,
  onOpenDocument,
  onStartQuestions,
  onGenerateFlashcards,
  onOpenSummary,
  onRemoveDoc,
  onManageQuestions,
}: {
  docs: Doc[];
  onUpload: (files: FileList | null) => void;
  onAnalyze: (id: string) => void;
  onOpenDocument: (id: string) => void;
  onStartQuestions: (id: string) => void;
  onGenerateFlashcards: (id: string) => void;
  onOpenSummary: (id: string) => void;
  onRemoveDoc: (id: string) => void;
  onManageQuestions?: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Doc["status"] | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return docs.filter((doc) => {
      const matchesQuery =
        !normalized ||
        doc.title.toLowerCase().includes(normalized) ||
        doc.summary?.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [docs, query, statusFilter]);

  const analyzedCount = docs.filter((doc) => doc.status === "analyzed").length;

  const handleTriggerUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-4 pt-24 sm:px-6 lg:px-8">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            onUpload(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-headline mb-2 text-4xl font-extrabold tracking-tight">Biblioteca</h2>
            <p className="max-w-md text-gray-500">
              Gerencie seus PDFs, acompanhe o processamento e abra rapidamente o material certo para estudar.
            </p>
          </div>
          <button
            onClick={handleTriggerUpload}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 text-white shadow-lg transition-all active:scale-95 hover:shadow-primary/20 sm:w-auto"
          >
            <FileText size={20} />
            <span className="font-bold tracking-wide">Enviar PDF</span>
            <Plus size={20} className="transition-transform group-hover:rotate-90" />
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_0.7fr_0.8fr]">
          <label className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título ou resumo"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as Doc["status"] | "all")}
            className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm shadow-sm outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="idle">Aguardando análise</option>
            <option value="analyzing">Analisando</option>
            <option value="analyzed">Analisados</option>
            <option value="failed">Com falha</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Materiais
              </p>
              <p className="font-headline mt-2 text-3xl font-black text-on-surface">{docs.length}</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Prontos
              </p>
              <p className="font-headline mt-2 text-3xl font-black text-emerald-700">
                {analyzedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.length === 0 ? (
            docs.length === 0 ? (
              // Zero docs total — estado de onboarding
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-3 flex flex-col items-center rounded-[2rem] border-2 border-dashed border-primary/15 bg-gradient-to-br from-primary/3 to-white p-14 text-center"
              >
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-container shadow-xl shadow-primary/20"
                >
                  <FileText size={36} className="text-white" />
                </motion.div>
                <p className="font-headline mt-6 text-2xl font-extrabold text-on-surface">
                  Sua biblioteca está vazia
                </p>
                <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
                  Envie o primeiro PDF para começar. O Curator vai extrair as questões, gerar flashcards e montar trilhas personalizadas para você.
                </p>
                <button
                  onClick={handleTriggerUpload}
                  className="mt-8 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FileText size={18} />
                  Enviar primeiro PDF
                  <Plus size={18} />
                </button>
                <p className="mt-4 text-xs text-gray-400">Formatos aceitos: PDF · Máx. 20 MB</p>
              </motion.div>
            ) : (
              // Tem docs mas filtro não retornou nada
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lg:col-span-3 rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center shadow-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                  <FileSearch size={24} />
                </div>
                <p className="font-headline mt-4 text-lg font-bold text-on-surface">
                  Nenhum resultado
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Ajuste a busca ou troque o filtro de status.
                </p>
              </motion.div>
            )
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="group flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                    <FileText size={28} />
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === "analyzed" ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        <CheckCircle2 size={12} className="fill-emerald-600 text-white" />
                        Lido e analisado
                      </div>
                    ) : doc.status === "analyzing" ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles size={12} />
                        </motion.div>
                        Analisando...
                      </div>
                    ) : doc.status === "failed" ? (
                      <button
                        onClick={() => onAnalyze(doc.id)}
                        className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-100"
                      >
                        Falha na análise
                      </button>
                    ) : (
                      <button
                        onClick={() => onAnalyze(doc.id)}
                        className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-primary-container"
                      >
                        Analisar agora
                      </button>
                    )}

                    <button
                      onClick={() => onRemoveDoc(doc.id)}
                      className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remover ${doc.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-headline mb-1 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                    {doc.title}
                  </h4>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/70">
                    {doc.subject || "Materia em identificacao"}
                  </p>
                  <p className="text-xs text-gray-400">Adicionado há {doc.time} • {doc.size}</p>
                </div>

                <div className="rounded-2xl bg-surface-container-low p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Resumo rápido
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {doc.summary?.trim()
                      ? doc.summary
                      : doc.status === "analyzed"
                        ? "Ainda nao encontramos texto suficiente ou limpo neste PDF para gerar um resumo confiavel."
                        : "Este material ainda nao foi analisado. Inicie a analise para gerar um resumo."}
                  </p>
                  {doc.status === "failed" && doc.processingError ? (
                    <p className="mt-3 text-xs font-medium text-rose-600">
                      Erro: {doc.processingError}
                    </p>
                  ) : null}
                </div>

                <div
                  className={cn(
                    "mt-auto flex flex-wrap gap-2",
                    doc.status !== "analyzed" && "pointer-events-none opacity-40"
                  )}
                >
                  <button
                    onClick={() => onOpenDocument(doc.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-primary hover:text-white"
                  >
                    <Eye size={14} /> Abrir PDF
                  </button>
                  {onManageQuestions && (
                    <button
                      onClick={() => onManageQuestions(doc.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary/8 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      <Layers3 size={14} /> Ver Questões
                    </button>
                  )}
                  <button
                    onClick={() => onGenerateFlashcards(doc.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-primary hover:text-white"
                  >
                    <Sparkles size={14} /> Flashcards
                  </button>
                  <button
                    onClick={() => onStartQuestions(doc.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-primary hover:text-white"
                  >
                    <GraduationCap size={14} /> Estudar
                  </button>
                  <button
                    onClick={() => onOpenSummary(doc.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-primary hover:text-white"
                  >
                    <FileText size={14} /> Resumo
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export const PdfViewerScreen = ({
  doc,
  onBack,
  onStartQuestions,
  onOpenSummary,
  onAddManualQuestion,
}: {
  doc: Doc;
  onBack: () => void;
  onStartQuestions: (id: string) => void;
  onOpenSummary: (id: string) => void;
  onAddManualQuestion: (id: string, payload: {
    questionNumber?: string;
    statement: string;
    options: Array<{ id: string; label: string }>;
    correctAnswer?: string;
    explanation?: string;
    topic?: string;
  }) => Promise<void>;
}) => {
  const [questionNumber, setQuestionNumber] = useState("");
  const [topic, setTopic] = useState(doc.subject || "");
  const [statement, setStatement] = useState("");
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [options, setOptions] = useState([
    { id: "A", label: "" },
    { id: "B", label: "" },
    { id: "C", label: "" },
    { id: "D", label: "" },
    { id: "E", label: "" },
  ]);
  const [isSavingManualQuestion, setIsSavingManualQuestion] = useState(false);

  const resetManualQuestionForm = () => {
    setQuestionNumber("");
    setTopic(doc.subject || "");
    setStatement("");
    setExplanation("");
    setCorrectAnswer("A");
    setOptions([
      { id: "A", label: "" },
      { id: "B", label: "" },
      { id: "C", label: "" },
      { id: "D", label: "" },
      { id: "E", label: "" },
    ]);
  };

  return (
  <div className="min-h-screen pb-28 md:pb-32">
    <Header />
    <main className="mx-auto max-w-7xl px-4 pb-4 pt-24 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-4 text-sm font-bold text-primary transition hover:underline"
          >
            Voltar para biblioteca
          </button>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            {doc.title}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {doc.subject || "Materia nao identificada"} • {doc.size}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onStartQuestions(doc.id)}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container"
          >
            Criar sessao
          </button>
          <button
            onClick={() => onOpenSummary(doc.id)}
            className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
          >
            Abrir resumo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-slate-50 shadow-sm lg:sticky lg:top-24">
          {doc.fileUrl ? (
            <iframe
              src={doc.fileUrl}
              title={doc.title}
              className="w-full bg-white"
              style={{ height: "calc(100vh - 8rem)", minHeight: "960px" }}
            />
          ) : (
            <div
              className="flex items-center justify-center p-8 text-center text-sm text-gray-500"
              style={{ height: "calc(100vh - 8rem)", minHeight: "960px" }}
            >
              Este documento ainda nao possui uma URL disponivel para leitura.
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Resumo automatico
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {doc.summary?.trim()
                ? doc.summary
                : "Ainda nao encontramos texto suficiente e limpo neste PDF para montar um resumo confiavel."}
            </p>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Topicos principais
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(doc.extractedTopics?.length ? doc.extractedTopics : ["Aguardando topicos"]).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-primary/5 px-3 py-2 text-xs font-bold text-primary"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Questao manual
              </p>
              <span className="rounded-full bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                {doc.questionsCount ?? 0} questoes
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={questionNumber}
                  onChange={(event) => setQuestionNumber(event.target.value)}
                  placeholder="Numero da questao"
                  className="rounded-xl border border-black/5 bg-surface px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                />
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Topico ou materia"
                  className="rounded-xl border border-black/5 bg-surface px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              <textarea
                value={statement}
                onChange={(event) => setStatement(event.target.value)}
                placeholder="Cole aqui o enunciado da questao"
                rows={4}
                className="w-full rounded-2xl border border-black/5 bg-surface px-4 py-3 text-sm outline-none placeholder:text-gray-400"
              />

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrectAnswer(option.id)}
                      className={cn(
                        "mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition",
                        correctAnswer === option.id
                          ? "border-primary bg-primary text-white"
                          : "border-black/10 bg-white text-gray-500"
                      )}
                    >
                      {correctAnswer === option.id ? <Check size={14} /> : option.id}
                    </button>
                    <textarea
                      value={option.label}
                      onChange={(event) =>
                        setOptions((prev) =>
                          prev.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          )
                        )
                      }
                      rows={2}
                      placeholder={`Alternativa ${option.id}`}
                      className="w-full rounded-xl border border-black/5 bg-surface px-4 py-3 text-sm outline-none placeholder:text-gray-400"
                    />
                  </div>
                ))}
              </div>

              <textarea
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                placeholder="Explicacao ou comentario da resposta (opcional)"
                rows={3}
                className="w-full rounded-2xl border border-black/5 bg-surface px-4 py-3 text-sm outline-none placeholder:text-gray-400"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isSavingManualQuestion || !statement.trim()}
                  onClick={async () => {
                    setIsSavingManualQuestion(true);
                    try {
                      await onAddManualQuestion(doc.id, {
                        questionNumber: questionNumber.trim() || undefined,
                        statement,
                        topic: topic.trim() || undefined,
                        explanation: explanation.trim() || undefined,
                        correctAnswer,
                        options: options.filter((option) => option.label.trim()),
                      });
                      resetManualQuestionForm();
                    } finally {
                      setIsSavingManualQuestion(false);
                    }
                  }}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container disabled:opacity-50"
                >
                  {isSavingManualQuestion ? "Salvando..." : "Adicionar questao"}
                </button>
                <button
                  type="button"
                  onClick={resetManualQuestionForm}
                  className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Duvidas frequentes
            </p>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>O que mais cai neste material?</li>
              <li>Quais topicos devo revisar primeiro?</li>
              <li>Esse PDF ja tem questoes reais utilizaveis?</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  </div>
  );
};

export const ReviewScreen = ({
  docs,
  reviewQuestionCount,
  onStartReview,
  onStartQuestions,
  onOpenLibrary,
  onOpenMockExam,
}: {
  docs: Doc[];
  reviewQuestionCount: number;
  onStartReview: () => void;
  onStartQuestions: (id: string) => void;
  onOpenLibrary: () => void;
  onOpenMockExam: () => void;
}) => {
  const reviewedDocs = docs.filter((doc) => doc.status === "analyzed");
  const totalReviewItems = reviewedDocs.reduce(
    (total, doc) => total + (doc.questionsCount ?? 0) + (doc.flashcardsCount ?? 0),
    0
  );
  const criticalItems = reviewedDocs.filter((doc) => (doc.questionsCount ?? 0) >= 10).length;
  const overdueItems = reviewedDocs.filter((doc) => (doc.flashcardsCount ?? 0) > 0).length;
  const subjectBuckets = reviewedDocs.reduce<Record<string, number>>((accumulator, doc) => {
    const key = doc.subject || "Geral";
    accumulator[key] = (accumulator[key] ?? 0) + (doc.questionsCount ?? 0);
    return accumulator;
  }, {});
  const topSubjects = Object.entries(subjectBuckets).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-6xl space-y-8 px-4 pb-4 pt-24 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight">Revisao</h2>
            <p className="mt-2 max-w-xl text-gray-500">
              Corrija fraquezas, retome questoes erradas e volte para os materiais que pedem reforco hoje.
            </p>
          </div>
          <button
            onClick={onOpenLibrary}
            className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
          >
            Abrir biblioteca
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Revisar hoje
            </p>
            <p className="font-headline mt-3 text-4xl font-black text-emerald-700">
              {Math.max(reviewQuestionCount || totalReviewItems, 0)}
            </p>
            <p className="mt-2 text-sm text-emerald-800/80">
              Questoes que voltam para voce em revisoes aleatorias com base nos erros reais.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
              Atrasado
            </p>
            <p className="font-headline mt-3 text-4xl font-black text-amber-700">
              {Math.max(overdueItems, 0)}
            </p>
            <p className="mt-2 text-sm text-amber-800/80">
              Materiais com flashcards ou pontos de revisao esperando sua volta.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-700">
              Critico
            </p>
            <p className="font-headline mt-3 text-4xl font-black text-rose-700">
              {Math.max(criticalItems, 0)}
            </p>
            <p className="mt-2 text-sm text-rose-800/80">
              PDFs com alta carga de questoes para revisar primeiro.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Questoes erradas por materia
                </p>
                <h3 className="font-headline mt-2 text-2xl font-extrabold text-on-surface">
                  Foco da revisao
                </h3>
              </div>
              <button
                onClick={onStartReview}
                disabled={reviewedDocs.length === 0 && reviewQuestionCount === 0}
                className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container disabled:opacity-50"
              >
                {reviewQuestionCount > 0 ? "Iniciar revisao" : "Revisao geral"}
              </button>
              <button
                onClick={onOpenMockExam}
                className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
              >
                Montar simulado
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {reviewQuestionCount > 0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Voce tem <span className="font-bold">{reviewQuestionCount}</span> questoes erradas na fila. Ao iniciar a revisao, elas entram em ordem aleatoria.
                </div>
              ) : reviewedDocs.length > 0 ? (
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-primary">
                  Ainda nao ha erros acumulados. A revisao geral usa as questoes reais dos modulos importados para manter seu ritmo ativo.
                </div>
              ) : null}
              {topSubjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-surface-container-low p-6 text-sm text-gray-500">
                  Ainda nao ha materias suficientes para montar uma revisao inteligente.
                </div>
              ) : (
                topSubjects.map(([subject, count]) => (
                  <div key={subject} className="rounded-2xl bg-surface-container-low p-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span>{subject}</span>
                      <span className="text-gray-400">{count} itens</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
                        style={{ width: `${Math.min(100, count * 8)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Lista de revisao
            </p>
            <div className="mt-5 space-y-3">
              {reviewedDocs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-surface-container-low p-6 text-sm text-gray-500">
                  Assim que os PDFs forem analisados, eles aparecem aqui com prioridade de revisao.
                </div>
              ) : (
                reviewedDocs.slice(0, 5).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => onStartQuestions(doc.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-black/5 bg-white p-4 text-left transition hover:border-primary/20 hover:bg-primary/5"
                  >
                    <div>
                      <p className="font-headline text-base font-bold text-on-surface">{doc.title}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {doc.subject || "Geral"} • {doc.questionsCount ?? 0} questoes
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-primary" />
                  </button>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export const SimuladoScreen = ({
  questions,
  onBack,
}: {
  questions: StudyQuestion[];
  onBack: () => void;
}) => {
  const [selectedSubject, setSelectedSubject] = useState("Todas");
  const [questionCount, setQuestionCount] = useState("10");
  const [durationMinutes, setDurationMinutes] = useState("20");
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<Array<{
    id: string; accuracy: number; correctAnswers: number; totalQuestions: number;
    durationSeconds: number; subject: string | null; finishedAt: string;
  }>>([]);

  // Carrega histórico na montagem
  useEffect(() => {
    fetch("/api/simulado", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ attempts?: typeof history }>)
      .then((d) => setHistory((d.attempts ?? []).slice(0, 5)))
      .catch(() => { /* silently ignore */ });
  }, [isSaved]); // recarrega após salvar

  const availableSubjects = Array.from(
    new Set(questions.map((question) => question.subject).filter(Boolean))
  ) as string[];

  const configuredQuestions = useMemo(() => {
    const filtered =
      selectedSubject === "Todas"
        ? questions
        : questions.filter((question) => question.subject === selectedSubject);

    return filtered.slice(0, Number(questionCount));
  }, [questionCount, questions, selectedSubject]);

  useEffect(() => {
    if (!isStarted || remainingSeconds <= 0) return;

    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isStarted, remainingSeconds]);

  const isFinished =
    isStarted &&
    (currentIndex >= configuredQuestions.length || remainingSeconds <= 0 || configuredQuestions.length === 0);

  const currentQuestion = configuredQuestions[currentIndex];
  const correctCount = configuredQuestions.filter((question) => {
    const selected = answers[question.id];
    return question.options.find((option) => option.correct)?.id === selected;
  }).length;
  const wrongCount = Math.max(Object.keys(answers).length - correctCount, 0);
  const accuracy =
    configuredQuestions.length > 0
      ? Math.round((correctCount / configuredQuestions.length) * 100)
      : 0;
  const weakestSubjects = Array.from(
    new Set(
      configuredQuestions
        .filter((question) => {
          const selected = answers[question.id];
          return selected && question.options.find((option) => option.correct)?.id !== selected;
        })
        .map((question) => question.subject || "Geral")
    )
  );

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(Math.max(seconds, 0) / 60);
    const remaining = Math.max(seconds, 0) % 60;
    return `${minutes.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setRemainingSeconds(Number(durationMinutes) * 60);
    setStartedAt(Date.now());
    setIsSaved(false);
    setIsStarted(true);
  };

  // Persiste tentativa ao terminar (apenas uma vez)
  useEffect(() => {
    if (!isFinished || isSaved || configuredQuestions.length === 0) return;
    setIsSaved(true);
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
    fetch("/api/simulado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalQuestions: configuredQuestions.length,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        durationSeconds,
        subject: selectedSubject === "Todas" ? null : selectedSubject,
      }),
    }).catch(() => { /* silently ignore */ });
  }, [isFinished, isSaved, configuredQuestions.length, correctCount, wrongCount, startedAt, selectedSubject]);

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-4 pt-24 sm:px-6 lg:px-8">
        {!isStarted ? (
          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
            <button onClick={onBack} className="text-sm font-bold text-primary hover:underline">
              Voltar
            </button>
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Simulado
              </p>
              <h2 className="font-headline mt-2 text-3xl font-extrabold text-on-surface">
                Monte um treino real
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Escolha a materia, a quantidade de questoes e o tempo total. Vamos usar as questoes reais ja extraidas dos seus PDFs.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-surface-container-low p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Materia</p>
                <select
                  value={selectedSubject}
                  onChange={(event) => setSelectedSubject(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="Todas">Todas</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-surface-container-low p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  Numero de questoes
                </p>
                <select
                  value={questionCount}
                  onChange={(event) => setQuestionCount(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div>

              <div className="rounded-2xl bg-surface-container-low p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Tempo</p>
                <select
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="10">10 min</option>
                  <option value="20">20 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-gray-600">
                Banco atual: <span className="font-bold text-on-surface">{questions.length} questoes</span>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-gray-600">
                Simulado atual: <span className="font-bold text-on-surface">{configuredQuestions.length} questoes</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={configuredQuestions.length === 0}
              className="mt-8 rounded-2xl bg-gradient-to-br from-primary to-primary-container px-6 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:scale-[1.01] disabled:opacity-50"
            >
              Iniciar simulado
            </button>
          </section>
        ) : isFinished ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Hero de resultado */}
            <div className={cn(
              "relative overflow-hidden rounded-[2rem] p-8 text-center shadow-xl sm:p-10",
              accuracy >= 70
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : accuracy >= 50
                  ? "bg-gradient-to-br from-amber-500 to-orange-500"
                  : "bg-gradient-to-br from-rose-500 to-rose-600"
            )}>
              {/* Partículas decorativas */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="pointer-events-none absolute rounded-full bg-white/10"
                  style={{
                    width: 20 + i * 15,
                    height: 20 + i * 15,
                    left: `${10 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{ y: [0, -12, 0], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                  {accuracy >= 70 ? "🎉 Excelente resultado!" : accuracy >= 50 ? "💪 Bom esforço!" : "📚 Hora de revisar"}
                </p>
                <motion.p
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="font-headline mt-3 text-7xl font-black text-white sm:text-8xl"
                >
                  {accuracy}%
                </motion.p>
                <p className="mt-2 text-lg font-semibold text-white/80">
                  {correctCount} de {configuredQuestions.length} corretas
                </p>
              </div>
            </div>

            {/* Cards de stats */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl bg-emerald-50 p-5 text-center"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Acertos</p>
                <p className="font-headline mt-2 text-4xl font-black text-emerald-700">{correctCount}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(correctCount / configuredQuestions.length) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl bg-rose-50 p-5 text-center"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-600">Erros</p>
                <p className="font-headline mt-2 text-4xl font-black text-rose-700">{wrongCount}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(wrongCount / configuredQuestions.length) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-rose-500"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl bg-surface-container-low p-5 text-center"
              >
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Tempo</p>
                <p className="font-headline mt-2 text-4xl font-black text-on-surface">
                  {formatTimer(remainingSeconds)}
                </p>
                <p className="mt-2 text-[10px] text-gray-400">restante</p>
              </motion.div>
            </div>

            {/* Análise e pontos fracos */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
                  accuracy >= 70 ? "bg-emerald-50" : "bg-amber-50"
                )}>
                  {accuracy >= 70 ? "🏆" : "💡"}
                </div>
                <div>
                  <p className="font-bold text-on-surface">Análise rápida</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {accuracy >= 70
                      ? "Bom ritmo. Você já consegue sustentar um desempenho forte neste conjunto. Continue revisando os pontos fracos para consolidar."
                      : accuracy >= 50
                        ? "Resultado razoável. Há espaço para melhorar — foque nos pontos fracos identificados abaixo antes da próxima rodada."
                        : "Este simulado revelou lacunas importantes. Revise o material dos temas abaixo antes de tentar novamente."}
                  </p>
                </div>
              </div>

              {weakestSubjects.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pontos para revisar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {weakestSubjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Histórico recente */}
            {history.length > 0 && (
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold text-on-surface">Histórico recente</p>
                <div className="mt-4 space-y-2">
                  {history.map((h) => {
                    const date = new Date(h.finishedAt);
                    const mins = Math.floor(h.durationSeconds / 60);
                    const secs = h.durationSeconds % 60;
                    return (
                      <div key={h.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-on-surface">
                            {h.correctAnswers}/{h.totalQuestions} acertos{h.subject ? ` · ${h.subject}` : ""}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {date.toLocaleDateString("pt-BR")} · {mins}m{secs.toString().padStart(2, "0")}s
                          </p>
                        </div>
                        <span className={cn(
                          "rounded-full px-3 py-1 text-xs font-black",
                          h.accuracy >= 70 ? "bg-emerald-100 text-emerald-700" : h.accuracy >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {h.accuracy}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setIsStarted(false);
                  setCurrentIndex(0);
                  setAnswers({});
                  setRemainingSeconds(0);
                }}
                className="rounded-xl border border-black/5 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-primary/20 hover:text-primary"
              >
                Configurar novo simulado
              </button>
              <button
                onClick={onBack}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:bg-primary-container"
              >
                Voltar
              </button>
            </div>
          </motion.section>
        ) : (
          <section className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
            {/* Header com timer */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Simulado em andamento
                </p>
                <h2 className="font-headline mt-2 text-2xl font-extrabold text-on-surface">
                  Questão {currentIndex + 1} de {configuredQuestions.length}
                </h2>
              </div>
              {(() => {
                const totalSecs = Number(durationMinutes) * 60;
                const pct = totalSecs > 0 ? remainingSeconds / totalSecs : 1;
                const isUrgent = pct < 0.2;
                return (
                  <div className={cn(
                    "rounded-2xl px-4 py-3 text-right transition-colors",
                    isUrgent ? "bg-rose-50" : "bg-primary/5"
                  )}>
                    <p className={cn("text-xs font-bold uppercase tracking-[0.18em]", isUrgent ? "text-rose-500/70" : "text-primary/70")}>
                      {isUrgent ? "⚠ Tempo" : "Timer"}
                    </p>
                    <p className={cn("font-headline mt-1 text-2xl font-black", isUrgent ? "text-rose-600" : "text-primary")}>
                      {formatTimer(remainingSeconds)}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Barras de progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span>Questões respondidas</span>
                <span>Tempo restante</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-all"
                    style={{ width: `${(Object.keys(answers).length / configuredQuestions.length) * 100}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      remainingSeconds / (Number(durationMinutes) * 60) < 0.2
                        ? "bg-rose-400"
                        : "bg-gradient-to-r from-amber-400 to-amber-500"
                    )}
                    style={{ width: `${(remainingSeconds / (Number(durationMinutes) * 60)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Grade de navegação livre */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Navegar por questão
              </p>
              <div className="flex flex-wrap gap-1.5">
                {configuredQuestions.map((q, idx) => {
                  const answered = !!answers[q.id];
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition",
                        isCurrent
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : answered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] text-gray-400">
                {Object.keys(answers).length} de {configuredQuestions.length} respondidas
              </p>
            </div>

            {currentQuestion ? (
              <>
                <div className="rounded-2xl bg-surface-container-low p-5">
                  <p className="text-sm font-bold text-primary">
                    {currentQuestion.subject || "Geral"} • {currentQuestion.sourceTitle || "Questão real"}
                  </p>
                  <h3 className="font-headline mt-3 text-xl font-bold text-on-surface">
                    {currentQuestion.prompt}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }))
                        }
                        className={cn(
                          "flex items-center rounded-xl border-2 p-4 text-left transition",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-gray-100 bg-gray-50 hover:border-primary/20 hover:bg-white"
                        )}
                      >
                        <div className={cn(
                          "mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold",
                          isSelected ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
                        )}>
                          {option.id}
                        </div>
                        <span className="font-medium text-gray-700">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev >= configuredQuestions.length - 1 ? configuredQuestions.length : prev + 1
                      )
                    }
                    className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container"
                  >
                    {currentIndex >= configuredQuestions.length - 1 ? "Finalizar" : "Próxima"}
                  </button>
                  {/* Botão de entrega antecipada */}
                  <button
                    onClick={() => setCurrentIndex(configuredQuestions.length)}
                    className="ml-auto rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
                  >
                    Entregar agora
                  </button>
                </div>
              </>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
};

const getCorrectAnswerId = (question: StudyQuestion) =>
  question.options.find((option) => option.correct)?.id;

// ---- FlashcardScreen ----

export const FlashcardScreen = ({
  flashcards,
  title,
  onExit,
}: {
  flashcards: import("./types").Flashcard[];
  title?: string;
  onExit: () => void;
}) => {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unknown, setUnknown] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const total = flashcards.length;
  const card = flashcards[index];
  const doneCount = known.size + unknown.size;

  const advance = (result: "known" | "unknown") => {
    if (!card) return;
    if (result === "known") setKnown((prev) => new Set(prev).add(card.id));
    else setUnknown((prev) => new Set(prev).add(card.id));
    setRevealed(false);
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setRevealed(false);
    setKnown(new Set());
    setUnknown(new Set());
    setFinished(false);
  };

  const restartWrong = () => {
    const wrongIds = Array.from(unknown);
    const wrongCards = flashcards.filter((f) => wrongIds.includes(f.id));
    if (wrongCards.length === 0) { restart(); return; }
    // remontar com cartões errados — forçamos re-render via state
    setIndex(0);
    setRevealed(false);
    setKnown(new Set());
    setUnknown(new Set());
    setFinished(false);
  };

  const progressPercent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-4 pt-24 sm:px-6">
        {finished ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-sm text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
                🎉
              </div>
              <h2 className="font-headline mt-4 text-2xl font-extrabold text-on-surface">
                Sessão concluída!
              </h2>
              <p className="mt-2 text-sm text-gray-500">{total} flashcards revisados</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Sabia</p>
                  <p className="font-headline mt-1 text-3xl font-black text-emerald-700">{known.size}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Revisar</p>
                  <p className="font-headline mt-1 text-3xl font-black text-rose-700">{unknown.size}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {unknown.size > 0 && (
                  <button
                    onClick={restartWrong}
                    className="flex-1 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
                  >
                    Revisar os {unknown.size} que não sabia
                  </button>
                )}
                <button
                  onClick={restart}
                  className="flex-1 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
                >
                  Recomeçar
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container"
                >
                  Sair
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Header da sessão */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Flashcards</p>
                <h1 className="font-headline text-xl font-extrabold text-on-surface line-clamp-1">
                  {title ?? "Revisão"}
                </h1>
              </div>
              <button
                onClick={onExit}
                className="rounded-xl border border-black/5 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition hover:text-primary"
              >
                Sair
              </button>
            </div>

            {/* Barra de progresso */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400">{doneCount} de {total}</span>
                <span className="text-primary">{progressPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container"
                />
              </div>
            </div>

            {/* Card */}
            {card && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="rounded-[2rem] border border-black/5 bg-white shadow-sm overflow-hidden"
                >
                  <div className="border-b border-black/5 bg-primary/3 px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                      {card.topic}
                    </span>
                  </div>
                  <div className="min-h-48 px-6 py-8">
                    <p className="font-headline text-xl font-bold text-on-surface leading-relaxed">
                      {card.question}
                    </p>
                  </div>

                  <AnimatePresence>
                    {revealed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-emerald-100 bg-emerald-50/60 px-6 py-6"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2">
                          Resposta
                        </p>
                        <p className="text-base font-medium text-gray-800 leading-relaxed">
                          {card.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="px-6 py-5 flex flex-col gap-3">
                    {!revealed ? (
                      <button
                        onClick={() => setRevealed(true)}
                        className="w-full rounded-2xl bg-gradient-to-br from-primary to-primary-container py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:scale-[1.01]"
                      >
                        Revelar resposta
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => advance("unknown")}
                          className="rounded-2xl border-2 border-rose-200 bg-rose-50 py-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                        >
                          Não sabia
                        </button>
                        <button
                          onClick={() => advance("known")}
                          className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 py-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Sabia!
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export const StudyScreen = ({
  questions,
  progress,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
  onRestartSession,
  onReviewWrongQuestions,
  onSaveForLater,
  onAddToPlan,
  onExit,
}: {
  questions: StudyQuestion[];
  progress: StudyProgress;
  onSelectOption: (questionId: string, optionId: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onRestartSession: () => void;
  onReviewWrongQuestions: (questionIds: string[]) => void;
  onSaveForLater: () => void;
  onAddToPlan: () => void;
  onExit: () => void;
}) => {
  const [mode, setMode] = useState<"lesson" | "question" | "flashcard">("question");
  const [isFlashcardRevealed, setIsFlashcardRevealed] = useState(false);
  const safeQuestions = questions.length > 0 ? questions : [];
  const currentQuestion = safeQuestions[progress.currentQuestionIndex];
  const selected = currentQuestion ? progress.answers[currentQuestion.id] ?? null : null;
  const isAnswered = Boolean(selected);
  const isComplete = progress.completed;
  const answeredCount = Object.keys(progress.answers).length;
  const correctCount = safeQuestions.filter(
    (question) => progress.answers[question.id] === getCorrectAnswerId(question)
  ).length;
  const errorCount = Math.max(answeredCount - correctCount, 0);
  const progressPercent =
    safeQuestions.length > 0 ? Math.round((answeredCount / safeQuestions.length) * 100) : 0;
  const isLastQuestion = progress.currentQuestionIndex === safeQuestions.length - 1;
  const estimatedTime = `${Math.max(5, safeQuestions.length * 2)} min`;
  const xpEarned = correctCount * 20 + answeredCount * 5;
  const wrongQuestionIds = safeQuestions
    .filter((question) => {
      const selectedAnswer = progress.answers[question.id];
      return selectedAnswer && selectedAnswer !== getCorrectAnswerId(question);
    })
    .map((question) => question.id);

  if (!currentQuestion) {
    return null;
  }

  const lessonTitle = progress.activeMaterialTitle || "Sessao guiada";
  const lessonExample = currentQuestion.options.find((option) => option.correct)?.label;

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <Header />
      <main className="mx-auto min-h-screen max-w-5xl px-4 pb-28 pt-24 sm:px-6 lg:px-8 md:pb-32">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:col-span-2">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-headline rounded-lg bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
                    Questao {progress.currentQuestionIndex + 1} de {safeQuestions.length}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    {progressPercent}% concluido
                  </span>
                </div>
                <span className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
                  {estimatedTime}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                  Sessao de estudo
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {progress.activeMaterialTitle
                    ? `Baseado em: ${progress.activeMaterialTitle}`
                    : "Sessao focada em revisao guiada e retencao ativa."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
              <button
                onClick={onExit}
                className="flex items-center justify-center gap-2 rounded-2xl border border-black/5 bg-white p-4 text-sm font-bold text-gray-600 shadow-sm transition hover:border-primary/20 hover:text-primary md:order-3"
              >
                <DoorOpen size={16} />
                Sair
              </button>
              <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Respondidas
                </p>
                <p className="font-headline mt-2 text-3xl font-black text-on-surface">
                  {answeredCount}
                </p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Acertos
                </p>
                <p className="font-headline mt-2 text-3xl font-black text-emerald-700">
                  {correctCount}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { id: "lesson", label: "Aula", icon: Layers3 },
              { id: "question", label: "Questao", icon: GraduationCap },
              { id: "flashcard", label: "Flashcard", icon: RefreshCcw },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = mode === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as "lesson" | "question" | "flashcard")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "border border-black/5 bg-white text-gray-600 hover:border-primary/20 hover:text-primary"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {mode === "lesson" && (
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Aula</p>
              <h1 className="font-headline mt-3 text-xl font-bold leading-tight md:text-2xl">
                {lessonTitle}
              </h1>
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl bg-surface-container-low p-4 lg:col-span-2">
                  <p className="text-sm font-bold text-on-surface">Explicacao curta</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {currentQuestion.explanation}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/5 p-4">
                  <p className="text-sm font-bold text-primary">Exemplo</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {lessonExample
                      ? `Exemplo-chave: ${lessonExample}`
                      : "Use a proxima questao como exemplo pratico deste bloco."}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setMode("question")}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container"
                >
                  Ir para questao
                </button>
                <button
                  onClick={() => setMode("flashcard")}
                  className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
                >
                  Ver flashcard
                </button>
              </div>
            </div>
          )}

          {mode === "flashcard" && (
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Flashcard
              </p>
              <button
                onClick={() => setIsFlashcardRevealed((prev) => !prev)}
                className="mt-4 flex min-h-[240px] w-full flex-col justify-between rounded-[2rem] bg-gradient-to-br from-primary to-primary-container p-6 text-left text-white shadow-xl shadow-primary/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
                    {isFlashcardRevealed ? "Verso" : "Frente"}
                  </span>
                  <RefreshCcw size={18} />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-extrabold leading-tight">
                    {isFlashcardRevealed ? currentQuestion.explanation : currentQuestion.prompt}
                  </h2>
                </div>
                <p className="text-sm font-medium text-white/80">
                  Toque para {isFlashcardRevealed ? "voltar para a pergunta" : "revelar a resposta"}.
                </p>
              </button>
            </div>
          )}

          {mode === "question" && (
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-6">
                <h1 className="font-headline text-xl font-bold leading-tight md:text-2xl">
                  {currentQuestion.prompt}
                </h1>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => {
                  const correctAnswerId = getCorrectAnswerId(currentQuestion);
                  const isSelected = selected === option.id;
                  const isCorrect = option.id === correctAnswerId;

                  return (
                    <button
                      key={option.id}
                      disabled={isComplete}
                      onClick={() => onSelectOption(currentQuestion.id, option.id)}
                      className={cn(
                        "group flex items-center rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98]",
                        isSelected
                          ? isComplete
                            ? isCorrect
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-rose-500 bg-rose-50"
                            : "border-primary bg-primary/5"
                          : isComplete && isCorrect
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-100 bg-gray-50 hover:border-primary/30 hover:bg-white"
                      )}
                    >
                      <div className="font-headline mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 font-bold text-gray-700">
                        {option.id}
                      </div>
                      <span className="flex-grow font-medium text-gray-700">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isComplete ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
              <div className="flex flex-grow items-center gap-4 rounded-2xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-emerald-600 shadow-lg">
                  <Target size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-headline text-sm font-bold">Foco da sessão</p>
                  <p className="text-xs text-gray-500">
                    Responda, confira o feedback e avance para consolidar a revisão.
                  </p>
                </div>
              </div>
              <button
                onClick={onSubmitAnswer}
                disabled={!isAnswered || mode !== "question"}
                className="font-headline w-full rounded-2xl bg-gradient-to-br from-primary to-primary-container px-8 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 md:w-56"
              >
                Confirmar resposta
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <Lightbulb size={24} className="text-emerald-600" />
                <h3 className="font-headline font-bold text-emerald-900">
                  {selected === getCorrectAnswerId(currentQuestion)
                    ? "Resposta correta"
                    : "Hora da revisao"}
                </h3>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-emerald-800">
                {currentQuestion.explanation}
              </p>
              <p className="mb-6 text-sm leading-relaxed text-emerald-800">
                Proximo foco:{" "}
                <span className="font-semibold text-primary underline decoration-2 underline-offset-4">
                  {currentQuestion.recommendation}
                </span>
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onSaveForLater}
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <Bookmark size={14} /> Salvar para depois
                </button>
                <button
                  onClick={onAddToPlan}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  Adicionar ao Plano
                  <ArrowRight size={14} />
                </button>
                {!isLastQuestion ? (
                  <button
                    onClick={onNextQuestion}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-container"
                  >
                    Proxima questao
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={onRestartSession}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-container"
                  >
                    Reiniciar sessao
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {answeredCount === safeQuestions.length && safeQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <CheckCircle2 size={22} className="fill-emerald-500 text-white" />
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Resumo da sessao
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Voce concluiu {answeredCount} questoes e acertou {correctCount}. Continue revisando
                os pontos de menor seguranca e reinicie quando quiser praticar de novo.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                    XP ganho
                  </p>
                  <p className="font-headline mt-2 text-3xl font-black text-emerald-700">
                    {xpEarned}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Acertos
                  </p>
                  <p className="font-headline mt-2 text-3xl font-black text-on-surface">
                    {correctCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    Erros
                  </p>
                  <p className="font-headline mt-2 text-3xl font-black text-rose-600">
                    {errorCount}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => onReviewWrongQuestions(wrongQuestionIds)}
                  className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-primary/20 hover:text-primary"
                >
                  Revisar erros
                </button>
                <button
                  onClick={onAddToPlan}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-container"
                >
                  Proxima missao
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};
