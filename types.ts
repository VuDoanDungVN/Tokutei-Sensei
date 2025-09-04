export enum AppScreen {
  Onboarding = 'ONBOARDING',
  Login = 'LOGIN',
  Signup = 'SIGNUP',
  Dashboard = 'DASHBOARD',
  Practice = 'PRACTICE',
  Quiz = 'QUIZ',
  Results = 'RESULTS',
  Analytics = 'ANALYTICS',
  Community = 'COMMUNITY',
  Admin = 'ADMIN',
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
}

export interface Topic {
  id: string;
  titleKey: string;
  title: string; // Japanese title, used as the key for filtering questions
  icon: React.ElementType;
  progress: number;
  questionsAttempted: number;
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
  examNumber: number;
  topic: string; // Japanese topic title
  question: string;
  options: string[];
  correctAnswer: number;
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