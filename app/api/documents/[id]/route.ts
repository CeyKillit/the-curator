import { NextResponse } from "next/server";
import {
  addManualQuestionToDocument,
  deleteDocumentCascade,
  getDocumentDetails,
  queueDocumentProcessing,
} from "@/lib/server/documents-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteDocumentCascade(id);

  if (!deleted) {
    return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = await getDocumentDetails(id);

  if (!document) {
    return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = await queueDocumentProcessing(id);

  if (!document) {
    return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | {
        questionNumber?: string;
        statement?: string;
        options?: Array<{ id: string; label: string }>;
        correctAnswer?: string;
        explanation?: string;
        topic?: string;
      }
    | null;

  if (!body?.statement || !Array.isArray(body.options)) {
    return NextResponse.json({ error: "Dados invalidos para criar questao manual." }, { status: 400 });
  }

  try {
    const document = await addManualQuestionToDocument(id, {
      questionNumber: body.questionNumber,
      statement: body.statement,
      options: body.options,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation,
      topic: body.topic,
    });

    if (!document) {
      return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Falha ao criar questao manual.",
      },
      { status: 400 }
    );
  }
}
