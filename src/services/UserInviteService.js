import { auth, db } from '../config/firebase'
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore'
import toast from 'react-hot-toast'

// User invitation system
export class UserInviteService {
  
  // Send invitation to new user
  static async sendInvitation(inviteData) {
    try {
      const { email, role, name, department, invitedBy } = inviteData
      
      // Check if user already exists
      const existingUsers = await getDocs(
        query(collection(db, 'users'), where('email', '==', email))
      )
      
      if (!existingUsers.empty) {
        throw new Error('User with this email already exists')
      }
      
      // Create invitation record
      const inviteRecord = {
        email,
        role,
        name,
        department,
        invitedBy,
        invitedAt: new Date(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
      
      const inviteRef = await addDoc(collection(db, 'invitations'), inviteRecord)
      
      // In a real app, you would send an email here
      // For now, we'll just create a temporary password and account
      await this.createUserFromInvitation(inviteRecord, inviteRef.id)
      
      toast.success(`Invitation sent to ${email}`)
      return inviteRef.id
      
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error(error.message)
      throw error
    }
  }
  
  // Create user account from invitation
  static async createUserFromInvitation(inviteData, inviteId) {
    try {
      const { email, role, name, department, invitedBy } = inviteData
      
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword)
      const user = userCredential.user
      
      // Update user profile
      await updateProfile(user, {
        displayName: name
      })
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        role,
        department,
        invitedBy,
        createdAt: new Date(),
        isFirstLogin: true,
        tempPassword: tempPassword, // Store temporarily - user should change this
        permissions: this.getRolePermissions(role),
        status: 'active'
      })
      
      // Update invitation status
      await updateDoc(doc(db, 'invitations', inviteId), {
        status: 'accepted',
        userId: user.uid,
        acceptedAt: new Date()
      })
      
      // Send password reset email so user can set their own password
      await sendPasswordResetEmail(auth, email)
      
      console.log(`User created: ${email} with temp password: ${tempPassword}`)
      
      return {
        userId: user.uid,
        tempPassword,
        email
      }
      
    } catch (error) {
      console.error('Error creating user from invitation:', error)
      throw error
    }
  }
  
  // Get role-based permissions
  static getRolePermissions(role) {
    const permissions = {
      admin: ['read', 'write', 'delete', 'invite', 'manage_users', 'analytics'],
      researcher: ['read', 'write', 'publish', 'manage_projects'],
      member: ['read', 'comment']
    }
    
    return permissions[role] || permissions.member
  }
  
  // Get pending invitations (admin only)
  static async getPendingInvitations() {
    try {
      const invitations = await getDocs(
        query(collection(db, 'invitations'), where('status', '==', 'pending'))
      )
      
      return invitations.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        invitedAt: doc.data().invitedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate()
      }))
      
    } catch (error) {
      console.error('Error getting pending invitations:', error)
      throw error
    }
  }
  
  // Cancel invitation
  static async cancelInvitation(inviteId) {
    try {
      await deleteDoc(doc(db, 'invitations', inviteId))
      toast.success('Invitation cancelled')
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      toast.error('Failed to cancel invitation')
      throw error
    }
  }
  
  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const users = await getDocs(collection(db, 'users'))
      
      return users.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLoginAt: doc.data().lastLoginAt?.toDate()
      }))
      
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  }
  
  // Update user role (admin only)
  static async updateUserRole(userId, newRole) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        permissions: this.getRolePermissions(newRole),
        updatedAt: new Date()
      })
      
      toast.success('User role updated successfully')
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
      throw error
    }
  }
}

export default UserInviteService
