import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, Check, Loader } from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const ImageUpload = ({ albumId, albumName, onUploadComplete, onClose }) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const { user } = useAuth()

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(file => {
      const isImage = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isImage && isValidSize
    })

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      status: 'pending' // pending, uploading, success, error
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = e.dataTransfer.files
    handleFileSelect(droppedFiles)
  }, [handleFileSelect])

  // Remove file
  const removeFile = useCallback((fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Clean up preview URL
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }, [])

  // Upload all files using Firebase Storage - enhanced for reliability
  const handleUpload = async () => {
    if (files.length === 0) {
      return
    }

    setUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    console.log(`🚀 Starting upload process for ${pendingFiles.length} files to album: ${albumId || 'unknown'}`)

    try {
      // Validate albumId before proceeding
      if (!albumId) {
        throw new Error('Album ID is required for uploading')
      }

      // Check if storage service is available
      if (!storageService) {
        throw new Error('Storage service is not available')
      }

      // Update all pending files to uploading status
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' } : f
      ))

      // Reset all progress indicators
      setUploadProgress({})
      
      // Log upload details
      console.log('📁 Upload details:')
      console.log(`- Album ID: ${albumId}`)
      console.log(`- Files: ${pendingFiles.length}`)
      console.log('- File names:', pendingFiles.map(f => f.file.name))
      
      // Progress tracking function for Firebase uploads
      const trackProgress = (current, total, filename) => {
        // Find the file that matches this filename
        const currentFile = pendingFiles.find(f => f.file.name === filename)
        if (currentFile) {
          // Calculate progress percentage
          const progress = Math.round((current / total) * 100)
          console.log(`📈 File progress - ${filename}: ${progress}%`)
          
          // Update the UI progress
          setUploadProgress(prev => ({
            ...prev,
            [currentFile.id]: progress
          }))
          
          // Mark as success when reaching 100%
          if (progress >= 100) {
            setFiles(prev => prev.map(f => 
              f.id === currentFile.id ? { ...f, status: 'success' } : f
            ))
          }
        }
      }
      
      // Begin upload using Firebase Storage Service
      console.log('� Initiating Firebase Storage upload...')
      const uploadResults = await storageService.uploadMultipleImages(
        pendingFiles.map(f => f.file),
        albumId,
        trackProgress
      )

      console.log('✅ Upload results:', uploadResults)

      // Update file statuses based on results
      uploadResults.forEach((result, index) => {
        const fileItem = pendingFiles[index]
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: result.success ? 'success' : 'error',
            error: result.error 
          } : f
        ))
        
        // Set final progress to 100% for successful uploads
        if (result.success) {
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 100
          }))
        }
      })

      console.log('✅ Processing successful uploads for gallery integration')
      
      // Count the successful uploads
      const successfulUploads = uploadResults.filter(result => result.success)
      console.log(`📊 Upload summary: ${successfulUploads.length} of ${uploadResults.length} successful`)
      
      if (successfulUploads.length === 0) {
        console.warn('⚠️ No successful uploads to process')
        throw new Error('No files were uploaded successfully')
      }
      
      // Create image records compatible with gallery
      const uploadedImages = successfulUploads.map((result, index) => {
        const now = new Date()
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const uniqueId = `img_${Date.now()}_${index}_${Math.floor(Math.random() * 10000)}`
        
        // Build the image record with all required fields
        return {
          id: uniqueId,
          albumId: albumId,
          title: result.fileName || `IMG_${timestamp}`,
          description: `Uploaded to ${albumName} album on ${now.toLocaleDateString()}`,
          url: result.url,
          thumbnail: result.url,
          storagePath: result.path, // Store Firebase path for deletion
          fileName: result.fileName,
          tags: ['uploaded', albumName.toLowerCase().replace(/\s+/g, '-'), 'new'],
          uploadedBy: 'Admin User',
          uploadedAt: now.toISOString(),
          createdAt: now.toISOString(),
          views: 0,
          likes: 0,
          size: result.size,
          type: result.type,
          isFirebase: true // Now we're always using Firebase
        }
      })

      console.log('✨ Prepared gallery images:', uploadedImages.length)
      
      // Call upload complete callback with proper error handling
      if (onUploadComplete && typeof onUploadComplete === 'function') {
        try {
          console.log('📤 Adding images to gallery via callback')
          onUploadComplete(uploadedImages)
          console.log('✅ Images successfully added to gallery')
        } catch (error) {
          console.error('❌ Error in onUploadComplete callback:', error)
          throw new Error('Failed to add images to gallery: ' + error.message)
        }
      } else {
        console.warn('⚠️ No onUploadComplete handler provided')
      }

      // Show success state with delay before closing
      console.log('🎉 Upload process complete!')
      
      // Close the modal after a short delay
      const closeDelay = 800 // ms
      console.log(`⏱️ Closing upload modal in ${closeDelay}ms...`)
      
      setTimeout(() => {
        if (onClose && typeof onClose === 'function') {
          try {
            console.log('🚪 Closing upload modal')
            onClose()
          } catch (error) {
            console.error('❌ Error closing modal:', error)
          }
        } else {
          console.warn('⚠️ No onClose handler provided')
        }
      }, closeDelay) // Give time to see the success state

    } catch (error) {
      console.error('❌ Upload process failed:', error)
      
      // User-friendly error message
      let errorMessage = 'Upload failed: ' + (error.message || 'Unknown error')
      
      // Handle specific errors with more helpful messages
      if (errorMessage.includes('storage/unauthorized')) {
        errorMessage = 'Firebase Storage access denied. Please check your permissions and login status.'
      } else if (errorMessage.includes('storage/quota-exceeded')) {
        errorMessage = 'Storage quota exceeded. Please contact the administrator.'
      } else if (errorMessage.includes('auth/')) {
        errorMessage = 'Authentication error. Please try logging in again.'
      }
      
      // Mark all uploading files as failed
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { 
          ...f, 
          status: 'error', 
          error: errorMessage
        } : f
      ))
      
      // Display error toast if available
      if (window.toast && typeof window.toast.error === 'function') {
        window.toast.error(errorMessage)
      }
      
    } finally {
      // Ensure we reset loading state regardless of success or failure
      setUploading(false)
      console.log('🔄 Upload process finished - UI state reset')
    }
  }

  // Quick upload option - skip the delay and close immediately on success
  const handleQuickUpload = useCallback(() => {
    if (onUploadComplete && typeof onUploadComplete === 'function') {
      // Get successful uploads
      const successfulFiles = files.filter(f => f.status === 'success')
      if (successfulFiles.length > 0) {
        try {
          // Create quick image records for successful uploads
          const quickImages = successfulFiles.map((fileItem, index) => {
            const now = new Date()
            const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
            
            return {
              id: Date.now() + index + Math.random(),
              albumId: albumId,
              title: `IMG_${timestamp}`,
              description: `Uploaded to ${albumName} album`,
              url: fileItem.preview,
              thumbnail: fileItem.preview,
              tags: ['uploaded', 'quick'],
              uploadedBy: 'Current User',
              uploadedAt: now.toISOString(),
              createdAt: now.toISOString(),
              views: 0,
              likes: 0,
              size: fileItem.size,
              type: fileItem.file.type,
              isDemo: true
            }
          })
          
          onUploadComplete(quickImages)
        } catch (error) {
          console.error('Error in quick upload:', error)
        }
      }
    }
    
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }, [files, albumId, albumName, onUploadComplete, onClose])

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) {
      return '0 Bytes'
    }
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status icon
  const getStatusIcon = (status, fileId) => {
    switch (status) {
      case 'uploading':
        return <Loader className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Images</h2>
            <p className="text-sm text-gray-600 mt-1">Upload images to "{albumName}" album</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragOver
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop images here or click to browse
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Support: JPG, PNG, GIF up to 10MB each
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary inline-flex items-center"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Select Images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="border-t border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Images ({files.length})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-3">
                {files.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      <img
                        src={fileItem.preview}
                        alt={fileItem.name}
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(fileItem.size)}
                      </p>
                    </div>

                    {/* Progress */}
                    {fileItem.status === 'uploading' && (
                      <div className="flex-shrink-0 w-24">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${uploadProgress[fileItem.id] || 0}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1 text-center">
                          {Math.round(uploadProgress[fileItem.id] || 0)}%
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {getStatusIcon(fileItem.status, fileItem.id)}
                      {fileItem.status === 'pending' && (
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {files.filter(f => f.status === 'success').length > 0 && (
              <span className="text-green-600 font-medium">
                ✓ {files.filter(f => f.status === 'success').length} of {files.length} uploaded successfully
              </span>
            )}
            {files.filter(f => f.status === 'error').length > 0 && (
              <span className="text-red-600 font-medium">
                ✗ {files.filter(f => f.status === 'error').length} failed to upload
              </span>
            )}
            {!uploading && files.length > 0 && files.every(f => f.status !== 'pending') && (
              <span className="text-gray-600">Upload complete!</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            
            {/* Quick Upload Button - for immediate results */}
            {files.some(f => f.status === 'success') && (
              <button
                onClick={handleQuickUpload}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Use Uploaded ({files.filter(f => f.status === 'success').length})
              </button>
            )}
            
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading || files.every(f => f.status !== 'pending')}
              className="btn-primary relative"
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.filter(f => f.status === 'pending').length} Images
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUpload
