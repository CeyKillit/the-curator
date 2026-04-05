"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/app/components/curator/chrome";

// ---- tipos locais ----

type Option = { id: string; label: string };

type Question = {
  id: string;
  questionNumber: string;
  statement: string;
  options: Option[];
  correctAnswer?: string;
  explanation?: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
};

type DocMeta = {
  id: string;
  extractedTitle: string;
  extractedSubject: string;
  questionsCount: number;
  fileUrl: string;
};

// ---- helpers ----

const OPTION_IDS = ["A", "B", "C", "D", "E"];

const emptyDraft = (): Omit<Question, "id" | "difficulty"> => ({
  questionNumber: "",
  statement: "",
  options: OPTION_IDS.slice(0, 5).map((id) => ({ id, label: "" })),
  correctAnswer: "",
  explanation: "",
  topic: "",
});

// ---- modal de confirmação de exclusão ----

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Trash2 size={22} />
        </div>
        <h3 className="font-headline text-base font-extrabold text-on-surface">
          Excluir questão
        </h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 active:scale-95"
          >
            Excluir
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:border-black/20 active:scale-95"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---- componente de edição de uma questão ----

function QuestionEditor({
  question,
  onSave,
  onCancel,
}: {
  question: Omit<Question, "id" | "difficulty">;
  onSave: (data: Omit<Question, "id" | "difficulty">) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(question);

  const setOption = (idx: number, label: string) => {
    setDraft((prev) => {
      const opts = [...prev.options];
      opts[idx] = { ...opts[idx], label };
      return { ...prev, options: opts };
    });
  };

  const validOptions = draft.options.filter((o) => o.label.trim().length > 0);
  const canSave = draft.statement.trim().length >= 5 && validOptions.length >= 2;

  return (
    <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/3 p-5">
      {/* Row 1: Número | Tópico | Gabarito */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Número
          </label>
          <input
            value={draft.questionNumber}
            onChange={(e) => setDraft((p) => ({ ...p, questionNumber: e.target.value }))}
            placeholder="ex: 1"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Tópico
          </label>
          <input
            value={draft.topic}
            onChange={(e) => setDraft((p) => ({ ...p, topic: e.target.value }))}
            placeholder="ex: Gramática..."
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Gabarito
          </label>
          <div
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-bold",
              draft.correctAnswer
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-black/10 bg-gray-50 text-gray-400"
            )}
          >
            {draft.correctAnswer ? `Alt. ${draft.correctAnswer}` : "Nenhum"}
          </div>
        </div>
      </div>

      {/* Enunciado */}
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Enunciado *
        </label>
        <textarea
          value={draft.statement}
          onChange={(e) => setDraft((p) => ({ ...p, statement: e.target.value }))}
          rows={3}
          placeholder="Digite o enunciado da questão..."
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Alternativas */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Alternativas (mínimo 2) *
        </label>
        {draft.options.map((opt, idx) => (
          <div key={opt.id} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                draft.correctAnswer === opt.id
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {opt.id}
            </span>
            <input
              value={opt.label}
              onChange={(e) => setOption(idx, e.target.value)}
              placeholder={`Alternativa ${opt.id}`}
              className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() =>
                setDraft((p) => ({
                  ...p,
                  correctAnswer: p.correctAnswer === opt.id ? "" : opt.id,
                }))
              }
              title="Marcar como gabarito"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs transition",
                draft.correctAnswer === opt.id
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
              )}
            >
              <Check size={14} />
            </button>
          </div>
        ))}
        <p className="text-[10px] text-gray-400">
          Clique no ✓ ao lado da alternativa para marcar como gabarito correto.
        </p>
      </div>

      {/* Explicação */}
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Explicação (opcional)
        </label>
        <textarea
          value={draft.explanation ?? ""}
          onChange={(e) => setDraft((p) => ({ ...p, explanation: e.target.value }))}
          rows={2}
          placeholder="Explique o raciocínio da resposta correta..."
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          onClick={() => onSave({ ...draft, options: draft.options.filter((o) => o.label.trim()) })}
          disabled={!canSave}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
        >
          <Save size={15} /> Salvar
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:border-primary/20"
        >
          <X size={15} /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ---- página principal ----

export default function QuestoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: docId } = use(params);
  const router = useRouter();

  const [doc, setDoc] = useState<DocMeta | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // nova questão
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}`, { cache: "no-store" });
      const data = (await res.json()) as {
        document?: {
          extractedTitle: string;
          extractedSubject: string;
          questionsCount: number;
          fileUrl: string;
          questions: Question[];
        };
        error?: string;
      };
      if (!res.ok || !data.document) throw new Error(data.error ?? "Documento não encontrado.");
      setDoc({
        id: docId,
        extractedTitle: data.document.extractedTitle,
        extractedSubject: data.document.extractedSubject,
        questionsCount: data.document.questionsCount,
        fileUrl: data.document.fileUrl,
      });
      setQuestions(data.document.questions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar questões.");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => { void load(); }, [load]);

  const handleSaveEdit = async (q: Question, data: Omit<Question, "id" | "difficulty">) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${docId}/questions/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: data.statement,
          options: data.options,
          correctAnswer: data.correctAnswer || null,
          explanation: data.explanation || null,
          topic: data.topic,
        }),
      });
      if (!res.ok) throw new Error("Falha ao salvar.");
      setEditingId(null);
      await load();
    } catch {
      alert("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const qid = pendingDeleteId;
    setPendingDeleteId(null);
    setDeletingId(qid);
    try {
      await fetch(`/api/documents/${docId}/questions/${qid}`, { method: "DELETE" });
      setQuestions((prev) => prev.filter((q) => q.id !== qid));
      if (editingId === qid) setEditingId(null);
      if (expandedId === qid) setExpandedId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNew = async (data: Omit<Question, "id" | "difficulty">) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionNumber: data.questionNumber || String(questions.length + 1),
          statement: data.statement,
          options: data.options,
          correctAnswer: data.correctAnswer || undefined,
          explanation: data.explanation || undefined,
          topic: data.topic || doc?.extractedSubject,
        }),
      });
      if (!res.ok) throw new Error("Falha ao adicionar.");
      setShowAdd(false);
      await load();
    } catch {
      alert("Não foi possível adicionar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const correctLabel = (q: Question) => {
    if (!q.correctAnswer) return null;
    return q.options.find((o) => o.id === q.correctAnswer);
  };

  // ---- render ----

  const questionsList = (
    <>
      {loading && (
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">
          Carregando questões...
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Adicionar nova questão — topo */}
          <div className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8 text-primary">
                <Plus size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface">Adicionar questão manualmente</p>
                <p className="text-xs text-gray-400">
                  Corrija extrações ou adicione o que o parser não detectou
                </p>
              </div>
              {showAdd ? <ChevronUp size={16} className="ml-auto shrink-0 text-gray-400" /> : <ChevronDown size={16} className="ml-auto shrink-0 text-gray-400" />}
            </button>

            <AnimatePresence>
              {showAdd && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-black/5 p-4"
                >
                  <QuestionEditor
                    question={{ ...emptyDraft(), topic: doc?.extractedSubject ?? "" }}
                    onSave={(data) => { if (!saving) void handleAddNew(data); }}
                    onCancel={() => setShowAdd(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {questions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
              <p className="font-headline text-lg font-bold text-on-surface">
                Nenhuma questão extraída
              </p>
              <p className="mt-2 text-sm text-gray-500">
                O parser não encontrou questões neste PDF. Adicione manualmente acima.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isExpanded = expandedId === q.id;
              const isEditing = editingId === q.id;
              const correct = correctLabel(q);

              return (
                <motion.div
                  key={q.id}
                  layout
                  className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden"
                >
                  {/* Linha de resumo */}
                  <div className="flex items-start gap-3 p-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-xs font-black text-primary">
                      {q.questionNumber || idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-sm font-medium text-on-surface leading-snug",
                        isExpanded ? "" : "line-clamp-2"
                      )}>
                        {q.statement}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {q.topic}
                        </span>
                        {correct ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Gabarito: {correct.id}
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                            Sem gabarito
                          </span>
                        )}
                        <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400">
                          {q.options.length} alternativas
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => { setEditingId(q.id); setExpandedId(q.id); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-primary/5 hover:text-primary"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(q.id)}
                        disabled={deletingId === q.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Detalhe expandido */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-black/5"
                      >
                        {isEditing ? (
                          <div className="p-4">
                            <QuestionEditor
                              question={{
                                questionNumber: q.questionNumber,
                                statement: q.statement,
                                options: OPTION_IDS.map((id) => {
                                  const existing = q.options.find((o) => o.id === id);
                                  return existing ?? { id, label: "" };
                                }),
                                correctAnswer: q.correctAnswer ?? "",
                                explanation: q.explanation ?? "",
                                topic: q.topic,
                              }}
                              onSave={(data) => void handleSaveEdit(q, data)}
                              onCancel={() => setEditingId(null)}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2 p-4">
                            {q.options.map((opt) => (
                              <div
                                key={opt.id}
                                className={cn(
                                  "flex items-start gap-3 rounded-xl px-4 py-3",
                                  q.correctAnswer === opt.id
                                    ? "bg-emerald-50 ring-1 ring-emerald-200"
                                    : "bg-gray-50"
                                )}
                              >
                                <span className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                                  q.correctAnswer === opt.id
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white text-gray-500 ring-1 ring-black/10"
                                )}>
                                  {opt.id}
                                </span>
                                <p className="flex-1 text-sm text-gray-700">{opt.label}</p>
                                {q.correctAnswer === opt.id && (
                                  <span className="text-xs font-bold text-emerald-600">✓</span>
                                )}
                              </div>
                            ))}
                            {q.explanation && (
                              <div className="rounded-xl bg-primary/5 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-primary/60 mb-1">
                                  Explicação
                                </p>
                                <p className="text-sm text-gray-600">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen pb-28 md:pb-32">
      <AnimatePresence>
        {pendingDeleteId && (
          <ConfirmModal
            message="Esta ação é irreversível. A questão será removida da trilha de estudos."
            onConfirm={() => void confirmDelete()}
            onCancel={() => setPendingDeleteId(null)}
          />
        )}
      </AnimatePresence>
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 pb-4 pt-24 sm:px-6 lg:px-8">

        {/* Cabeçalho */}
        <div className="mb-6 flex items-start gap-4">
          <button
            onClick={() => router.back()}
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-gray-500 transition hover:border-primary/20 hover:text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Gestão de questões
            </p>
            <h1 className="font-headline mt-1 text-2xl font-extrabold text-on-surface line-clamp-1">
              {doc?.extractedTitle ?? "Carregando..."}
            </h1>
            {doc && (
              <p className="mt-1 text-sm text-gray-500">
                {doc.extractedSubject} · {questions.length} questão{questions.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Split: PDF esquerda | Questões direita */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ---- Coluna esquerda: PDF viewer ---- */}
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-slate-50 shadow-sm lg:sticky lg:top-24">
            {doc?.fileUrl ? (
              <iframe
                src={doc.fileUrl}
                title={doc.extractedTitle}
                className="h-[calc(100vh-8rem)] w-full"
                style={{ minHeight: 480 }}
              />
            ) : (
              <div className="flex h-[480px] items-center justify-center text-sm text-gray-400">
                {loading ? "Carregando PDF..." : "PDF não disponível"}
              </div>
            )}
          </div>

          {/* ---- Coluna direita: questões ---- */}
          <div className="space-y-3">
            {questionsList}
          </div>
        </div>
      </main>
    </div>
  );
}
