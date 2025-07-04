import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, Check, Loader } from 'lucide-react'
import { apiService } from '../services/api'
import { useAuth } from '../contexts/NewAuthContext'
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
      // Clean up object URL
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }, [])

  // Upload all files using new API
  const handleUpload = async () => {
    if (files.length === 0) {
      return
    }

    setUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    console.log(`🚀 Starting upload process for ${pendingFiles.length} files to album: ${albumId}`)

    try {
      // Validate albumId before proceeding
      if (!albumId) {
        throw new Error('Album ID is required for uploading')
      }

      // Check if user is admin
      if (!user || user.role !== 'ADMIN') {
        throw new Error('Only administrators can upload images')
      }

      // Update all pending files to uploading status
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' } : f
      ))

      // Reset all progress indicators
      setUploadProgress({})
      
      // Upload files one by one to the new API
      const uploadResults = []
      
      for (let i = 0; i < pendingFiles.length; i++) {
        const fileItem = pendingFiles[i]
        
        try {
          // Create FormData for file upload
          const formData = new FormData()
          formData.append('image', fileItem.file)
          formData.append('albumId', albumId)
          formData.append('title', fileItem.name.split('.')[0])
          formData.append('description', `Uploaded to ${albumName} album`)
          
          // Update progress to show uploading
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 50
          }))
          
          // Upload via new API
          const result = await apiService.uploadImage(formData)
          
          // Update progress to complete
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 100
          }))
          
          // Mark file as successful
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'success' } : f
          ))
          
          uploadResults.push({
            success: true,
            data: result,
            fileName: fileItem.name
          })
          
        } catch (uploadError) {
          console.error(`Upload failed for ${fileItem.name}:`, uploadError)
          
          // Mark file as failed
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: 'error',
              error: uploadError.message || 'Upload failed'
            } : f
          ))
          
          uploadResults.push({
            success: false,
            error: uploadError.message || 'Upload failed',
            fileName: fileItem.name
          })
        }
      }

      console.log('✅ Upload results:', uploadResults)

      // Count the successful uploads
      const successfulUploads = uploadResults.filter(result => result.success)
      console.log(`📊 Upload summary: ${successfulUploads.length} of ${uploadResults.length} successful`)
      
      if (successfulUploads.length > 0) {
        // Show success toast
        toast.success(`Successfully uploaded ${successfulUploads.length} image(s)`)
        
        // Call upload complete callback
        if (onUploadComplete && typeof onUploadComplete === 'function') {
          try {
            console.log('📤 Notifying gallery of new uploads')
            onUploadComplete(successfulUploads.map(result => result.data))
            console.log('✅ Images successfully added to gallery')
          } catch (error) {
            console.error('❌ Error in onUploadComplete callback:', error)
          }
        }
        
        // Close the modal after a short delay
        setTimeout(() => {
          if (onClose && typeof onClose === 'function') {
            onClose()
          }
        }, 1000)
      } else {
        toast.error('No files were uploaded successfully')
      }

    } catch (error) {
      console.error('❌ Upload process failed:', error)
      toast.error(error.message || 'Upload failed')
      
      // Mark all uploading files as failed
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { 
          ...f, 
          status: 'error', 
          error: error.message || 'Upload failed'
        } : f
      ))
    } finally {
      setUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <ImageIcon className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Images</h2>
            <p className="text-sm text-gray-600">Album: {albumName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {dragOver ? 'Drop files here' : 'Choose files or drag and drop'}
            </p>
            <p className="text-sm text-gray-600">
              PNG, JPG, GIF up to 10MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={file.preview}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      {file.status === 'error' && file.error && (
                        <p className="text-xs text-red-500">{file.error}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      {uploadProgress[file.id] && (
                        <span className="text-xs text-gray-500">
                          {uploadProgress[file.id]}%
                        </span>
                      )}
                      {file.status === 'pending' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {files.filter(f => f.status === 'success').length} of {files.length} uploaded
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.filter(f => f.status === 'pending').length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {uploading && <Loader className="w-4 h-4 animate-spin" />}
              <span>
                {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Files`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageUpload
