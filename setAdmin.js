// One-time Admin Setup Script
// Run this AFTER you've created your account through the sign-up process

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

// Your Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: "AIzaSyC4HUNt-kqrzp0R5bydh_WSxnaZu1N5yTU",
  authDomain: "assin-foso-online.firebaseapp.com",
  projectId: "assin-foso-online",
  storageBucket: "assin-foso-online.firebasestorage.app",
  messagingSenderId: "763061220951",
  appId: "1:763061220951:web:0b1b3c52307ad4f9a9d512",
  measurementId: "G-PQ2VEGDEPN"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Function to set user as admin
async function setUserAsAdmin(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    
    await updateDoc(userRef, {
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin', 'invite'],
      updatedAt: new Date(),
      isAdmin: true
    })
    
    console.log('✅ User successfully promoted to admin!')
    console.log(`User ID: ${userId}`)
    console.log('Role: admin')
    console.log('Permissions: read, write, delete, admin, invite')
    
  } catch (error) {
    console.error('❌ Error setting admin role:', error)
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Alternative methods to set admin role:')
      console.log('1. Use Firebase Console (Recommended):')
      console.log('   - Go to: https://console.firebase.google.com/project/assin-foso-online/firestore')
      console.log('   - Navigate to: Firestore Database > users collection')
      console.log(`   - Find document: ${userId}`)
      console.log('   - Edit the document and add:')
      console.log('     role: "admin"')
      console.log('     permissions: ["read", "write", "delete", "admin", "invite"]')
      console.log('')
      console.log('2. Or temporarily modify Firestore rules to allow initial admin setup')
    }
  }
}

// Instructions
console.log('🚀 Admin Setup Script')
console.log('====================')
console.log('')
console.log('STEP 1: Create your account first')
console.log('- Go to: http://localhost:3000')
console.log('- Click "Sign up here"')
console.log('- Fill out the registration form')
console.log('- Complete the account creation')
console.log('')
console.log('STEP 2: Get your User ID')
console.log('- After creating account, check browser console for your User ID')
console.log('- Or check Firebase Console > Authentication > Users')
console.log('')
console.log('STEP 3: Run this script with your User ID')
console.log('Example: node setAdmin.js YOUR_USER_ID_HERE')
console.log('')

// Get userId from command line arguments
const userId = process.argv[2]

if (!userId) {
  console.log('❌ Please provide your User ID as an argument')
  console.log('Usage: node setAdmin.js YOUR_USER_ID')
  console.log('')
  console.log('To find your User ID:')
  console.log('1. Create your account at http://localhost:3000')
  console.log('2. Check browser console or Firebase Console > Authentication')
  console.log('3. Copy your User ID and run: node setAdmin.js YOUR_USER_ID')
} else {
  console.log(`Setting user ${userId} as admin...`)
  setUserAsAdmin(userId)
}
