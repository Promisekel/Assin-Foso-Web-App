// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DEMO123"
}

// Check if we're using demo credentials
const isDemoMode = firebaseConfig.apiKey === "demo-api-key"

if (isDemoMode) {
  console.warn("🚨 Firebase Demo Mode: Using placeholder credentials. Authentication will not work until you configure real Firebase credentials.")
}

// Initialize Firebase
let app, auth, db, storage, analytics

try {
  app = initializeApp(firebaseConfig)
  
  // Initialize Firebase services
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  
  // Only initialize analytics in production with real config
  if (!isDemoMode && typeof window !== 'undefined') {
    analytics = getAnalytics(app)
  }
} catch (error) {
  console.error("Firebase initialization error:", error)
  console.warn("Running in demo mode - Firebase features will be limited")
}

export { auth, db, storage, analytics }
export default app
