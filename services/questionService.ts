import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { AnalyzedQuestion } from './imageAnalysisService';
import { questionCacheService } from './questionCacheService';

// Types for Firestore data structure
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface FirestoreQuestion {
  id?: string;
  question: string;
  options: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topic?: string;
  topicId?: string; // Specific topic ID (e.g., 'dignity', 'relationships')
  subject: string;
  examPeriod: string;
  createdAt: Timestamp;
  createdBy: string;
  source: 'upload' | 'manual';
  imageUrl?: string;
}

export interface ExamPeriod {
  id: string;
  name: string;
  examNumber: number;
  year: number;
  createdAt: Timestamp;
  createdBy: string;
}

// Subject categories mapping
export const SUBJECT_CATEGORIES = {
  'Nền tảng nhân văn và xã hội': 'humanities',
  'Kiến thức y học và tâm lý': 'medical_psychology', 
  'Kiến thức chuyên ngành điều dưỡng': 'nursing_specialty',
  'Tổng hợp': 'comprehensive'
} as const;

export type SubjectCategory = keyof typeof SUBJECT_CATEGORIES;

class QuestionService {
  /**
   * Get or create exam period for specific exam number
   */
  async getExamPeriod(userId: string, examNumber: number): Promise<ExamPeriod> {
    console.log('Getting exam period for user:', userId, 'exam:', examNumber);
    const currentYear = new Date().getFullYear();
    const examPeriodsRef = collection(db, 'exam_periods');
    
    // First, cleanup any duplicates
    await this.cleanupDuplicateExamPeriods(userId, examNumber);
    
    // Then check if exam period exists using a more specific query
    const exists = await this.examPeriodExists(userId, examNumber);
    if (exists) {
      console.log('✅ Exam period exists, fetching it...');
      // Get the existing exam period
      const q = query(
        examPeriodsRef,
        where('createdBy', '==', userId),
        where('examNumber', '==', examNumber),
        where('year', '==', currentYear),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const examPeriodDoc = querySnapshot.docs[0];
        const examPeriod = { id: examPeriodDoc.id, ...examPeriodDoc.data() } as ExamPeriod;
        console.log('✅ Using existing exam period for exam', examNumber, ':', examPeriod);
        return examPeriod;
      }
    }
    
    // Create new exam period for this exam number using safe method
    return this.createExamPeriodSafely(userId, examNumber);
  }

  /**
   * Get or create current exam period (for backward compatibility)
   */
  async getCurrentExamPeriod(userId: string): Promise<ExamPeriod> {
    return this.getExamPeriod(userId, 1); // Default to exam 1
  }

  /**
   * Clean up duplicate exam periods (if any exist)
   */
  async cleanupDuplicateExamPeriods(userId: string, examNumber: number): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const examPeriodsRef = collection(db, 'exam_periods');
      
      const q = query(
        examPeriodsRef,
        where('createdBy', '==', userId),
        where('examNumber', '==', examNumber),
        where('year', '==', currentYear)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size > 1) {
        console.log(`Found ${querySnapshot.size} duplicate exam periods for exam ${examNumber}, keeping the first one...`);
        
        // Keep the first one, delete the rest
        const docs = querySnapshot.docs;
        const keepDoc = docs[0];
        const deletePromises = docs.slice(1).map(doc => {
          console.log(`Deleting duplicate exam period: ${doc.id}`);
          return deleteDoc(doc.ref);
        });
        
        await Promise.all(deletePromises);
        console.log(`✅ Cleaned up ${deletePromises.length} duplicate exam periods`);
      }
    } catch (error) {
      console.error('Error cleaning up duplicate exam periods:', error);
    }
  }

  /**
   * Get exam period without creating if it doesn't exist
   */
  async getExamPeriodOnly(userId: string, examNumber: number): Promise<ExamPeriod | null> {
    try {
      const currentYear = new Date().getFullYear();
      const examPeriodsRef = collection(db, 'exam_periods');
      
      const q = query(
        examPeriodsRef,
        where('createdBy', '==', userId),
        where('examNumber', '==', examNumber),
        where('year', '==', currentYear),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const examPeriodDoc = querySnapshot.docs[0];
        const examPeriod = { id: examPeriodDoc.id, ...examPeriodDoc.data() } as ExamPeriod;
        return examPeriod;
      }
      
      console.log('❌ No exam period found for exam', examNumber);
      return null;
    } catch (error) {
      console.error('Error getting exam period:', error);
      return null;
    }
  }

  /**
   * Check if exam period exists for a specific exam number
   */
  async examPeriodExists(userId: string, examNumber: number): Promise<boolean> {
    try {
      const currentYear = new Date().getFullYear();
      const examPeriodsRef = collection(db, 'exam_periods');
      
      const q = query(
        examPeriodsRef,
        where('createdBy', '==', userId),
        where('examNumber', '==', examNumber),
        where('year', '==', currentYear),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking exam period existence:', error);
      return false;
    }
  }

  /**
   * Safely create exam period with retry logic to avoid duplicates
   */
  async createExamPeriodSafely(userId: string, examNumber: number): Promise<ExamPeriod> {
    const currentYear = new Date().getFullYear();
    const examPeriodsRef = collection(db, 'exam_periods');
    
    // Try to create with retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Check if it already exists before creating
        const exists = await this.examPeriodExists(userId, examNumber);
        if (exists) {
          console.log('Exam period already exists, fetching it...');
          return this.getExamPeriod(userId, examNumber);
        }
        
        console.log(`🆕 Creating exam period (attempt ${attempt}) for exam:`, examNumber);
        const newExamPeriod = {
          name: `Kỳ thi ${examNumber} - ${currentYear}`,
          examNumber: examNumber,
          year: currentYear,
          createdAt: serverTimestamp(),
          createdBy: userId
        };
        
        const docRef = await addDoc(examPeriodsRef, newExamPeriod);
        const createdExamPeriod = { id: docRef.id, ...newExamPeriod } as ExamPeriod;
        console.log('✅ Successfully created exam period:', createdExamPeriod);
        return createdExamPeriod;
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed to create exam period:`, error);
        
        if (attempt === 3) {
          // Last attempt failed, try to get existing one
          console.log('All attempts failed, trying to get existing exam period...');
          const exists = await this.examPeriodExists(userId, examNumber);
          if (exists) {
            return this.getExamPeriod(userId, examNumber);
          }
          throw error;
        }
        
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
    
    throw new Error('Failed to create exam period after 3 attempts');
  }

  /**
   * Save questions to Firestore
   */
  async saveQuestions(
    questions: AnalyzedQuestion[],
    subject: SubjectCategory,
    userId: string,
    examNumber: number,
    topicId: string,
    examPeriodId?: string
  ): Promise<{ success: boolean; savedCount: number; error?: string }> {
    try {
      console.log('Saving questions:', {
        questionsCount: questions.length,
        subject: subject,
        userId: userId,
        examNumber: examNumber,
        topicId: topicId,
        examPeriodId: examPeriodId
      });
      
      // Get or create exam period
      let examPeriod;
      try {
        examPeriod = examPeriodId 
          ? { id: examPeriodId, name: '', examNumber: examNumber, year: new Date().getFullYear(), createdAt: serverTimestamp(), createdBy: userId }
          : await this.getExamPeriod(userId, examNumber);
        
        console.log('Exam period:', examPeriod);
      } catch (examPeriodError) {
        console.error('Failed to get/create exam period:', examPeriodError);
        // Fallback: use a simple exam period object
        examPeriod = {
          id: `temp_${userId}_${examNumber}_${Date.now()}`,
          name: `Kỳ thi ${examNumber} - ${new Date().getFullYear()}`,
          examNumber: examNumber,
          year: new Date().getFullYear(),
          createdAt: serverTimestamp(),
          createdBy: userId
        };
        console.log('Using fallback exam period:', examPeriod);
      }

      // Get subject collection name
      const subjectCollection = SUBJECT_CATEGORIES[subject];
      if (!subjectCollection) {
        throw new Error(`Invalid subject: ${subject}`);
      }

      // Prepare questions for saving
      const questionsToSave = questions.map(q => {
        // Clean and validate question data
        const cleanOptions = (q.options || []).map((option, index) => {
          if (typeof option === 'string') {
            return {
              id: String.fromCharCode(65 + index), // A, B, C, D
              text: option,
              isCorrect: false
            };
          } else if (option && typeof option === 'object') {
            return {
              id: option.id || String.fromCharCode(65 + index),
              text: option.text || `Đáp án ${String.fromCharCode(65 + index)}`,
              isCorrect: option.isCorrect || false
            };
          } else {
            return {
              id: String.fromCharCode(65 + index),
              text: `Đáp án ${String.fromCharCode(65 + index)}`,
              isCorrect: false
            };
          }
        });

        const cleanQuestion = {
          question: q.question || 'Câu hỏi không có nội dung',
          options: cleanOptions,
          correctAnswer: q.correctAnswer || 'A',
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          topic: q.topic || subject,
          topicId: topicId, // Store the specific topic ID
          subject: subject,
          examPeriod: examPeriod.id,
          createdAt: serverTimestamp() as any, // Use serverTimestamp for consistency
          createdBy: userId,
          source: 'upload' as const
        };

        // Remove any undefined values
        const cleanedQuestion = Object.fromEntries(
          Object.entries(cleanQuestion).filter(([_, value]) => value !== undefined)
        ) as Omit<FirestoreQuestion, 'id'>;

        return cleanedQuestion;
      });

      // Validate questions data before saving
      const validQuestions = questionsToSave.filter(q => {
        // Check for required fields
        const hasValidQuestion = q.question && q.question.trim().length > 0;
        const hasValidOptions = q.options && Array.isArray(q.options) && q.options.length >= 2;
        const hasValidCorrectAnswer = q.correctAnswer && typeof q.correctAnswer === 'string';
        const hasValidSubject = q.subject && typeof q.subject === 'string';
        const hasValidExamPeriod = q.examPeriod && typeof q.examPeriod === 'string';
        const hasValidCreatedBy = q.createdBy && typeof q.createdBy === 'string';
        
        // Check for undefined values
        const hasUndefinedValues = Object.values(q).some(value => value === undefined);
        
        const isValid = hasValidQuestion && hasValidOptions && hasValidCorrectAnswer && 
                       hasValidSubject && hasValidExamPeriod && hasValidCreatedBy && 
                       !hasUndefinedValues;
        
        if (!isValid) {
          console.warn('Invalid question filtered out');
        }
        return isValid;
      });

      if (validQuestions.length === 0) {
        throw new Error('Không có câu hỏi hợp lệ để lưu');
      }


      // Save to Firestore
      let questionsRef;
      try {
        // Try to save to structured collection first
        questionsRef = collection(db, 'exam_periods', examPeriod.id, subjectCollection);
        const savePromises = validQuestions.map(questionData => 
          addDoc(questionsRef, questionData)
        );
        await Promise.all(savePromises);
      } catch (structuredError) {
        console.error('Failed to save to structured collection:', structuredError);
        // Fallback: save to simple collection
        const simpleQuestionsRef = collection(db, 'questions');
        const savePromises = validQuestions.map(questionData => {
          const fallbackData = {
            ...questionData,
            examPeriodId: examPeriod.id,
            subjectCollection: subjectCollection
          };
          
          // Remove any undefined values from fallback data
          const cleanedFallbackData = Object.fromEntries(
            Object.entries(fallbackData).filter(([_, value]) => value !== undefined)
          );
          
          return addDoc(simpleQuestionsRef, cleanedFallbackData);
        });
        await Promise.all(savePromises);
      }

      // Clear cache for this subject and exam number since we added new questions
      if (userId) {
        questionCacheService.clearCache(userId, subject, examNumber);
      }

      return {
        success: true,
        savedCount: validQuestions.length
      };

    } catch (error) {
      console.error('Error saving questions:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Handle specific Firestore errors
      if ((error as any)?.code === 'permission-denied') {
        return {
          success: false,
          savedCount: 0,
          error: 'Lỗi quyền truy cập Firestore. Vui lòng cấu hình Firestore security rules. Xem file FIRESTORE_RULES.md để biết cách cấu hình.'
        };
      }
      
      if ((error as any)?.code === 'failed-precondition') {
        return {
          success: false,
          savedCount: 0,
          error: 'Lỗi index Firestore. Đang thử lại với query đơn giản hơn...'
        };
      }
      
      return {
        success: false,
        savedCount: 0,
        error: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu câu hỏi'
      };
    }
  }

  /**
   * Get questions by subject and exam period (with caching)
   */
  async getQuestions(
    examPeriodId: string,
    subject: SubjectCategory,
    limitCount: number = 50,
    userId?: string,
    useCache: boolean = true
  ): Promise<FirestoreQuestion[]> {
    try {
      // Note: Cache is handled by getQuestionsByExamNumber method
      // This method is called from getQuestionsByExamNumber which handles caching with exam number

      const subjectCollection = SUBJECT_CATEGORIES[subject];
      if (!subjectCollection) {
        throw new Error(`Invalid subject: ${subject}`);
      }

      const questionsRef = collection(db, 'exam_periods', examPeriodId, subjectCollection);
      // Simplified query to avoid index requirement
      const q = query(
        questionsRef,
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      let questions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreQuestion[];

      // Sort by createdAt on client side
      questions.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return bTime - aTime; // Descending order
      });

      return questions;

    } catch (error) {
      console.error('Error getting questions:', error);
      return [];
    }
  }

  /**
   * Get questions by exam number, subject, and specific topic (with caching)
   */
  async getQuestionsByTopic(
    examNumber: number,
    subject: SubjectCategory,
    topicId: string,
    limitCount: number = 50,
    userId?: string,
    useCache: boolean = true
  ): Promise<FirestoreQuestion[]> {
    try {
      // Try to get from cache first
      if (useCache && userId) {
        const cacheKey = `${userId}_${examNumber}_${subject}_${topicId}`;
        const cachedQuestions = questionCacheService.getCachedQuestions(userId, subject, examNumber);
        if (cachedQuestions && cachedQuestions.length > 0) {
          // Filter by topic ID
          const filteredQuestions = cachedQuestions.filter(q => q.topicId === topicId);
          if (filteredQuestions.length > 0) {
            return filteredQuestions.slice(0, limitCount);
          }
        }
      }

      // Get exam period for this exam number
      if (!userId) {
        throw new Error('User ID is required to get questions by topic');
      }

      const examPeriod = await this.getExamPeriodOnly(userId, examNumber);
      if (!examPeriod) {
        console.log('No exam period found for exam', examNumber, 'topic', topicId);
        return [];
      }
      
      const questions = await this.getQuestions(examPeriod.id, subject, limitCount * 2, userId, useCache); // Get more to filter
      
      // Filter by topic ID
      const topicQuestions = questions.filter(q => q.topicId === topicId).slice(0, limitCount);
      
      
      // Cache the results with exam number (will be filtered by topic when retrieved)
      if (userId && questions.length > 0) {
        questionCacheService.cacheQuestions(userId, subject, questions, examNumber);
      }
      
      return topicQuestions;

    } catch (error) {
      console.error('Error getting questions by topic:', error);
      return [];
    }
  }

  /**
   * Get questions by exam number and subject (with caching)
   */
  async getQuestionsByExamNumber(
    examNumber: number,
    subject: SubjectCategory,
    limitCount: number = 50,
    userId?: string,
    useCache: boolean = true
  ): Promise<FirestoreQuestion[]> {
    try {
      // Try to get from cache first
      if (useCache && userId) {
        const cachedQuestions = questionCacheService.getCachedQuestions(userId, subject, examNumber);
        if (cachedQuestions && cachedQuestions.length > 0) {
          return cachedQuestions.slice(0, limitCount);
        }
      }

      // Get exam period for this exam number
      if (!userId) {
        throw new Error('User ID is required to get questions by exam number');
      }

      const examPeriod = await this.getExamPeriod(userId, examNumber);
      const questions = await this.getQuestions(examPeriod.id, subject, limitCount, userId, useCache);
      
      // Cache the results with exam number
      if (userId && questions.length > 0) {
        questionCacheService.cacheQuestions(userId, subject, questions, examNumber);
      }
      
      return questions;

    } catch (error) {
      console.error('Error getting questions by exam number:', error);
      return [];
    }
  }

  /**
   * Get questions from simple collection (with caching)
   */
  async getQuestionsFromSimpleCollection(
    userId: string,
    subject: SubjectCategory,
    useCache: boolean = true
  ): Promise<FirestoreQuestion[]> {
    try {
      // Try to get from cache first
      if (useCache) {
        const cachedQuestions = questionCacheService.getCachedQuestions(userId, subject);
        if (cachedQuestions && cachedQuestions.length > 0) {
          return cachedQuestions;
        }
      }

      const questionsRef = collection(db, 'questions');
      // Simplified query to avoid index requirement
      const q = query(
        questionsRef,
        where('createdBy', '==', userId),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      let questions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreQuestion[];

      // Filter by subject on client side
      questions = questions.filter(q => q.subject === subject);

      // Sort by createdAt on client side
      questions.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return bTime - aTime; // Descending order
      });

      // Cache the results
      if (questions.length > 0) {
        questionCacheService.cacheQuestions(userId, subject, questions);
      }

      return questions;
    } catch (error) {
      console.error('Error getting questions from simple collection:', error);
      return [];
    }
  }

  /**
   * Get all exam periods for a user
   */
  async getUserExamPeriods(userId: string): Promise<ExamPeriod[]> {
    try {
      const examPeriodsRef = collection(db, 'exam_periods');
      // Simplified query to avoid index requirement
      const q = query(
        examPeriodsRef,
        where('createdBy', '==', userId),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const examPeriods = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExamPeriod[];

      // Sort by createdAt on client side
      examPeriods.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return bTime - aTime; // Descending order
      });

      return examPeriods;

    } catch (error) {
      console.error('Error getting exam periods:', error);
      return [];
    }
  }

  /**
   * Get question statistics for an exam period
   */
  async getQuestionStats(examPeriodId: string): Promise<Record<string, number>> {
    try {
      const stats: Record<string, number> = {};
      
      for (const [subjectName, subjectCollection] of Object.entries(SUBJECT_CATEGORIES)) {
        const questionsRef = collection(db, 'exam_periods', examPeriodId, subjectCollection);
        const querySnapshot = await getDocs(questionsRef);
        stats[subjectName] = querySnapshot.size;
      }

      return stats;
    } catch (error) {
      console.error('Error getting question stats:', error);
      return {};
    }
  }

  /**
   * Get detailed question info for debugging
   */
  async getQuestionDebugInfo(userId: string, examNumber: number, topicId: string): Promise<{
    examPeriodExists: boolean;
    examPeriodId?: string;
    totalQuestions: number;
    topicQuestions: number;
    questionsByTopic: Record<string, number>;
  }> {
    try {
      const examPeriod = await this.getExamPeriodOnly(userId, examNumber);
      if (!examPeriod) {
        return {
          examPeriodExists: false,
          totalQuestions: 0,
          topicQuestions: 0,
          questionsByTopic: {}
        };
      }

      // Get all questions for this exam period
      const allQuestions: FirestoreQuestion[] = [];
      for (const [subjectName, subjectCollection] of Object.entries(SUBJECT_CATEGORIES)) {
        const questions = await this.getQuestions(examPeriod.id, subjectName as SubjectCategory, 100, userId, false);
        allQuestions.push(...questions);
      }

      // Count by topic
      const questionsByTopic: Record<string, number> = {};
      allQuestions.forEach(q => {
        const topic = q.topicId || 'unknown';
        questionsByTopic[topic] = (questionsByTopic[topic] || 0) + 1;
      });

      const topicQuestions = questionsByTopic[topicId] || 0;

      return {
        examPeriodExists: true,
        examPeriodId: examPeriod.id,
        totalQuestions: allQuestions.length,
        topicQuestions,
        questionsByTopic
      };
    } catch (error) {
      console.error('Error getting question debug info:', error);
      return {
        examPeriodExists: false,
        totalQuestions: 0,
        topicQuestions: 0,
        questionsByTopic: {}
      };
    }
  }

  /**
   * Get total questions count for a specific exam
   */
  async getTotalQuestionsCount(examNumber: number): Promise<number> {
    try {
      // This is a simplified version - in a real app, you'd need to pass userId
      // For now, we'll return a reasonable estimate based on exam number
      const estimates = {
        37: 100,
        38: 100,
        39: 100,
        40: 100
      };
      
      return estimates[examNumber] || 0;
    } catch (error) {
      console.error('❌ Error getting total questions count:', error);
      return 0;
    }
  }
}

export const questionService = new QuestionService();
