// Import the functions you need from the Firebase v10 SDK
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey && 
                             firebaseConfig.projectId && 
                             !firebaseConfig.apiKey.includes('demo') &&
                             firebaseConfig.apiKey !== 'your-api-key' &&
                             firebaseConfig.apiKey !== 'your-actual-firebase-api-key'

console.log(`🔥 Firebase Configuration Status: ${isFirebaseConfigured ? 'PRODUCTION' : 'DEMO MODE'}`)

// Debug Firebase configuration (remove in production)
if (isFirebaseConfigured) {
  console.log('🔧 Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket
  })
}

// Initialize Firebase
let app = null
let auth = null
let db = null
let storage = null
let analytics = null

if (isFirebaseConfigured) {
  try {
    console.log('🚀 Initializing Firebase with production config...')
    
    // Initialize Firebase app
    app = initializeApp(firebaseConfig)
    
    // Initialize Firebase services
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    
    // Initialize analytics only in browser environment
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
    
    console.log("✅ Firebase initialized successfully with production config")
    console.log(`🔥 Project: ${firebaseConfig.projectId}`)
  } catch (error) {
    console.error("❌ Firebase initialization error:", error)
    console.warn("Please check your Firebase configuration")
  }
} else {
  console.log("🎭 Firebase running in demo mode - real authentication disabled")
  console.log("📋 To enable production mode, add your Firebase config to .env file")
}

export { auth, db, storage, analytics, isFirebaseConfigured }
export default app
