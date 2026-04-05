import { attachPlanIcons, stripPlanIcons, type StoredPlanTask } from "./plan-data";
import { initialStudyProgress } from "./study-data";
import type { Doc, PlanTask, Screen, StudyProgress } from "./types";

const STORAGE_KEYS = {
  hasCompletedOnboarding: "curator_has_completed_onboarding",
  lastScreen: "curator_last_screen",
  tasks: "curator_tasks",
  docs: "curator_docs",
  studyProgress: "curator_study_progress",
  reviewQuestionIds: "curator_review_question_ids",
} as const;

const isBrowser = () => typeof window !== "undefined";

const readJson = <T,>(key: string): T | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota/private-mode issues and keep the app usable.
  }
};

export const loadStoredTasks = () => {
  const stored = readJson<StoredPlanTask[]>(STORAGE_KEYS.tasks);
  return stored ? attachPlanIcons(stored) : null;
};

export const saveStoredTasks = (tasks: PlanTask[]) => {
  writeJson(STORAGE_KEYS.tasks, stripPlanIcons(tasks));
};

export const loadStoredDocs = () => readJson<Doc[]>(STORAGE_KEYS.docs);

export const saveStoredDocs = (docs: Doc[]) => {
  writeJson(STORAGE_KEYS.docs, docs);
};

export const loadStoredAppState = () => {
  const hasCompletedOnboarding = readJson<boolean>(STORAGE_KEYS.hasCompletedOnboarding);
  const lastScreen = readJson<Screen>(STORAGE_KEYS.lastScreen);
  const studyProgress = readJson<StudyProgress>(STORAGE_KEYS.studyProgress);

  return {
    hasCompletedOnboarding: hasCompletedOnboarding ?? false,
    lastScreen: lastScreen ?? "dashboard",
    studyProgress: studyProgress ?? initialStudyProgress,
  };
};

export const loadStoredReviewQuestionIds = () =>
  readJson<string[]>(STORAGE_KEYS.reviewQuestionIds) ?? [];

export const saveStoredReviewQuestionIds = (questionIds: string[]) => {
  writeJson(STORAGE_KEYS.reviewQuestionIds, Array.from(new Set(questionIds)));
};

export const saveStoredAppState = ({
  hasCompletedOnboarding,
  lastScreen,
  studyProgress,
}: {
  hasCompletedOnboarding: boolean;
  lastScreen: Screen;
  studyProgress: StudyProgress;
}) => {
  writeJson(STORAGE_KEYS.hasCompletedOnboarding, hasCompletedOnboarding);
  writeJson(STORAGE_KEYS.lastScreen, lastScreen);
  writeJson(STORAGE_KEYS.studyProgress, studyProgress);
};
