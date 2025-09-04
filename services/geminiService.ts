import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Question, Language, User } from '../types';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker';


// --- Gemini AI Configuration ---
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// --- Firebase Configuration ---
// This now securely uses environment variables provided by the platform.
const firebaseConfig = {
  apiKey: "AIzaSyAz0sGVVytvGFVNW_0P7JuGlyS_U-wBx6A",
  authDomain: "tokutei-sensei.firebaseapp.com",
  projectId: "tokutei-sensei",
  storageBucket: "tokutei-sensei.firebasestorage.app",
  messagingSenderId: "296461231636",
  appId: "1:296461231636:web:f88bddbb61d555dc022901",
  measurementId: "G-C8T9P5KCZS"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Track Firestore connection status
let isFirestoreAvailable = true;

// Local Storage keys
const USER_STORAGE_KEY = 'kaigo_sensei_user';
const USER_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Local Storage utilities
const saveUserToStorage = (user: User) => {
  try {
    const userData = {
      ...user,
      cachedAt: new Date().getTime()
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    console.log('User data saved to localStorage');
  } catch (error) {
    console.warn('Failed to save user to localStorage:', error);
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    
    const userData = JSON.parse(stored);
    const now = new Date().getTime();
    
    // Check if cache is expired
    if (now - userData.cachedAt > USER_CACHE_EXPIRY) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
    
    console.log('User data loaded from localStorage');
    return userData;
  } catch (error) {
    console.warn('Failed to load user from localStorage:', error);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const clearUserFromStorage = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    console.log('User data cleared from localStorage');
  } catch (error) {
    console.warn('Failed to clear user from localStorage:', error);
  }
};

// Debug function to check Firestore status
export const checkFirestoreStatus = () => {
  console.log('Firestore Status:', {
    available: isFirestoreAvailable,
    projectId: db._delegate._databaseId.projectId,
    databaseId: db._delegate._databaseId.database
  });
};

// Tạm thời disable Firestore để tránh lỗi permissions
// TODO: Cấu hình Firestore rules và enable lại sau
console.log('Firestore temporarily disabled to avoid permissions errors');
isFirestoreAvailable = false;

// Create a wrapper for Firestore operations to handle errors gracefully
const safeFirestoreOperation = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  // If Firestore is not available, return fallback immediately
  if (!isFirestoreAvailable) {
    console.warn('Firestore not available, using fallback data');
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error: any) {
    console.warn('Firestore operation failed:', error);
    
    // Mark Firestore as unavailable if we get persistent errors
    if (error.code === 'unavailable' || error.message?.includes('offline') || error.code === 'permission-denied') {
      console.warn('Marking Firestore as unavailable due to persistent errors');
      isFirestoreAvailable = false;
      
      // Try to re-enable network once
      try {
        await db.enableNetwork();
        isFirestoreAvailable = true;
      } catch (networkError) {
        console.warn('Failed to re-enable network:', networkError);
      }
    }
    
    return fallback;
  }
};


/**
 * Cleans AI-generated text by removing markdown characters and trimming whitespace.
 * @param text The raw text from the AI.
 * @returns Cleaned, plain text.
 */
const cleanAiText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/^[#*+-]\s+/gm, '')
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2')
    .trim();
};

const chatModel = ai.chats.create({ 
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: "You are Mora Sensei, a friendly and knowledgeable AI tutor for Japanese Kaigo Fukushi (介護福祉士) exam students. Your answers should be clear, concise, and encouraging. Explain complex topics in simple terms. Your responses MUST be in plain text. Use line breaks for readability. Do NOT use markdown characters like asterisks, hashtags, or bullet points.",
  },
});

export const appService = {
  // --- Firebase Auth & User Methods ---
  signUpWithEmail: async (email: string, pass: string, fullName?: string, phoneNumber?: string) => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    
    // Cập nhật displayName nếu có
    if (fullName && userCredential.user) {
      await userCredential.user.updateProfile({
        displayName: fullName
      });
    }
    
    // Gửi email verification
    await userCredential.user?.sendEmailVerification();
    
    // Tạm thời disable Firestore để tránh lỗi permissions
    // TODO: Cấu hình Firestore rules và enable lại sau
    /*
    if (userCredential.user) {
      try {
        const userData = {
          email: userCredential.user.email,
          fullName: fullName || '',
          phoneNumber: phoneNumber || '',
          role: 'user-pro',
          createdAt: new Date(),
          emailVerified: false
        };
        
        await db.collection('users').doc(userCredential.user.uid).set(userData);
        console.log('User data saved to Firestore:', userData);
      } catch (firestoreError) {
        console.warn('Failed to save user data to Firestore:', firestoreError);
        // Không throw error vì đăng ký vẫn thành công
      }
    }
    */
    console.log('Firestore write temporarily disabled to avoid permissions error');
    
    // KHÔNG signOut ở đây để dialog có thể hiển thị
    // User sẽ được signOut khi click "Xác nhận" trong dialog hoặc khi onAuthStateChanged detect email chưa verify
    
    return userCredential;
  },
  signInWithEmail: async (email: string, pass: string) => {
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);
    // Kiểm tra email đã được verify chưa
    if (userCredential.user && !userCredential.user.emailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    return userCredential;
  },
  signOut: () => auth.signOut(),
  sendEmailVerification: () => {
    const user = auth.currentUser;
    if (user) {
      return user.sendEmailVerification();
    }
    throw new Error('No user logged in');
  },
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Try to get user data from localStorage first
        let cachedUser = getUserFromStorage();
        
        // If cached user exists and matches current user, use it
        if (cachedUser && cachedUser.uid === user.uid) {
          console.log('Using cached user data');
          callback(cachedUser);
          
          // Update lastLogin in background
          const updatedUser = { ...cachedUser, lastLogin: new Date() };
          saveUserToStorage(updatedUser);
          
          // Update Firestore in background
          safeFirestoreOperation(async () => {
            await db.collection('users').doc(user.uid).update({
              lastLogin: new Date()
            });
          }, undefined);
          
          return;
        }
        
        // Fetch user data from Firestore
        const userData = await safeFirestoreOperation(async () => {
          const userDoc = await db.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data() as User;
            console.log('User data loaded from Firestore:', data);
            return data;
          } else {
            // Create a user document if it doesn't exist
            const newUserData = { 
              email: user.email, 
              role: 'user-pro',
              createdAt: new Date(),
              lastLogin: new Date(),
              emailVerified: user.emailVerified,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              fullName: user.displayName || '',
              phoneNumber: ''
            };
            await db.collection('users').doc(user.uid).set(newUserData);
            console.log('New user created in Firestore:', newUserData);
            return newUserData as User;
          }
        }, { 
          uid: user.uid,
          email: user.email, 
          role: 'user-pro',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          fullName: user.displayName || '',
          phoneNumber: '',
          emailVerified: user.emailVerified
        } as User);
        
        const finalUser = { 
          uid: user.uid, 
          email: user.email, 
          role: userData.role || 'user-pro',
          displayName: userData.displayName || user.displayName || user.email?.split('@')[0] || 'User',
          fullName: userData.fullName || user.displayName || '',
          phoneNumber: userData.phoneNumber || '',
          emailVerified: userData.emailVerified || user.emailVerified
        };
        
        // Save to localStorage
        saveUserToStorage(finalUser);
        
        callback(finalUser);
      } else {
        // Clear localStorage when user logs out
        clearUserFromStorage();
        callback(null);
      }
    });
  },
  
  // --- Firestore Question Methods ---
  getPracticeQuestions: async (examNumber: number, topic: string): Promise<Question[]> => {
    return await safeFirestoreOperation(async () => {
      const snapshot = await db.collection('kaigo-fukushi-pro')
        .where('examNumber', '==', examNumber)
        .where('topic', '==', topic)
        .get();
      
      if (snapshot.empty) {
        console.warn(`No questions found for exam ${examNumber}, topic ${topic}`);
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Question));
    }, []);
  },

  saveExtractedQuestions: async (questions: Omit<Question, 'id'>[]): Promise<void> => {
    await safeFirestoreOperation(async () => {
      const batch = db.batch();
      const collectionRef = db.collection('kaigo-fukushi-pro');

      questions.forEach(questionData => {
        const docRef = collectionRef.doc(); // Create a new document with a unique ID
        batch.set(docRef, {
          ...questionData,
          createdAt: new Date(),
          createdBy: auth.currentUser?.uid || 'system'
        });
      });

      await batch.commit();
      console.log(`Successfully saved ${questions.length} questions to Firestore`);
    }, undefined);
  },

  // Debug method to test Firestore operations
  testFirestoreConnection: async (): Promise<boolean> => {
    try {
      const testDoc = await db.collection('_test').doc('connection-test').get();
      console.log('Firestore test successful:', testDoc.exists);
      return true;
    } catch (error) {
      console.error('Firestore test failed:', error);
      return false;
    }
  },


  // --- Gemini AI Methods ---
  async getMotivationalQuote(): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate a short, motivational quote for a student preparing for a difficult certification exam in Japan. Keep it under 20 words. Provide only the plain text of the quote.",
      });
      return cleanAiText(response.text);
    } catch (error) {
      console.error("Error fetching motivational quote:", error);
      return "Every step forward, no matter how small, is progress. Keep going!";
    }
  },

  async askKaigoSensei(message: string): Promise<string> {
    try {
      const response: GenerateContentResponse = await chatModel.sendMessage({ message });
      return cleanAiText(response.text);
    } catch (error) {
      console.error("Error with Mora Sensei chat:", error);
      return "I'm sorry, I'm having a little trouble right now. Please try again in a moment.";
    }
  },

  async translateText(text: string, targetLanguage: Language): Promise<string> {
    const languageMap = {
      en: 'English',
      vi: 'Vietnamese',
      ja: 'Japanese',
    };

    try {
       const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following Japanese text to ${languageMap[targetLanguage]}. The translation should be in plain text, well-formatted with appropriate line breaks for readability, and MUST NOT contain any markdown characters (like *, #, -). Text to translate: "${text}"`,
      });
      return cleanAiText(response.text);
    } catch (error) {
      console.error(`Error translating text to ${targetLanguage}:`, error);
      return "Sorry, I couldn't translate that right now.";
    }
  },

  async getQuestionHint(questionText: string, options: string[]): Promise<string> {
    try {
      const prompt = `For the following Japanese Kaigo Fukushi exam question, provide a short, one-sentence hint in Japanese to guide the student. The hint must NOT reveal the answer directly. It should be plain text, without any special formatting or markdown characters.

        Question: "${questionText}"
        Options:
        ${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

        Hint:`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return cleanAiText(response.text);
    } catch (error) {
      console.error("Error fetching question hint:", error);
      return "もう一度考えてみてください。キーワードは何ですか？ (Please think again. What is the key word?)";
    }
  },
  
  async processPdfToImages(file: File): Promise<{ base64: string, mimeType: string }[]> {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(fileBuffer).promise;
    const images: { base64: string, mimeType: string }[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            images.push({
                base64: dataUrl.split(',')[1],
                mimeType: 'image/jpeg'
            });
        }
    }
    return images;
  },

  // FIX: Updated the return type to Omit<Question, 'id' | 'examNumber'>[] as the examNumber is not known at this stage.
  async processExamDocument(file: File): Promise<Omit<Question, 'id' | 'examNumber'>[] | { error: string }> {
    try {
      let imageParts: { inlineData: { data: string, mimeType: string } }[] = [];
      
      if (file.type === 'application/pdf') {
          const images = await this.processPdfToImages(file);
          imageParts = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));
      } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve((reader.result as string).split(',')[1]);
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });
          imageParts = [{ inlineData: { data: base64, mimeType: file.type } }];
      } else {
          return { error: "Unsupported file type." };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            ...imageParts,
            {
              text: `
                Analyze these images of an exam paper. Identify all multiple-choice questions.
                Extract the question text, all options, and identify the correct answer's index (0-based).
                Provide a brief explanation for the correct answer. The explanation must be in plain text without any markdown formatting.
                The topic MUST be one of the following Japanese strings: '人間の尊厳と自立', '人間関係とコミュニケーション', '社会の理解', 'こころとからだのしくみ', '発達と老化の理解', '認知症の理解', '障害の理解', '医療的ケア', '介護の基本', 'コミュニケーション技術', '生活支援技術', '介護過程', '総合問題'.
                Return the result as a JSON object that matches the provided schema.
              `,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });
      
      const jsonText = response.text.trim();
      // The AI returns a structure with a 'questions' key
      const parsed = JSON.parse(jsonText) as { questions: Omit<Question, 'id' | 'examNumber'>[] };
      // Clean text fields
      return parsed.questions.map(q => ({ 
        ...q, 
        question: cleanAiText(q.question),
        explanation: cleanAiText(q.explanation),
        options: q.options.map(opt => cleanAiText(opt)),
      }));

    } catch (error) {
      console.error("Error processing exam document:", error);
      return { error: "Failed to process the document. The file might be unclear or the format is not supported. Please try again." };
    }
  },
};