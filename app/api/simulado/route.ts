import { NextResponse } from "next/server";
import { getSimuladoHistory, saveSimuladoAttempt } from "@/lib/server/study-service";

export async function GET() {
  try {
    const attempts = await getSimuladoHistory();
    return NextResponse.json({ attempts });
  } catch {
    return NextResponse.json({ error: "Falha ao carregar histórico." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      totalQuestions: number;
      correctAnswers: number;
      wrongAnswers: number;
      durationSeconds: number;
      subject?: string | null;
    } | null;

    if (!body || typeof body.totalQuestions !== "number") {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }

    const accuracy =
      body.totalQuestions > 0
        ? Math.round((body.correctAnswers / body.totalQuestions) * 100)
        : 0;

    const id = await saveSimuladoAttempt({
      totalQuestions: body.totalQuestions,
      correctAnswers: body.correctAnswers,
      wrongAnswers: body.wrongAnswers,
      accuracy,
      durationSeconds: body.durationSeconds,
      subject: body.subject ?? null,
    });

    return NextResponse.json({ attempt: { id } });
  } catch {
    return NextResponse.json({ error: "Falha ao salvar tentativa." }, { status: 500 });
  }
}
