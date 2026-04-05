export interface UserRecord {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  coins: number;
  lastStudyDate: string | null;
  createdAt: string;
}

export interface AchievementRecord {
  id: string;
  userId: string;
  key: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface DailyMissionRecord {
  id: string;
  userId: string;
  date: string;
  targetQuestions: number;
  answeredQuestions: number;
  completed: boolean;
  xpReward: number;
  coinsReward: number;
}

export interface PdfDocumentRecord {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  uploadedAt: string;
  processingStatus: "uploaded" | "processing" | "processed" | "failed";
  isRead: boolean;
  isAnalyzed: boolean;
  extractedTitle: string;
  extractedSubject: string;
  extractedSummary: string;
  extractedTopics: string[];
  extractedQuestionIds: string[];
  extractedFlashcardIds: string[];
  generatedTrailId?: string;
  processingError?: string | null;
  deletedAt?: string | null;
}

export interface ExtractedQuestionRecord {
  id: string;
  pdfId: string;
  questionNumber: string;
  statement: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer?: string;
  explanation?: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

export interface FlashcardRecord {
  id: string;
  pdfId: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
}

export interface StudyTrailRecord {
  id: string;
  userId: string;
  pdfId: string;
  title: string;
  subject: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  createdAt: string;
}

export interface TrailNodeRecord {
  id: string;
  trailId: string;
  title: string;
  type: "module" | "topic" | "exercise" | "review" | "summary";
  status: "pending" | "in_progress" | "completed";
  order: number;
  relatedQuestionIds: string[];
  relatedFlashcardIds: string[];
}

export interface StudySessionRecord {
  id: string;
  userId: string;
  pdfId?: string;
  trailId?: string;
  subject: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  questionsSolved: number;
  correctAnswers: number;
  flashcardsReviewed: number;
}

export interface AnalyticsMetricRecord {
  id: string;
  userId: string;
  subject: string;
  accuracyRate: number;
  questionsSolved: number;
  flashcardsReviewed: number;
  studyTime: number;
  progressPercent: number;
  updatedAt: string;
}

export interface QuestionAttemptRecord {
  id: string;
  userId: string;
  questionId: string;
  pdfId: string;
  subject: string;
  selectedAnswer: string;
  correctAnswer?: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface QuestionReviewStateRecord {
  id: string;
  userId: string;
  questionId: string;
  pdfId: string;
  subject: string;
  status: "new" | "review" | "mastered";
  errorCount: number;
  successStreak: number;
  lastResult: "correct" | "wrong";
  lastReviewedAt: string;
  nextReviewAt: string;
  updatedAt: string;
}

export interface SimuladoAttemptRecord {
  id: string;
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  durationSeconds: number;
  subject: string | null;
  finishedAt: string;
}

export interface AppDatabase {
  users: UserRecord[];
  documents: PdfDocumentRecord[];
  questions: ExtractedQuestionRecord[];
  flashcards: FlashcardRecord[];
  trails: StudyTrailRecord[];
  trailNodes: TrailNodeRecord[];
  studySessions: StudySessionRecord[];
  analytics: AnalyticsMetricRecord[];
  questionAttempts: QuestionAttemptRecord[];
  reviewStates: QuestionReviewStateRecord[];
  achievements: AchievementRecord[];
  dailyMissions: DailyMissionRecord[];
  simuladoAttempts: SimuladoAttemptRecord[];
}

export interface ProcessedDocumentPayload {
  title: string;
  subject: string;
  summary: string;
  topics: string[];
  questions: ExtractedQuestionRecord[];
  flashcards: FlashcardRecord[];
  trail: {
    title: string;
    subject: string;
    nodes: Array<{
      title: string;
      type: TrailNodeRecord["type"];
      relatedQuestionIds: string[];
      relatedFlashcardIds: string[];
    }>;
  };
}

export interface DocumentDetailsPayload extends PdfDocumentRecord {
  questionsCount: number;
  flashcardsCount: number;
  questions: ExtractedQuestionRecord[];
  flashcards: FlashcardRecord[];
}

export interface CuratedQuestionImportRecord {
  questionNumber: string;
  statement: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer?: string;
  explanation?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface CuratedFlashcardImportRecord {
  question: string;
  answer: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface CuratedTrailNodeImportRecord {
  title: string;
  type: TrailNodeRecord["type"];
  relatedQuestionNumbers?: string[];
  relatedFlashcardIndexes?: number[];
}

export interface CuratedDocumentImportPayload {
  fileName: string;
  sourcePdfPath: string;
  title: string;
  subject: string;
  summary?: string;
  topics?: string[];
  questions: CuratedQuestionImportRecord[];
  flashcards?: CuratedFlashcardImportRecord[];
  trail?: {
    title?: string;
    subject?: string;
    nodes?: CuratedTrailNodeImportRecord[];
  };
}
