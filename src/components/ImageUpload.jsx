import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, Check, Loader } from 'lucide-react'

const ImageUpload = ({ albumId, albumName, onUploadComplete, onClose }) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

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

  // Simulate upload progress (replace with actual upload logic)
  const uploadFile = async (fileItem) => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          resolve()
        }
        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: progress
        }))
      }, 200)
    })
  }

  // Upload all files
  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')

    try {
      // Update files status to uploading
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' } : f
      ))

      // Upload files concurrently
      await Promise.all(
        pendingFiles.map(async (fileItem) => {
          try {
            await uploadFile(fileItem)
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, status: 'success' } : f
            ))
          } catch (error) {
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, status: 'error' } : f
            ))
          }
        })
      )

      // Simulate creating image records that are compatible with gallery
      const uploadedImages = pendingFiles.map((fileItem, index) => ({
        id: Date.now() + index + Math.random(), // Ensure unique ID
        albumId: albumId,
        title: fileItem.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: `Uploaded to ${albumName} album`,
        url: fileItem.preview, // In real app, this would be the server URL
        thumbnail: fileItem.preview,
        tags: ['uploaded', albumName.toLowerCase().replace(/\s+/g, '-'), 'new'],
        uploadedBy: 'Current User', // In real app, get from auth context
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        size: fileItem.size,
        type: fileItem.file.type
      }))

      // Call upload complete callback
      if (onUploadComplete && typeof onUploadComplete === 'function') {
        try {
          onUploadComplete(uploadedImages)
        } catch (error) {
          console.error('Error in onUploadComplete callback:', error)
        }
      }

      // Show success message briefly before closing
      setTimeout(() => {
        if (onClose && typeof onClose === 'function') {
          try {
            onClose()
          } catch (error) {
            console.error('Error in onClose callback:', error)
          }
        }
      }, 1500)

    } catch (error) {
      console.error('Upload failed:', error)
      // Mark failed uploads
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'error' } : f
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
