import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../config/firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase not configured - running in demo mode")
      setLoading(false)
      return
    }

    console.log("🔥 Setting up Firebase Auth listener")
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserProfile(userData)
            console.log('👤 User Profile Loaded:', {
              name: userData.name,
              role: userData.role,
              permissions: userData.permissions
            })
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      // Check if Firebase is configured for production
      if (!isFirebaseConfigured || !auth) {
        // Demo mode login
        if ((email === 'admin@assinfoso-kccr.org' && password === 'admin123') ||
            (email === 'member@assinfoso-kccr.org' && password === 'member123')) {
          
          const demoUser = {
            uid: email === 'admin@assinfoso-kccr.org' ? 'demo-admin' : 'demo-member',
            email: email,
            displayName: email === 'admin@assinfoso-kccr.org' ? 'Admin Demo' : 'Member Demo'
          }
          
          const demoProfile = {
            role: email === 'admin@assinfoso-kccr.org' ? 'admin' : 'member',
            permissions: email === 'admin@assinfoso-kccr.org' ? 
              ['read', 'write', 'admin', 'invite'] : 
              ['read'],
            name: demoUser.displayName,
            department: 'Infectious Disease Epidemiology',
            joinDate: new Date().toISOString()
          }
          
          setUser(demoUser)
          setUserProfile(demoProfile)
          toast.success('Successfully logged in! (Demo Mode)')
          return { user: demoUser }
        } else {
          throw new Error('Invalid demo credentials. Use admin@assinfoso-kccr.org/admin123 or member@assinfoso-kccr.org/member123')
        }
      }
      
      // Production Firebase login
      console.log("🔥 Attempting Firebase authentication...")
      const result = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Successfully logged in!')
      return result
    } catch (error) {
      toast.error(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Demo mode logout
      if (!isFirebaseConfigured || !auth) {
        setUser(null)
        setUserProfile(null)
        toast.success('Successfully logged out! (Demo Mode)')
        return
      }
      
      // Production Firebase logout
      await signOut(auth)
      toast.success('Successfully logged out!')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const createUser = async (email, password, userData) => {
    if (!isFirebaseConfigured || !auth || !db) {
      throw new Error('Firebase not configured for user creation. Please use demo credentials or set up Firebase.')
    }

    try {
      setLoading(true)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name
      await updateProfile(result.user, {
        displayName: userData.name
      })

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        ...userData,
        email: email,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        role: userData.role || 'member',
        permissions: userData.role === 'admin' ? 
          ['read', 'write', 'admin', 'invite'] : 
          ['read']
      })

      toast.success('User account created successfully!')
      return result
    } catch (error) {
      toast.error(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email, password, profileData) => {
    const userData = {
      name: `${profileData.firstName} ${profileData.lastName}`,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      institution: profileData.institution,
      department: profileData.department,
      position: profileData.position,
      location: profileData.location,
      role: 'member' // Default role for new signups
    }
    
    return await createUser(email, password, userData)
  }

  const updateUserProfile = async (updates) => {
    if (!isFirebaseConfigured || !auth || !db) {
      toast.error('Profile updates not available in demo mode')
      return
    }

    try {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true })
        setUserProfile(prev => ({ ...prev, ...updates }))
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      toast.error('Failed to update profile')
      throw error
    }
  }

  const isAdmin = () => {
    return userProfile?.role === 'admin'
  }

  const isMember = () => {
    return userProfile?.role === 'member' || userProfile?.role === 'admin'
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    signup,
    createUser,
    updateUserProfile,
    isAdmin,
    isMember
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
