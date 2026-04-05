import type { StudyProgress, StudyQuestion } from "./types";

export const studyQuestions: StudyQuestion[] = [
  {
    id: "q1",
    prompt:
      "Qual neurotransmissor é o principal responsável pelos sinais inibitórios no sistema nervoso central, reduzindo efetivamente a excitabilidade neuronal?",
    explanation:
      "O GABA é o principal neurotransmissor inibitório do SNC. Ele diminui a probabilidade de disparo neuronal e costuma aparecer em questões sobre equilíbrio sináptico.",
    recommendation: "Revise o papel do GABA e compare com o glutamato em mapas mentais curtos.",
    options: [
      { id: "A", label: "Ácido Gama-Aminobutírico (GABA)", correct: true },
      { id: "B", label: "Glutamato" },
      { id: "C", label: "Acetilcolina" },
      { id: "D", label: "Norepinefrina" },
    ],
  },
  {
    id: "q2",
    prompt:
      "Em vias excitatórias, qual neurotransmissor está mais associado à transmissão sináptica rápida e ao aumento da atividade neuronal?",
    explanation:
      "O glutamato é o principal neurotransmissor excitatório do sistema nervoso central e participa da maioria das sinapses excitatórias rápidas.",
    recommendation: "Faça uma tabela comparando neurotransmissores excitatórios e inibitórios.",
    options: [
      { id: "A", label: "GABA" },
      { id: "B", label: "Glutamato", correct: true },
      { id: "C", label: "Serotonina" },
      { id: "D", label: "Dopamina" },
    ],
  },
  {
    id: "q3",
    prompt:
      "Quando um estudante revisa o mesmo conteúdo em intervalos crescentes ao longo da semana, qual estratégia de aprendizagem ele está aplicando?",
    explanation:
      "A revisão espaçada distribui os contatos com o conteúdo ao longo do tempo, fortalecendo retenção e recuperação da informação.",
    recommendation: "Inclua no plano blocos curtos de revisão 24h, 72h e 7 dias após o estudo inicial.",
    options: [
      { id: "A", label: "Leitura dinâmica" },
      { id: "B", label: "Revisão espaçada", correct: true },
      { id: "C", label: "Subscrição passiva" },
      { id: "D", label: "Mapeamento linear" },
    ],
  },
];

export const studySession = {
  title: "Sessão Guiada de Estudo",
  estimatedTime: "08:00",
};

export const initialStudyProgress: StudyProgress = {
  currentQuestionIndex: 0,
  answers: {},
  completed: false,
  activeMaterialTitle: undefined,
};
