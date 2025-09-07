// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app, analytics, auth, db;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Fallback configuration if initialization fails
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// Authentication service
export const authService = {
  // Sign up with email and password
  signUpWithEmail: async (email: string, password: string, fullName?: string, phoneNumber?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (fullName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
    }
    
    // Create user document in Firestore
    if (userCredential.user) {
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: fullName || '',
        fullName: fullName || '',
        phoneNumber: phoneNumber || '',
        role: 'user',
        emailVerified: false,
        createdAt: new Date(),
        lastLogin: null
      };
      
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      } catch (error) {
        console.warn('Failed to create user document in Firestore:', error);
        // Don't throw error here - user account creation should still succeed
        // even if Firestore write fails
      }
    }
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    return userCredential;
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Reload user to get latest email verification status
    await userCredential.user.reload();
    const updatedUser = auth.currentUser;
    
    // Check if email is verified
    if (updatedUser && !updatedUser.emailVerified) {
      // Sign out the user since they shouldn't be authenticated
      await signOut(auth);
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    
    return userCredential;
  },

  // Sign out
  signOut: () => signOut(auth),

  // Send email verification
  sendEmailVerification: () => {
    const user = auth.currentUser;
    if (user) {
      return sendEmailVerification(user);
    }
    throw new Error('No user logged in');
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser: () => auth.currentUser,

  // Force refresh user data
  refreshUser: async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      return auth.currentUser;
    }
    return null;
  },

  // Get user data from Firestore
  getUserData: async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  },

  // Update user last login
  updateLastLogin: async (uid: string) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        lastLogin: new Date()
      }, { merge: true });
    } catch (error) {
      console.warn('Failed to update last login:', error);
      // Don't throw error - this is not critical for app functionality
    }
  }
};

export { db };
export default app;