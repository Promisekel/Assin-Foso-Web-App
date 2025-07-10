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

// Check if Firebase is properly configured - FORCE PRODUCTION MODE
const isFirebaseConfigured = true // Always use production Firebase
// Verify we have the essential config values
const hasEssentialConfig = firebaseConfig.apiKey && 
                          firebaseConfig.projectId && 
                          firebaseConfig.storageBucket &&
                          firebaseConfig.authDomain

if (!hasEssentialConfig) {
  console.error('❌ Missing essential Firebase configuration. Please check your .env file.')
  console.log('Required environment variables:')
  console.log('- VITE_FIREBASE_API_KEY')
  console.log('- VITE_FIREBASE_PROJECT_ID') 
  console.log('- VITE_FIREBASE_STORAGE_BUCKET')
  console.log('- VITE_FIREBASE_AUTH_DOMAIN')
}

console.log(`🔥 Firebase Configuration Status: ${hasEssentialConfig ? 'PRODUCTION' : 'MISSING CONFIG'}`)

// Debug Firebase configuration (remove in production)
if (hasEssentialConfig) {
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
  console.log("⚠️ Firebase configuration incomplete - some features may be disabled")
  console.log("📋 Please verify Firebase configuration in environment variables")
}

export { auth, db, storage, analytics, isFirebaseConfigured }
export default app
