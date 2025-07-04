import { storage, isFirebaseConfigured } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// Firebase Storage service for handling image uploads and management
class FirebaseStorageService {
  constructor() {
    // Production-ready storage service
    this.isConfigured = storage && typeof storage.ref === 'function'
    
    console.log(`🗂️ Firebase Storage Service: ${this.isConfigured ? 'READY ✅' : 'NOT AVAILABLE ❌'}`)
    
    if (!this.isConfigured) {
      console.error('❌ Firebase Storage is not available. Images will not be stored permanently.')
      console.error('Please check your Firebase configuration and storage permissions.')
    } else {
      // Check if we can access the bucket
      try {
        const testRef = ref(storage, 'test')
        console.log('✅ Firebase Storage bucket accessible:', storage.app.options.storageBucket)
      } catch (error) {
        console.error('❌ Error accessing Firebase Storage:', error.message)
      }
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

  // Upload image to Firebase Storage with enhanced error handling
  async uploadImage(file, albumId) {
    if (!this.isConfigured) {
      console.error('❌ Firebase Storage not configured - cannot upload file')
      throw new Error('Firebase Storage is not available. Please check your configuration.')
    }

    if (!file || !(file instanceof File || file instanceof Blob)) {
      console.error('❌ Invalid file object:', file)
      throw new Error('Invalid file object provided for upload')
    }

    if (!albumId) {
      console.error('❌ Missing albumId for upload')
      throw new Error('Album ID is required for uploading')
    }

    try {
      const fileName = this.generateFileName(file.name || `upload_${Date.now()}`)
      const safePath = `gallery/${albumId}/${fileName}`
      console.log(`🔷 Creating storage reference for path: ${safePath}`)
      
      const storageRef = ref(storage, safePath)
      
      console.log('📤 Starting upload to Firebase Storage:', fileName)
      
      // Upload file with metadata
      const metadata = {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          originalName: file.name || 'upload',
          uploadedAt: new Date().toISOString(),
          albumId: albumId
        }
      }
      
      const snapshot = await uploadBytes(storageRef, file, metadata)
      console.log('✅ File uploaded successfully, getting download URL...')
      
      // Get download URL with retry logic
      let downloadURL = null
      let retries = 0
      const maxRetries = 3
      
      while (!downloadURL && retries < maxRetries) {
        try {
          downloadURL = await getDownloadURL(snapshot.ref)
        } catch (urlError) {
          console.warn(`⚠️ Failed to get download URL (attempt ${retries + 1}/${maxRetries})`, urlError)
          retries++
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      if (!downloadURL) {
        throw new Error('Failed to get download URL after multiple attempts')
      }
      
      console.log('✅ Upload complete with URL:', downloadURL)
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        fileName: fileName,
        size: file.size,
        type: file.type || 'image/jpeg',
        isFirebase: true
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

  // Upload multiple images to Firebase Storage with enhanced progress reporting
  async uploadMultipleImages(files, albumId, onProgress) {
    if (!this.isConfigured) {
      console.error('❌ Firebase Storage not available - cannot upload files')
      throw new Error('Firebase Storage is not available. Please check your configuration.')
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      console.error('❌ No valid files provided for upload')
      throw new Error('No valid files provided for upload')
    }

    if (!albumId) {
      console.error('❌ Missing albumId for upload')
      throw new Error('Album ID is required for uploading')
    }

    console.log(`🚀 Starting Firebase upload batch: ${files.length} files to album: ${albumId}`)
    const results = []
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const currentIndex = i
      
      try {
        // Update progress at start of each file
        if (onProgress) {
          onProgress(currentIndex, files.length, file.name)
        }
        
        console.log(`📤 Uploading file ${currentIndex + 1}/${files.length}: ${file.name}`)
        const result = await this.uploadImage(file, albumId)
        
        successCount++
        results.push({
          ...result,
          originalFile: file,
          success: true
        })
        
        // Update progress after successful upload
        if (onProgress) {
          onProgress(currentIndex + 1, files.length, file.name)
        }
        
        console.log(`✅ Upload ${currentIndex + 1}/${files.length} successful: ${file.name}`)
        
      } catch (error) {
        failCount++
        console.error(`❌ Upload ${currentIndex + 1}/${files.length} failed: ${file.name}`, error)
        
        results.push({
          originalFile: file,
          error: error.message || 'Upload failed',
          success: false
        })
        
        // Still update progress even for failed uploads
        if (onProgress) {
          onProgress(currentIndex + 1, files.length, file.name)
        }
      }
    }
    
    const summary = {
      total: files.length,
      success: successCount,
      failed: failCount
    }
    
    console.log(`🏁 Upload batch complete:`, summary)
    return results
  }
}

export const storageService = new FirebaseStorageService()
export default FirebaseStorageService
