// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:', missingEnvVars)
  console.error('Please check your .env file and ensure all Firebase variables are set')
}

// Check if we're using demo credentials or missing config
const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                   import.meta.env.VITE_FIREBASE_API_KEY.includes('demo') ||
                   missingEnvVars.length > 0

if (isDemoMode) {
  console.warn("🚨 Firebase Demo Mode: Missing or invalid Firebase configuration. Please set up real Firebase credentials.")
}

// Initialize Firebase
let app = null
let auth = null
let db = null
let storage = null
let analytics = null

if (!isDemoMode) {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig)
    
    // Initialize Firebase services
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    
    // Initialize analytics in production
    if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      analytics = getAnalytics(app)
    }
    
    console.log("✅ Firebase initialized successfully with project:", firebaseConfig.projectId)
  } catch (error) {
    console.error("❌ Firebase initialization error:", error)
    console.warn("Check your Firebase configuration and try again")
  }
} else {
  console.log("🎭 Running in Firebase demo mode - Set up real Firebase credentials to enable authentication")
}

export { auth, db, storage, analytics }
export default app
