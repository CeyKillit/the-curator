import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// GET /api/ai — informa se a chave está configurada
export async function GET() {
  return NextResponse.json({ hasKey: !!process.env.GEMINI_API_KEY });
}

const DEFAULT_SYSTEM_INSTRUCTION =
  "You are The Curator, a premium academic assistant. Be concise, professional, and encouraging.";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "A variável GEMINI_API_KEY não está configurada." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      prompt?: string;
      systemInstruction?: string;
    };

    if (!body.prompt?.trim()) {
      return NextResponse.json(
        { error: "Envie um prompt válido para a IA." },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: body.prompt,
      config: {
        systemInstruction: body.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      },
    });

    return NextResponse.json({
      text: response.text || "Desculpe, não consegui gerar uma resposta agora.",
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

     const message =
      error instanceof Error ? error.message : "Falha ao gerar resposta com a IA.";

    if (message.includes("API_KEY_INVALID") || message.includes("API key not valid")) {
      return NextResponse.json(
        {
          error:
            "A GEMINI_API_KEY configurada é inválida. Gere uma nova chave no Google AI Studio e atualize o arquivo .env.local.",
        },
        { status: 401 }
      );
    }

    if (message.includes("models/") || message.includes("not found")) {
      return NextResponse.json(
        {
          error:
            "O modelo configurado para a Gemini não está disponível para esta chave ou região.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Falha ao gerar resposta com a IA. Verifique o log do servidor." },
      { status: 500 }
    );
  }
}
