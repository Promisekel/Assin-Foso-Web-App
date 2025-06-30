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
const isDemoMode = firebaseConfig.apiKey === "demo-api-key" || 
                   firebaseConfig.apiKey === "demo-api-key-replace-with-real" ||
                   !import.meta.env.VITE_FIREBASE_API_KEY ||
                   import.meta.env.VITE_FIREBASE_API_KEY.includes('demo')

if (isDemoMode) {
  console.warn("🚨 Firebase Demo Mode: Skipping Firebase initialization. Authentication will use demo mode.")
}

// Initialize Firebase
let app = null
let auth = null
let db = null
let storage = null
let analytics = null

// Only initialize Firebase with real credentials
if (!isDemoMode) {
  try {
    app = initializeApp(firebaseConfig)
    
    // Initialize Firebase services
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    
    // Only initialize analytics in production with real config
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
    
    console.log("✅ Firebase initialized successfully")
  } catch (error) {
    console.error("❌ Firebase initialization error:", error)
    console.warn("Falling back to demo mode")
  }
} else {
  console.log("🎭 Running in Firebase demo mode")
}

export { auth, db, storage, analytics }
export default app
