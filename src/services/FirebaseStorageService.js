import { storage, isFirebaseConfigured } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// Firebase Storage service for handling image uploads and management
class FirebaseStorageService {
  constructor() {
    // Force production mode - always try to use Firebase
    this.isConfigured = isFirebaseConfigured && storage
    console.log(`🗂️ Storage Service initialized: ${this.isConfigured ? 'Firebase Storage' : 'No Storage'}`)
    
    if (!this.isConfigured) {
      console.error('❌ Firebase Storage not available. Check your Firebase configuration.')
    } else {
      console.log('✅ Firebase Storage ready for uploads')
    }
  }

  // Generate unique filename with current date/time
  generateFileName(originalName) {
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5) // Format: 2025-07-02T08-30-45
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

  // Upload multiple images to Firebase Storage
  async uploadMultipleImages(files, albumId, onProgress) {
    if (!this.isConfigured) {
      throw new Error('Firebase Storage is not configured. Please check your .env file and Firebase setup.')
    }

    console.log(`🚀 Starting Firebase upload for ${files.length} files to album: ${albumId}`)
    const results = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        // Call progress callback before starting upload
        if (onProgress) {
          onProgress(i + 1, files.length, file.name)
        }
        
        console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`)
        const result = await this.uploadImage(file, albumId)
        
        results.push({
          ...result,
          originalFile: file,
          success: true
        })
        
        console.log(`✅ Successfully uploaded: ${file.name}`)
        
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error)
        results.push({
          originalFile: file,
          error: error.message,
          success: false
        })
      }
    }
    
    console.log(`🏁 Upload batch complete: ${results.filter(r => r.success).length}/${files.length} successful`)
    return results
  }
}

export const storageService = new FirebaseStorageService()
export default FirebaseStorageService
