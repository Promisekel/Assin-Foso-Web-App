import { storage, isFirebaseConfigured } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// Firebase Storage service for handling image uploads and management
class FirebaseStorageService {
  constructor() {
    this.isConfigured = isFirebaseConfigured && storage
  }

  // Generate unique filename with current date/time
  generateFileName(originalName) {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5) // Format: 2025-07-01T15-30-45
    const extension = originalName.split('.').pop()
    const cleanName = originalName.split('.').slice(0, -1).join('.')
    return `${timestamp}_${cleanName}.${extension}`
  }

  // Upload image to Firebase Storage
  async uploadImage(file, albumId) {
    if (!this.isConfigured) {
      throw new Error('Firebase Storage not configured')
    }

    try {
      const fileName = this.generateFileName(file.name)
      const storageRef = ref(storage, `gallery/${albumId}/${fileName}`)
      
      console.log('📤 Uploading to Firebase Storage:', fileName)
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      console.log('✅ Upload successful:', downloadURL)
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        fileName: fileName,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('❌ Firebase upload error:', error)
      throw error
    }
  }

  // Delete image from Firebase Storage
  async deleteImage(imagePath) {
    if (!this.isConfigured) {
      throw new Error('Firebase Storage not configured')
    }

    try {
      const imageRef = ref(storage, imagePath)
      await deleteObject(imageRef)
      console.log('🗑️ Image deleted from Firebase Storage:', imagePath)
      return true
    } catch (error) {
      console.error('❌ Firebase delete error:', error)
      throw error
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, albumId, onProgress) {
    if (!this.isConfigured) {
      // Fallback to local storage for demo mode
      return this.uploadImagesLocal(files, albumId, onProgress)
    }

    const results = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        // Call progress callback
        if (onProgress) {
          onProgress(i, files.length, file.name)
        }
        
        const result = await this.uploadImage(file, albumId)
        results.push({
          ...result,
          originalFile: file,
          success: true
        })
      } catch (error) {
        results.push({
          originalFile: file,
          error: error.message,
          success: false
        })
      }
    }
    
    return results
  }

  // Fallback local storage for demo mode - INSTANT upload
  uploadImagesLocal(files, albumId, onProgress) {
    console.log('🎭 Demo mode: Processing', files.length, 'files instantly')
    
    return new Promise((resolve) => {
      const results = []
      
      // Process all files INSTANTLY without any delays
      files.forEach((file, index) => {
        // Immediate progress update
        if (onProgress) {
          onProgress(index + 1, files.length, file.name)
        }
        
        // Create local URL for demo
        const localURL = URL.createObjectURL(file)
        const fileName = this.generateFileName(file.name)
        
        results[index] = {
          url: localURL,
          path: `demo/gallery/${albumId}/${fileName}`,
          fileName: fileName,
          size: file.size,
          type: file.type,
          originalFile: file,
          success: true,
          isDemo: true
        }
      })
      
      // Resolve immediately - no delays at all
      console.log('✅ Demo upload completed instantly for', files.length, 'files')
      resolve(results)
    })
  }
}

export const storageService = new FirebaseStorageService()
export default FirebaseStorageService
