import { NextResponse } from "next/server";
import { recordStudyAnswer } from "@/lib/server/study-service";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      questionId?: string;
      selectedAnswer?: string;
    };

    if (!payload.questionId || !payload.selectedAnswer) {
      return NextResponse.json(
        { error: "questionId e selectedAnswer sao obrigatorios." },
        { status: 400 }
      );
    }

    const result = await recordStudyAnswer({
      questionId: payload.questionId,
      selectedAnswer: payload.selectedAnswer,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Falha ao registrar resposta da questao.",
      },
      { status: 400 }
    );
  }
}
