import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type {
  ExtractedQuestionRecord,
  FlashcardRecord,
  ProcessedDocumentPayload,
  TrailNodeRecord,
} from "./types";

const require = createRequire(import.meta.url);

const createId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeText = (text: string) =>
  text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u0000/g, "")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const sanitizeFileTitle = (fileName: string) =>
  fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

const extractTextFallback = (fileBuffer: Buffer) => {
  const raw = fileBuffer.toString("latin1");

  const printableChunks = raw.match(/[A-Za-zÀ-ÿ0-9()[\]{}.,;:!?/%+\-_=@"' ]{40,}/g);

  return normalizeText(
    (printableChunks ?? [])
      .filter((chunk) => !artifactPatterns.some((pattern) => pattern.test(chunk)))
      .slice(0, 400)
      .join("\n")
  );
};

const stripXmlAndPdfMetadata = (text: string) =>
  normalizeText(
    text
      .replace(/<\?xml[\s\S]*?\?>/gi, " ")
      .replace(/<\?xpacket[\s\S]*?\?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\b(?:rdf|xmp|pdf|dc|x):[A-Za-z0-9_-]+\b/gi, " ")
      .replace(/\bxmlns(?::[A-Za-z0-9_-]+)?="[^"]*"/gi, " ")
      .replace(/https?:\/\/\S+/gi, " ")
  );

const artifactPatterns = [
  /^\/[A-Za-z]/,
  /\/Linearized/i,
  /\/FlateDecode/i,
  /\/Filter/i,
  /\/Length\d*/i,
  /\/Root/i,
  /\/Type\/XRef/i,
  /\bobj\b/i,
  /\bendobj\b/i,
  /\bx:xmpmeta\b/i,
  /\brdf:RDF\b/i,
  /\brdf:Description\b/i,
  /\bxmlns:/i,
  /\buuid:/i,
  /http:\/\/ns\.adobe\.com/i,
  /http:\/\/purl\.org/i,
  /Adobe PDF Library/i,
  /Acrobat PDFMaker/i,
  /\bpdfx?:/i,
  /\bxmp(mm|tpg|gimg|g)\b/i,
  /<\?xpacket/i,
  /<\/?(?:rdf|x|dc|pdfx?|xmp|stRef|stEvt)[:>]/i,
  /\b[A-F0-9]{20,}\b/,
];

const hasHighGarbageRatio = (value: string) => {
  const symbolCount = (value.match(/[^A-Za-zÀ-ÿ0-9\s.,;:!?()[\]'"%-]/g) ?? []).length;
  return symbolCount / Math.max(value.length, 1) > 0.18;
};

const hasMojibakePattern = (value: string) =>
  /(Ãƒ.|Ã‚.|Ã.|Ã‘.|Ã’.|Ã“.|Ã”.|Ã•.|Ã–.|Ã˜.|Ã™.|Ãš.|Ã›.|Ãœ.|Ã.|Ãž.|ÃŸ.)/.test(value) ||
  /[^\s]{8,}Ãƒ[^\s]{4,}/.test(value);

const hasReadableWordDensity = (value: string) => {
  const words = value.match(/[A-Za-zÀ-ÿ]{3,}/g) ?? [];
  return words.length >= Math.max(6, Math.floor(value.length / 35));
};

const QUESTION_START_PATTERN =
  /^(?:quest[aã]o\s*)?\d{1,3}(?:\s*$|[).:-]\s*|\s+-\s*)/i;
const OPTION_START_PATTERN = /^(?:\(?([A-E])\)?[).:-]?)\s+/;

const looksLikeQuestionStatement = (line: string) => QUESTION_START_PATTERN.test(line.trim());

const looksLikeOptionStart = (line: string) => OPTION_START_PATTERN.test(line.trim());

const isStandaloneQuestionNumber = (line: string) => /^\d{1,3}$/.test(line.trim());

const isLikelyPdfArtifact = (line: string) => {
  const normalized = line.trim();

  if (isStandaloneQuestionNumber(normalized)) return false;
  if (normalized.length < 3) return true;
  if (/^[A-F0-9]{20,}$/i.test(normalized)) return true;
  if (hasMojibakePattern(normalized)) return true;
  if (!hasReadableWordDensity(normalized) && normalized.length > 60) return true;

  return artifactPatterns.some((pattern) => pattern.test(normalized)) || hasHighGarbageRatio(normalized);
};

const getMeaningfulLines = (text: string) =>
  stripXmlAndPdfMetadata(text)
    .split("\n")
    .map((line) => normalizeText(line))
    .filter((line) => line.length > 0)
    .filter((line) => !isLikelyPdfArtifact(line));

const getMeaningfulParagraphs = (text: string) =>
  stripXmlAndPdfMetadata(text)
    .split(/\n\s*\n/)
    .map((chunk) => normalizeText(chunk.replace(/\n/g, " ")))
    .filter((chunk) => chunk.length > 40)
    .filter((chunk) => !isLikelyPdfArtifact(chunk));

const normalizeQuestionLayout = (text: string) =>
  normalizeText(
    text
      .replace(/([.!?"”)])(\(?[A-E]\)?[).:-]?\s+)/g, "$1\n$2")
      .replace(
        /((?:quest[aã]o\s*)?\d{1,3}(?:[).:-]|\s+-)?\s*.+?)(\s+\(?[A-E]\)?[).:-]?\s+)/gi,
        (_, statement, optionStart) => `${statement}\n${optionStart.trim()}`
      )
      .replace(/\s+(\(?[A-E]\)?[).:-]?\s+)/g, "\n$1")
      .replace(/([.!?"”)])\s*(\d{1,3}\s*\n)/g, "$1\n$2")
      .replace(/\s+(gabarito|resposta(?:\s+correta)?)(\s*[:=-]?\s*[A-E])/gi, "\n$1$2")
  );

const mergeWrappedQuestionLines = (lines: string[]) =>
  lines.reduce<string[]>((accumulator, line) => {
    const previous = accumulator[accumulator.length - 1];
    const trimmed = line.trim();

    if (
      previous &&
      !looksLikeQuestionStatement(trimmed) &&
      !looksLikeOptionStart(trimmed) &&
      !/^(?:gabarito|resposta(?:\s+correta)?)/i.test(trimmed) &&
      !isStandaloneQuestionNumber(trimmed) &&
      previous.length < 260
    ) {
      accumulator[accumulator.length - 1] = normalizeText(`${previous} ${trimmed}`);
      return accumulator;
    }

    accumulator.push(trimmed);
    return accumulator;
  }, []);

const mergeQuestionNumbersWithStatements = (lines: string[]) => {
  const merged: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index]?.trim() ?? "";
    const next = lines[index + 1]?.trim() ?? "";

    if (/^\d{1,3}$/.test(current) && next && !looksLikeOptionStart(next)) {
      merged.push(`${current}. ${next}`);
      index += 1;
      continue;
    }

    merged.push(current);
  }

  return merged;
};

const trimToQuestionContent = (text: string) => {
  const firstQuestionMatch = text.match(
    /(?:^|\n)(?:quest[aã]o\s*)?1(?:\s*$|[).:-]\s*|\s+-\s*|\s*\n)([\s\S]{0,2000}?)\n\s*\(?A\)?[).:-]?\s+/m
  );

  if (!firstQuestionMatch || firstQuestionMatch.index === undefined) {
    return text;
  }

  return text.slice(firstQuestionMatch.index).trim();
};

const findFirstOptionIndex = (text: string) =>
  text.search(/(?:^|\n)\s*\(?[A-E]\)?[).:-]?\s+/);

const extractAnswerKeyMap = (text: string) => {
  const answerMap = new Map<string, string>();
  const answerSectionMatch = text.match(
    /(?:gabarito|respostas?)(?:\s+oficial(?:is)?)?\s*[:\-]?\s*([\s\S]{0,2500})/i
  );

  if (!answerSectionMatch) {
    return answerMap;
  }

  const section = answerSectionMatch[1]
    .split(/\n\s*\n/)[0]
    .replace(/[|,;]/g, " ");

  for (const match of section.matchAll(/(\d{1,3})\s*[-.:]?\s*([A-E])/gi)) {
    answerMap.set(match[1], match[2].toUpperCase());
  }

  return answerMap;
};

const splitQuestionBlocks = (text: string) => {
  const meaningfulLines = getMeaningfulLines(text);
  const mergedNumbers = mergeQuestionNumbersWithStatements(meaningfulLines);
  const mergedLines = mergeWrappedQuestionLines(mergedNumbers);
  const blocks: string[] = [];
  let currentBlock: string[] = [];

  for (const line of mergedLines) {
    if (looksLikeQuestionStatement(line) && currentBlock.length > 0) {
      blocks.push(currentBlock.join("\n"));
      currentBlock = [line];
      continue;
    }

    currentBlock.push(line);
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join("\n"));
  }

  return blocks
    .map((block) => block.trim())
    .filter((block) => /(?:^|\n)\s*\(?[A-E]\)?[).:-]?\s+/m.test(block))
    .filter((block) => /^(?:quest[aã]o\s*)?\d{1,3}(?:\s*$|[).:-]|\s+-)/im.test(block));
};

const extractQuestionNumber = (statement: string, fallbackIndex: number) =>
  statement.match(/^(?:quest[aã]o\s*)?(\d{1,3})/i)?.[1] ?? String(fallbackIndex + 1);

const extractOptions = (block: string) => {
  const optionMatches = [
    ...block.matchAll(
      /(?:^|\n)\s*\(?([A-E])\)?[).:-]?\s+([\s\S]*?)(?=(?:\n\s*\(?[A-E]\)?[).:-]?\s+)|(?:\n\s*(?:quest[aã]o\s*)?\d{1,3}(?:\s*$|[).:-]\s*|\s+-\s*))|(?:\n\s*(?:gabarito|resposta)\s*[:=-]?\s*[A-E])|$)/g
    ),
  ];

  return optionMatches
    .map((match) => ({
      id: match[1].toUpperCase(),
      label: normalizeText(match[2].replace(/\n/g, " ")),
    }))
    .filter((option) => option.label.length > 2 && !isLikelyPdfArtifact(option.label));
};

const extractQuestionsFromParagraphs = (
  text: string,
  pdfId: string,
  topic: string
): ExtractedQuestionRecord[] => {
  const normalized = normalizeQuestionLayout(
    getMeaningfulParagraphs(trimToQuestionContent(text))
      .join("\n\n")
      .replace(/\n/g, " ")
  );
  const answerKeyMap = extractAnswerKeyMap(normalized);
  const segments = normalized
    .split(/(?=(?:quest[aã]o\s*)?\d{1,3}(?:\s*$|[).:-]\s*|\s+-\s*))/gim)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .filter((segment) => /(?:^|\n)\s*\(?[A-E]\)?[).:-]?\s+/im.test(segment));

  return segments
    .map((segment, index) => {
      const options = extractOptions(segment);

      if (options.length < 2) {
        return null;
      }

      const firstOptionIndex = findFirstOptionIndex(segment);
      const rawStatement = normalizeText(
        firstOptionIndex > 0 ? segment.slice(0, firstOptionIndex) : segment
      );
      const statement = normalizeText(
        rawStatement
          .replace(/^(quest[aã]o\s*)?(\d{1,3})\s*$/i, "$2")
          .replace(/^(?:quest[aã]o\s*)?(\d{1,3})\s*\n\s*/i, "$1. ")
          .replace(/^(?:quest[aã]o\s*)?(\d{1,3})\s*([).:-])\s*/i, "$1. ")
      );
      const questionNumber = extractQuestionNumber(statement, index);

      if (!statement || isLikelyPdfArtifact(statement)) {
        return null;
      }

      const correctAnswer =
        segment.match(/(?:gabarito|resposta(?:\s+correta)?)\s*[:=-]?\s*([A-E])/i)?.[1] ??
        answerKeyMap.get(questionNumber);

      return {
        id: createId("question"),
        pdfId,
        questionNumber,
        statement,
        options,
        correctAnswer,
        explanation: correctAnswer
          ? `Gabarito identificado no documento como alternativa ${correctAnswer}.`
          : undefined,
        topic,
        difficulty: options.length >= 5 ? "medium" : "easy",
        createdAt: new Date().toISOString(),
      } satisfies ExtractedQuestionRecord;
    })
    .filter((question) => question !== null) as ExtractedQuestionRecord[];
};

const extractTheoryParagraphs = (text: string) =>
  getMeaningfulParagraphs(text)
    .filter((paragraph) => !looksLikeQuestionStatement(paragraph))
    .filter((paragraph) => !/^\(?[A-E]\)?[).:-]?\s+/.test(paragraph))
    .slice(0, 6);

const subjectKeywords: Record<string, string[]> = {
  Portugues: ["crase", "gramatica", "interpretacao", "ortografia", "sintaxe", "portugues"],
  Matematica: ["porcentagem", "equacao", "funcao", "matematica", "aritmetica", "geometria"],
  Direito: ["lei", "artigo", "constituicao", "direito", "jurisprudencia", "licitacao"],
  Tecnologia: ["algoritmo", "software", "dados", "api", "programacao", "tecnologia", "computador"],
  Biologia: ["neuronio", "gaba", "glutamato", "sinapse", "biologia", "neuro"],
};

const detectSubject = (text: string, fallbackName: string) => {
  const corpus = `${fallbackName} ${text}`.toLowerCase();
  let bestSubject = "Geral";
  let bestScore = 0;

  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    const score = keywords.reduce(
      (total, keyword) => total + (corpus.includes(keyword) ? 1 : 0),
      0
    );

    if (score > bestScore) {
      bestScore = score;
      bestSubject = subject;
    }
  }

  return bestSubject;
};

const detectTitle = (text: string, fileName: string, metadataTitle?: string) => {
  const fallbackTitle = sanitizeFileTitle(fileName);

  if (metadataTitle) {
    const cleanMetadataTitle = normalizeText(metadataTitle);
    if (
      cleanMetadataTitle.length > 6 &&
      cleanMetadataTitle.length < 140 &&
      !isLikelyPdfArtifact(cleanMetadataTitle)
    ) {
      return cleanMetadataTitle;
    }
  }

  const firstLine = getMeaningfulLines(text).find((line) => line.length > 12 && line.length < 120);
  return firstLine && !hasHighGarbageRatio(firstLine) ? firstLine : fallbackTitle;
};

const detectTopics = (text: string, subject: string) => {
  const headingCandidates = getMeaningfulLines(text)
    .filter((line) => line.length > 8 && line.length < 80)
    .filter((line) => /^[A-ZÀ-Ú0-9][A-Za-zÀ-ÿ0-9 ,:()/-]+$/.test(line))
    .slice(0, 6);

  if (headingCandidates.length >= 3) {
    return [...new Set(headingCandidates)];
  }

  const defaults: Record<string, string[]> = {
    Portugues: ["Conceitos centrais", "Regras principais", "Excecoes recorrentes"],
    Matematica: ["Fundamentos", "Aplicacao pratica", "Resolucao de questoes"],
    Direito: ["Base legal", "Pontos de atencao", "Aplicacao em prova"],
    Tecnologia: ["Conceitos base", "Implementacao", "Boas praticas"],
    Biologia: ["Fundamentos", "Processos envolvidos", "Aplicacao pratica"],
    Geral: ["Visao geral", "Conceitos-chave", "Revisao final"],
  };

  return defaults[subject] ?? defaults.Geral;
};

const extractSummary = (text: string, subject: string) => {
  const paragraphs = extractTheoryParagraphs(text).slice(0, 4);
  const totalUsefulLength = paragraphs.join(" ").length;
  const readableParagraphs = paragraphs.filter((paragraph) => hasReadableWordDensity(paragraph));

  if (paragraphs.length === 0 || readableParagraphs.length === 0 || totalUsefulLength < 120) {
    return "";
  }

  const concepts = readableParagraphs.slice(0, 2).join(" ");
  const attention =
    readableParagraphs[2] || readableParagraphs[0] || "Documento ainda precisa de revisao manual.";
  const conclusion =
    readableParagraphs[3] ||
    "Use este resumo para revisao ativa e conexao com os exercicios extraidos.";

  return [
    "Visao geral:",
    concepts || `Material classificado em ${subject}.`,
    "",
    "Pontos de atencao:",
    attention,
    "",
    "Conclusao resumida:",
    conclusion,
  ].join("\n");
};

const extractQuestions = (
  text: string,
  pdfId: string,
  topic: string
): ExtractedQuestionRecord[] => {
  const cleanText = normalizeQuestionLayout(getMeaningfulLines(text).join("\n"));
  const questionText = trimToQuestionContent(cleanText);
  const answerKeyMap = extractAnswerKeyMap(questionText);
  const blocks = splitQuestionBlocks(questionText);

  console.log("==== CLEAN TEXT SAMPLE ====");
  console.log(questionText.slice(0, 4000));
  console.log("==== BLOCKS FOUND ====", blocks.length);
  console.log(blocks.slice(0, 3));

  const lineBasedQuestions = blocks
    .map((block, index) => {
      const options = extractOptions(block);

      if (options.length < 2) {
        return null;
      }

      const firstOptionIndex = findFirstOptionIndex(block);
      const rawStatement = normalizeText(
        firstOptionIndex > 0 ? block.slice(0, firstOptionIndex) : block
      );
      const statement = normalizeText(
        rawStatement
          .replace(/^(quest[aã]o\s*)?(\d{1,3})\s*$/i, "$2")
          .replace(/^(?:quest[aã]o\s*)?(\d{1,3})\s*\n\s*/i, "$1. ")
          .replace(/^(?:quest[aã]o\s*)?(\d{1,3})\s*([).:-])\s*/i, "$1. ")
      );
      const questionNumber = extractQuestionNumber(statement, index);

      if (!statement || isLikelyPdfArtifact(statement)) {
        return null;
      }

      const correctAnswer =
        block.match(/(?:gabarito|resposta(?:\s+correta)?)\s*[:=-]?\s*([A-E])/i)?.[1] ??
        answerKeyMap.get(questionNumber);

      return {
        id: createId("question"),
        pdfId,
        questionNumber,
        statement,
        options,
        correctAnswer,
        explanation: correctAnswer
          ? `Gabarito identificado no documento como alternativa ${correctAnswer}.`
          : undefined,
        topic,
        difficulty: options.length >= 5 ? "medium" : "easy",
        createdAt: new Date().toISOString(),
      } satisfies ExtractedQuestionRecord;
    })
    .filter((question) => question !== null) as ExtractedQuestionRecord[];

  const paragraphBasedQuestions = extractQuestionsFromParagraphs(questionText, pdfId, topic);
  const mergedQuestions = [...lineBasedQuestions, ...paragraphBasedQuestions];
  const uniqueQuestions = mergedQuestions.filter((question, index, array) => {
    const key = `${question.questionNumber}:${question.statement}`;
    return array.findIndex((item) => `${item.questionNumber}:${item.statement}` === key) === index;
  });

  return uniqueQuestions.slice(0, 40);
};

const createFlashcards = (
  pdfId: string,
  topics: string[],
  summary: string
): FlashcardRecord[] => {
  const summarySentences = summary
    .split(/[.\n]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40)
    .slice(0, 6);

  return topics.slice(0, 4).map((topic, index) => ({
    id: createId("flashcard"),
    pdfId,
    question: `O que voce precisa lembrar sobre ${topic}?`,
    answer:
      summarySentences[index] ??
      `Revise os conceitos-chave, aplicacoes e pontos de atencao relacionados a ${topic}.`,
    topic,
    difficulty: index > 1 ? "medium" : "easy",
    createdAt: new Date().toISOString(),
  }));
};

const createTrail = (
  title: string,
  subject: string,
  topics: string[],
  questions: ExtractedQuestionRecord[],
  flashcards: FlashcardRecord[]
) => {
  const topicNodes = topics.slice(0, 4).map((topic) => ({
    title: topic,
    type: "topic" as const,
    relatedQuestionIds: questions
      .filter((question) => question.topic === topic)
      .map((question) => question.id),
    relatedFlashcardIds: flashcards
      .filter((flashcard) => flashcard.topic === topic)
      .map((flashcard) => flashcard.id),
  }));

  const nodes: Array<{
    title: string;
    type: TrailNodeRecord["type"];
    relatedQuestionIds: string[];
    relatedFlashcardIds: string[];
  }> = [
    {
      title: `Introducao a ${subject}`,
      type: "module",
      relatedQuestionIds: [],
      relatedFlashcardIds: [],
    },
    ...topicNodes,
    {
      title: "Exercicios do documento",
      type: "exercise",
      relatedQuestionIds: questions.map((question) => question.id),
      relatedFlashcardIds: [],
    },
    {
      title: "Revisao com flashcards",
      type: "review",
      relatedQuestionIds: [],
      relatedFlashcardIds: flashcards.map((flashcard) => flashcard.id),
    },
    {
      title: "Resumo final",
      type: "summary",
      relatedQuestionIds: [],
      relatedFlashcardIds: flashcards.slice(0, 2).map((flashcard) => flashcard.id),
    },
  ];

  return {
    title: `Trilha: ${title}`,
    subject,
    nodes,
  };
};

export const processPdfDocument = async (
  fileBuffer: Buffer,
  pdfId: string,
  fileName: string
): Promise<ProcessedDocumentPayload> => {
  let text = "";
  let metadataTitle = "";

  try {
    const coreModulePath = path.resolve(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "dist",
      "pdf-parse",
      "cjs",
      "index.cjs"
    );
    const workerModulePath = path.resolve(
      process.cwd(),
      "node_modules",
      "pdf-parse",
      "dist",
      "worker",
      "cjs",
      "index.cjs"
    );

    const pdfParseModuleImport = await import(
      /* webpackIgnore: true */ pathToFileURL(coreModulePath).href
    );
    const pdfWorkerModuleImport = await import(
      /* webpackIgnore: true */ pathToFileURL(workerModulePath).href
    );

    const pdfParseModule = (
      "default" in pdfParseModuleImport ? pdfParseModuleImport.default : pdfParseModuleImport
    ) as {
      PDFParse?: {
        new (options: { data: Buffer | Uint8Array }): {
          getText: () => Promise<{ text?: string }>;
          getInfo: () => Promise<{ info?: { Title?: string } }>;
          destroy: () => Promise<void>;
        };
        setWorker?: (workerSrc?: string) => string;
      };
    };

    const pdfWorkerModule = (
      "default" in pdfWorkerModuleImport ? pdfWorkerModuleImport.default : pdfWorkerModuleImport
    ) as {
      getData?: () => string;
    };

    if (!pdfParseModule.PDFParse) {
      throw new Error("Formato do modulo pdf-parse nao suportado neste ambiente.");
    }

    if (typeof pdfWorkerModule.getData === "function") {
      pdfParseModule.PDFParse.setWorker?.(pdfWorkerModule.getData());
    }

    const parser = new pdfParseModule.PDFParse({ data: fileBuffer });
    const info = await parser.getInfo().catch(() => null);
    const parsed = await parser.getText();
    await parser.destroy();

    metadataTitle = info?.info?.Title?.trim() ?? "";
    text = normalizeText(parsed?.text || "");
  } catch (error) {
    console.warn("Primary PDF parser failed, using fallback extraction:", {
      fileName,
      error: error instanceof Error ? error.message : String(error),
    });
    text = extractTextFallback(fileBuffer);
  }

  const meaningfulText = normalizeText(getMeaningfulLines(text).join("\n"));

  if (meaningfulText.length < 40) {
    throw new Error("Nao foi possivel extrair texto legivel deste PDF.");
  }

  const title = detectTitle(meaningfulText, fileName, metadataTitle);
  const subject = detectSubject(meaningfulText, fileName);
  const topics = detectTopics(meaningfulText, subject);
  const summary = extractSummary(meaningfulText, subject);
  const questions = extractQuestions(meaningfulText, pdfId, topics[0] ?? subject);
  const flashcards = createFlashcards(pdfId, topics, summary);
  const trail = createTrail(title, subject, topics, questions, flashcards);

  return {
    title,
    subject,
    summary,
    topics,
    questions,
    flashcards,
    trail,
  };
};
