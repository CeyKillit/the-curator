import { NextResponse } from "next/server";
import { deleteQuestion, updateQuestion } from "@/lib/server/documents-service";

type Params = { params: Promise<{ id: string; qid: string }> };

// PATCH /api/documents/[id]/questions/[qid] — edita campos da questão
export async function PATCH(request: Request, { params }: Params) {
  const { id, qid } = await params;
  const body = (await request.json().catch(() => null)) as {
    statement?: string;
    options?: Array<{ id: string; label: string }>;
    correctAnswer?: string | null;
    explanation?: string | null;
    topic?: string;
  } | null;

  if (!body) return NextResponse.json({ error: "Payload inválido." }, { status: 400 });

  const document = await updateQuestion(id, qid, body);
  if (!document) return NextResponse.json({ error: "Questão não encontrada." }, { status: 404 });

  return NextResponse.json({ document });
}

// DELETE /api/documents/[id]/questions/[qid] — exclui questão
export async function DELETE(_request: Request, { params }: Params) {
  const { id, qid } = await params;
  const ok = await deleteQuestion(id, qid);
  if (!ok) return NextResponse.json({ error: "Questão não encontrada." }, { status: 404 });
  return NextResponse.json({ success: true });
}
