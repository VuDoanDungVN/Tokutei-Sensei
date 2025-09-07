import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { ExamResult } from '../types';

export interface UserProgress {
  userId: string;
  examNumber: number;
  totalQuestions: number;
  completedQuestions: number;
  correctAnswers: number;
  totalAttempts: number;
  lastUpdated: Date;
  topics: {
    [topicId: string]: {
      completed: number;
      correct: number;
      total: number;
    };
  };
}

export interface QuizSession {
  id?: string;
  userId: string;
  examNumber: number;
  topicId: string;
  result: ExamResult;
  completedAt: Date;
  questionsAnswered: string[]; // Question IDs that were answered
}

class ProgressService {
  private progressCache = new Map<string, UserProgress>();

  /**
   * Save quiz result and update user progress
   */
  async saveQuizResult(
    userId: string, 
    examNumber: number, 
    topicId: string, 
    result: ExamResult,
    questionsAnswered: string[]
  ): Promise<void> {
    try {
      // Save quiz session
      const sessionData: Omit<QuizSession, 'id'> = {
        userId,
        examNumber,
        topicId,
        result,
        completedAt: new Date(),
        questionsAnswered
      };

      await addDoc(collection(db, 'quizSessions'), sessionData);

      // Update user progress
      await this.updateUserProgress(userId, examNumber, topicId, result, questionsAnswered);
      
      console.log('✅ Quiz result saved and progress updated');
    } catch (error) {
      console.error('❌ Error saving quiz result:', error);
      throw error;
    }
  }

  /**
   * Update user progress based on quiz result
   */
  private async updateUserProgress(
    userId: string,
    examNumber: number,
    topicId: string,
    result: ExamResult,
    questionsAnswered: string[]
  ): Promise<void> {
    try {
      const progressId = `${userId}_${examNumber}`;
      const progressRef = doc(db, 'userProgress', progressId);
      const progressDoc = await getDoc(progressRef);

      let progress: UserProgress;

      if (progressDoc.exists()) {
        // Update existing progress
        progress = progressDoc.data() as UserProgress;
        
        // Update topic progress
        if (!progress.topics[topicId]) {
          progress.topics[topicId] = {
            completed: 0,
            correct: 0,
            total: 0
          };
        }

        // Add new questions to completed count (avoid duplicates)
        const newQuestions = questionsAnswered.filter(qId => 
          !progress.topics[topicId].completed || 
          !progress.topics[topicId].completed.toString().includes(qId)
        );

        progress.topics[topicId].completed += newQuestions.length;
        progress.topics[topicId].correct += result.correctAnswers;
        progress.topics[topicId].total = Math.max(
          progress.topics[topicId].total,
          result.totalQuestions
        );

        // Update overall progress
        progress.completedQuestions += newQuestions.length;
        progress.correctAnswers += result.correctAnswers;
        progress.totalAttempts += 1;
        progress.lastUpdated = new Date();

        await updateDoc(progressRef, progress);
      } else {
        // Create new progress
        progress = {
          userId,
          examNumber,
          totalQuestions: result.totalQuestions,
          completedQuestions: questionsAnswered.length,
          correctAnswers: result.correctAnswers,
          totalAttempts: 1,
          lastUpdated: new Date(),
          topics: {
            [topicId]: {
              completed: questionsAnswered.length,
              correct: result.correctAnswers,
              total: result.totalQuestions
            }
          }
        };

        await setDoc(progressRef, progress);
      }

      // Update cache
      this.progressCache.set(progressId, progress);
      
    } catch (error) {
      console.error('❌ Error updating user progress:', error);
      throw error;
    }
  }

  /**
   * Get user progress for a specific exam
   */
  async getUserProgress(userId: string, examNumber: number): Promise<UserProgress | null> {
    try {
      const progressId = `${userId}_${examNumber}`;
      
      // Check cache first
      if (this.progressCache.has(progressId)) {
        return this.progressCache.get(progressId)!;
      }

      const progressRef = doc(db, 'userProgress', progressId);
      const progressDoc = await getDoc(progressRef);

      if (progressDoc.exists()) {
        const progress = progressDoc.data() as UserProgress;
        this.progressCache.set(progressId, progress);
        return progress;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting user progress:', error);
      return null;
    }
  }

  /**
   * Get all user progress for dashboard
   */
  async getAllUserProgress(userId: string): Promise<{ [examNumber: number]: UserProgress }> {
    try {
      const progressQuery = query(
        collection(db, 'userProgress'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(progressQuery);
      const progressMap: { [examNumber: number]: UserProgress } = {};

      querySnapshot.forEach((doc) => {
        const progress = doc.data() as UserProgress;
        progressMap[progress.examNumber] = progress;
        this.progressCache.set(`${userId}_${progress.examNumber}`, progress);
      });

      return progressMap;
    } catch (error) {
      console.error('❌ Error getting all user progress:', error);
      return {};
    }
  }

  /**
   * Calculate progress percentage for an exam
   */
  async calculateProgressPercentage(progress: UserProgress | null, examNumber: number): Promise<number> {
    if (!progress) {
      return 0;
    }

    try {
      // Get total questions available for this exam from questionService
      const { questionService } = await import('./questionService');
      const totalQuestions = await questionService.getTotalQuestionsCount(examNumber);
      
      if (totalQuestions === 0) {
        // Fallback to simple calculation
        if (progress.totalQuestions === 0) {
          return 0;
        }
        return Math.round((progress.completedQuestions / progress.totalQuestions) * 100);
      }

      // Calculate based on completed questions vs total available questions
      const percentage = Math.round((progress.completedQuestions / totalQuestions) * 100);
      return percentage;
    } catch (error) {
      console.error('❌ Error calculating progress percentage:', error);
      // Fallback to simple calculation
      if (progress.totalQuestions === 0) {
        return 0;
      }
      const fallbackPercentage = Math.round((progress.completedQuestions / progress.totalQuestions) * 100);
      return fallbackPercentage;
    }
  }

  /**
   * Get exam name from exam number
   */
  getExamName(examNumber: number): string {
    return `Kỳ thi ${examNumber} (2024)`;
  }

  /**
   * Check if an exam is passed (completed 100% or achieved passing score)
   */
  async isExamPassed(progress: UserProgress | null, examNumber: number): Promise<boolean> {
    if (!progress) {
      return false;
    }

    try {
      // Get total questions available for this exam
      const { questionService } = await import('./questionService');
      const totalQuestionsAvailable = await questionService.getTotalQuestionsCount(examNumber);
      
      if (totalQuestionsAvailable === 0) {
        return false;
      }

      // Check if completed 100% of available questions
      if (progress.completedQuestions >= totalQuestionsAvailable) {
        return true;
      }

      // Check if achieved passing score (e.g., 60% or higher) with sufficient questions attempted
      const passingScore = 60; // 60% accuracy threshold
      const minQuestionsRequired = Math.min(5, totalQuestionsAvailable * 0.1); // At least 10% of questions or 5 questions
      
      if (progress.completedQuestions < minQuestionsRequired) {
        return false;
      }

      const accuracy = progress.completedQuestions > 0 ? (progress.correctAnswers / progress.completedQuestions) * 100 : 0;
      
      return accuracy >= passingScore;
    } catch (error) {
      console.error('❌ Error checking if exam is passed:', error);
      return false;
    }
  }

  /**
   * Get only passed exams from progress data
   */
  async getPassedExams(allProgress: { [examNumber: number]: UserProgress }): Promise<{ [examNumber: number]: UserProgress }> {
    const passedExams: { [examNumber: number]: UserProgress } = {};
    
    for (const [examNumber, progress] of Object.entries(allProgress)) {
      const isPassed = await this.isExamPassed(progress, parseInt(examNumber));
      if (isPassed) {
        passedExams[parseInt(examNumber)] = progress;
      }
    }
    
    return passedExams;
  }

  /**
   * Get all exams with progress (not just passed ones)
   */
  async getExamsWithProgress(allProgress: { [examNumber: number]: UserProgress }): Promise<{ [examNumber: number]: UserProgress }> {
    const examsWithProgress: { [examNumber: number]: UserProgress } = {};
    
    for (const [examNumber, progress] of Object.entries(allProgress)) {
      // Include any exam that has some progress (at least 1 question completed)
      if (progress.completedQuestions > 0) {
        examsWithProgress[parseInt(examNumber)] = progress;
      }
    }
    
    return examsWithProgress;
  }
}

export const progressService = new ProgressService();
