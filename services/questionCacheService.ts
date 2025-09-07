import { FirestoreQuestion } from './questionService';

interface CachedQuestions {
  questions: FirestoreQuestion[];
  timestamp: number;
  subject: string;
  userId: string;
  examNumber?: number;
}

class QuestionCacheService {
  private readonly CACHE_PREFIX = 'mora-sensei-questions-';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Generate cache key for a specific user, subject, and exam number
   */
  private getCacheKey(userId: string, subject: string, examNumber?: number): string {
    if (examNumber) {
      return `${this.CACHE_PREFIX}${userId}-${subject}-exam${examNumber}`;
    }
    return `${this.CACHE_PREFIX}${userId}-${subject}`;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(timestamp: number): boolean {
    const now = Date.now();
    return (now - timestamp) < this.CACHE_DURATION;
  }

  /**
   * Get cached questions for a subject and exam number
   */
  getCachedQuestions(userId: string, subject: string, examNumber?: number): FirestoreQuestion[] | null {
    try {
      const cacheKey = this.getCacheKey(userId, subject, examNumber);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const cachedData: CachedQuestions = JSON.parse(cached);
      
      // Check if cache is valid
      if (!this.isCacheValid(cachedData.timestamp)) {
        console.log(`Cache expired for ${subject}${examNumber ? ` exam ${examNumber}` : ''}, removing...`);
        this.clearCache(userId, subject, examNumber);
        return null;
      }

      // Verify cache belongs to current user
      if (cachedData.userId !== userId) {
        console.log(`Cache user mismatch for ${subject}${examNumber ? ` exam ${examNumber}` : ''}, clearing...`);
        this.clearCache(userId, subject, examNumber);
        return null;
      }
      return cachedData.questions;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Cache questions for a subject and exam number
   */
  cacheQuestions(userId: string, subject: string, questions: FirestoreQuestion[], examNumber?: number): void {
    try {
      const cacheKey = this.getCacheKey(userId, subject, examNumber);
      const cachedData: CachedQuestions = {
        questions: questions,
        timestamp: Date.now(),
        subject: subject,
        userId: userId,
        examNumber: examNumber
      };

      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
      console.log(`Cached ${questions.length} questions for ${subject}${examNumber ? ` exam ${examNumber}` : ''}`);
    } catch (error) {
      console.error('Error caching questions:', error);
    }
  }

  /**
   * Clear cache for a specific subject and exam number
   */
  clearCache(userId: string, subject: string, examNumber?: number): void {
    try {
      const cacheKey = this.getCacheKey(userId, subject, examNumber);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear all cached questions for a user
   */
  clearAllCache(userId: string): void {
    try {
      const keys = Object.keys(localStorage);
      const userCacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) && key.includes(userId)
      );

      userCacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`Cleared ${userCacheKeys.length} cache entries for user`);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo(userId: string): { subject: string; count: number; age: string }[] {
    try {
      const keys = Object.keys(localStorage);
      const userCacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) && key.includes(userId)
      );

      return userCacheKeys.map(key => {
        const cached = localStorage.getItem(key);
        if (cached) {
          const data: CachedQuestions = JSON.parse(cached);
          const age = Math.round((Date.now() - data.timestamp) / (1000 * 60 * 60)); // hours
          return {
            subject: data.subject,
            count: data.questions.length,
            age: `${age}h ago`
          };
        }
        return { subject: 'unknown', count: 0, age: 'unknown' };
      });
    } catch (error) {
      console.error('Error getting cache info:', error);
      return [];
    }
  }

  /**
   * Force refresh cache by clearing and returning null
   */
  forceRefresh(userId: string, subject: string, examNumber?: number): null {
    this.clearCache(userId, subject, examNumber);
    return null;
  }

  /**
   * Clear all old cache entries (without exam number) for a user and subject
   */
  clearOldCache(userId: string, subject: string): void {
    try {
      const cacheKey = this.getCacheKey(userId, subject); // Without exam number
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error clearing old cache:', error);
    }
  }
}

export const questionCacheService = new QuestionCacheService();
