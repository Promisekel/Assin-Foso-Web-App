import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
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
    // Check if Firebase is properly initialized
    if (!auth) {
      console.warn("Firebase Auth not initialized - running in demo mode")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data())
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
      
      // Demo mode login
      if (!auth) {
        // Check demo credentials
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
      
      // Real Firebase login
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
      if (!auth) {
        setUser(null)
        setUserProfile(null)
        toast.success('Successfully logged out! (Demo Mode)')
        return
      }
      
      // Real Firebase logout
      await signOut(auth)
      toast.success('Successfully logged out!')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const createUser = async (email, password, userData) => {
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
        role: userData.role || 'member'
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

  const updateUserProfile = async (updates) => {
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
