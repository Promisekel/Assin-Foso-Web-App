import React, { useState, useCallback, useRef } from 'react'
import { 
  Upload, 
  X, 
  Plus, 
  FolderPlus, 
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const AdminImageUpload = ({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  existingAlbums = [],
  selectedAlbum = null 
}) => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [albumName, setAlbumName] = useState(selectedAlbum?.name || '')
  const [albumDescription, setAlbumDescription] = useState(selectedAlbum?.description || '')
  const [createNewAlbum, setCreateNewAlbum] = useState(!selectedAlbum)
  const [selectedExistingAlbum, setSelectedExistingAlbum] = useState(selectedAlbum?.id || '')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const fileInputRef = useRef()

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex items-center text-red-600 mb-4">
            <AlertCircle className="mr-2" />
            <h3 className="text-lg font-semibold">Access Denied</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Only administrators can upload images to the gallery.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const handleFileSelect = useCallback((selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }
      
      return true
    })

    const filesWithPreview = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: ''
    }))

    setFiles(prev => [...prev, ...filesWithPreview])
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const removeFile = useCallback((fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      // Revoke URL for removed file
      const removedFile = prev.find(f => f.id === fileId)
      if (removedFile) {
        URL.revokeObjectURL(removedFile.preview)
      }
      return updated
    })
  }, [])

  const updateFileInfo = useCallback((fileId, field, value) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, [field]: value } : f
    ))
  }, [])

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image')
      return
    }

    if (createNewAlbum && !albumName.trim()) {
      toast.error('Please enter an album name')
      return
    }

    if (!createNewAlbum && !selectedExistingAlbum) {
      toast.error('Please select an album')
      return
    }

    setUploading(true)
    
    try {
      let albumId = selectedExistingAlbum

      // Create new album if needed
      if (createNewAlbum) {
        const albumResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/albums`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: albumName.trim(),
            description: albumDescription.trim()
          })
        })

        if (!albumResponse.ok) {
          throw new Error('Failed to create album')
        }

        const albumData = await albumResponse.json()
        albumId = albumData.data.id
      }

      // Upload images
      const uploadPromises = files.map(async (fileData) => {
        const formData = new FormData()
        formData.append('images', fileData.file)
        formData.append('albumId', albumId)
        formData.append('titles', JSON.stringify([fileData.title]))
        formData.append('captions', JSON.stringify([fileData.description]))

        return fetch(`${import.meta.env.VITE_API_BASE_URL}/images/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })
      })

      const responses = await Promise.all(uploadPromises)
      const failed = responses.filter(r => !r.ok)

      if (failed.length === 0) {
        toast.success(`Successfully uploaded ${files.length} images!`)
        onUploadComplete?.()
        handleClose()
      } else {
        toast.error(`${failed.length} images failed to upload`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }, [files, createNewAlbum, albumName, albumDescription, selectedExistingAlbum, onUploadComplete])

  const handleClose = useCallback(() => {
    // Cleanup preview URLs
    files.forEach(f => URL.revokeObjectURL(f.preview))
    setFiles([])
    setAlbumName('')
    setAlbumDescription('')
    setCreateNewAlbum(true)
    setSelectedExistingAlbum('')
    onClose()
  }, [files, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div>
            <h2 className="text-xl font-bold">Upload Images</h2>
            <p className="text-blue-100 text-sm">Admin Gallery Management</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Album Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Album Selection</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={createNewAlbum}
                    onChange={() => setCreateNewAlbum(true)}
                    className="mr-2"
                  />
                  <FolderPlus className="mr-2" size={16} />
                  Create New Album
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!createNewAlbum}
                    onChange={() => setCreateNewAlbum(false)}
                    className="mr-2"
                  />
                  <ImageIcon className="mr-2" size={16} />
                  Add to Existing Album
                </label>
              </div>

              {createNewAlbum ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Album Name *
                    </label>
                    <input
                      type="text"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      placeholder="Enter album name..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Album Description
                    </label>
                    <textarea
                      value={albumDescription}
                      onChange={(e) => setAlbumDescription(e.target.value)}
                      placeholder="Enter album description..."
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Album *
                  </label>
                  <select
                    value={selectedExistingAlbum}
                    onChange={(e) => setSelectedExistingAlbum(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose an album...</option>
                    {existingAlbums.map(album => (
                      <option key={album.id} value={album.id}>
                        {album.name} ({album.imageCount || 0} images)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Images</h3>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, GIF, WebP (max 10MB each)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Selected Images ({files.length})
              </h3>
              
              <div className="space-y-4">
                {files.map((fileData) => (
                  <div key={fileData.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={fileData.preview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={fileData.title}
                          onChange={(e) => updateFileInfo(fileData.id, 'title', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={fileData.description}
                          onChange={(e) => updateFileInfo(fileData.id, 'description', e.target.value)}
                          placeholder="Optional description..."
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {fileData.file.name} • {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {files.length > 0 && `${files.length} image${files.length !== 1 ? 's' : ''} selected`}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2" size={16} />
                  Upload Images
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminImageUpload
