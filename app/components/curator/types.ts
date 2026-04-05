import type { LucideIcon } from "lucide-react";

export type PlanIconKey = "book" | "chart" | "sparkles" | "brain";

export type Screen =
  | "onboarding"
  | "dashboard"
  | "plan"
  | "review"
  | "library"
  | "analytics"
  | "profile"
  | "config"
  | "study"
  | "simulado"
  | "pdf-viewer";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
}

export interface Doc {
  id: string;
  userId?: string;
  title: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  time: string;
  size: string;
  status: "analyzed" | "analyzing" | "idle" | "failed";
  processingStatus?: "uploaded" | "processing" | "processed" | "failed";
  processingError?: string | null;
  isRead?: boolean;
  isAnalyzed?: boolean;
  subject?: string;
  extractedTitle?: string;
  extractedSubject?: string;
  extractedTopics?: string[];
  generatedTrailId?: string;
  questionsCount?: number;
  flashcardsCount?: number;
  summary?: string;
  uploadedAt?: string;
  questions?: StudyQuestion[];
}

export interface PlanTask {
  id: number;
  title: string;
  duration: string;
  iconKey: PlanIconKey;
  icon: LucideIcon;
  color: string;
  status: "completed" | "pending";
}

export interface StudyOption {
  id: string;
  label: string;
  correct?: boolean;
}

export interface StudyQuestion {
  id: string;
  questionNumber?: string;
  prompt: string;
  explanation: string;
  recommendation: string;
  subject?: string;
  sourceTitle?: string;
  sourceDocId?: string;
  options: StudyOption[];
}

export interface Flashcard {
  id: string;
  pdfId: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface StudyProgress {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  completed: boolean;
  activeMaterialTitle?: string;
}

export interface OverviewSubjectMetric {
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

export interface DashboardOverview {
  documentsUploaded: number;
  documentsAnalyzed: number;
  questionsExtracted: number;
  flashcardsGenerated: number;
  trailsCreated: number;
  nextTrailTitle: string;
  subjects: OverviewSubjectMetric[];
}

export interface TrailNode {
  id: string;
  title: string;
  type: string;
  status: string;
  order: number;
  relatedQuestionIds?: string[];
  relatedFlashcardIds?: string[];
}

export interface TrailOverview {
  id: string;
  pdfId: string;
  title: string;
  subject: string;
  progress: number;
  status: string;
  nodes: TrailNode[];
}
