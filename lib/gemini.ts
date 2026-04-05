type AIRequest = {
  prompt: string;
  systemInstruction?: string;
};

type AIResponse = {
  text?: string;
  error?: string;
};

const getMockResponse = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("crase") || lowerPrompt.includes("portugu")) {
    return "Crase é a fusão da preposição 'a' com o artigo 'a'. Uma boa revisão prática é comparar: quem vai, vai a algum lugar; se o termo seguinte aceitar artigo feminino, pode haver crase.";
  }

  if (lowerPrompt.includes("matem") || lowerPrompt.includes("porcent")) {
    return "Para porcentagem, transforme a taxa em fração de 100 e depois aplique sobre o valor-base. Se quiser, posso te explicar com um exemplo passo a passo.";
  }

  if (lowerPrompt.includes("neuro") || lowerPrompt.includes("gaba")) {
    return "O GABA é o principal neurotransmissor inibitório do sistema nervoso central. Ele reduz a excitabilidade neuronal e costuma aparecer em questões sobre equilíbrio entre excitação e inibição sináptica.";
  }

  if (lowerPrompt.includes("plano") || lowerPrompt.includes("estudo")) {
    return "Minha sugestão é dividir o estudo em blocos curtos: teoria, prática e revisão. Isso ajuda a manter constância e melhora retenção ao longo da semana.";
  }

  return "Posso te ajudar com revisão, resumo, plano de estudos e resolução guiada. Me diga o tema ou a dúvida e eu sigo com uma resposta objetiva.";
};

export const getAIResponse = async (prompt: string, systemInstruction?: string) => {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
      } satisfies AIRequest),
    });

    const data = (await response.json()) as AIResponse;

    if (!response.ok) {
      console.warn("AI fallback activated:", data.error);
      return getMockResponse(prompt);
    }

    return data.text || getMockResponse(prompt);
  } catch (error) {
    console.error("AI request error:", error);
    return getMockResponse(prompt);
  }
};
