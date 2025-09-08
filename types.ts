export enum AppScreen {
  Onboarding = 'ONBOARDING',
  Login = 'LOGIN',
  Signup = 'SIGNUP',
  Dashboard = 'DASHBOARD',
  Tokutei = 'TOKUTEI',
  Practice = 'PRACTICE',
  Quiz = 'QUIZ',
  Results = 'RESULTS',
  Analytics = 'ANALYTICS',
  Community = 'COMMUNITY',
  Admin = 'ADMIN',
  StudySupport = 'STUDY_SUPPORT',
}

export type Language = 'ja' | 'en' | 'vi';
export type ExamLevel = 'Practice' | 'Mock Test' | 'Full Course';

export interface User {
  uid: string;
  email: string | null;
  role?: 'user' | 'user-pro' | 'admin-pro';
  displayName?: string;
  fullName?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface UserSettings {
  language: Language;
  level: ExamLevel;
  examDate: string;
  weeklyStudyTime: number;
  // New settings
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  autoSave: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  studyReminders: boolean;
  compactMode: boolean;
}

export interface Topic {
  id: string;
  titleKey: string;
  title: string; // Japanese title, used as the key for filtering questions
  icon: React.ElementType;
  progress: number;
  questionsAttempted: number;
  questions?: Question[];
}

export interface TopicCategory {
  id: string;
  titleKey: string;
  japaneseTitle: string;
  topics: Topic[];
}

export interface KanjiHint {
  kanji: string;
  romaji: string;
  meaning: {
    en: string;
    vi: string;
  };
}

export interface Question {
  id: string; // Firestore document ID
  examNumber?: number;
  topic?: string; // Japanese topic title
  question: string;
  options: string[] | { id: string; text: string; isCorrect?: boolean }[];
  correctAnswer: number | string;
  explanation: string;
  kanjiHints?: KanjiHint[];
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  answers: { [questionId: string]: number };
}