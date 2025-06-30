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
