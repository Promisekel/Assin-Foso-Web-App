import React, { createContext, useContext, useState, useCallback } from 'react'
import { storageService } from '../services/FirebaseStorageService'

const GalleryContext = createContext()

export const useGallery = () => {
  const context = useContext(GalleryContext)
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider')
  }
  return context
}

export const GalleryProvider = ({ children }) => {
  const [albums, setAlbums] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])

  // Add images to an album
  const addImagesToAlbum = useCallback((albumId, images) => {
    setUploadedImages(prev => [...prev, ...images])
    setAlbums(prev => prev.map(album => 
      album.id === albumId 
        ? { ...album, imageCount: album.imageCount + images.length }
        : album
    ))
  }, [])

  // Get images for a specific album
  const getAlbumImages = useCallback((albumId) => {
    return uploadedImages.filter(img => img.albumId === albumId)
  }, [uploadedImages])

  // Update album
  const updateAlbum = useCallback((albumId, updates) => {
    setAlbums(prev => prev.map(album => 
      album.id === albumId ? { ...album, ...updates } : album
    ))
  }, [])

  // Delete image with Firebase Storage cleanup
  const deleteImage = useCallback(async (imageId) => {
    try {
      // Find the image to get its storage path
      const imageToDelete = uploadedImages.find(img => img.id === imageId)
      
      if (imageToDelete) {
        // Delete from Firebase Storage if it's a Firebase image
        if (imageToDelete.isFirebase && imageToDelete.storagePath) {
          try {
            await storageService.deleteImage(imageToDelete.storagePath)
            console.log('🗑️ Image deleted from Firebase Storage')
          } catch (error) {
            console.error('Error deleting from Firebase Storage:', error)
            // Continue with local deletion even if Firebase delete fails
          }
        }
        
        // Remove from local state
        setUploadedImages(prev => prev.filter(img => img.id !== imageId))
        
        // Update album image count
        setAlbums(prev => prev.map(album => 
          album.id === imageToDelete.albumId 
            ? { ...album, imageCount: Math.max(0, album.imageCount - 1) }
            : album
        ))
        
        console.log('✅ Image deleted successfully')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }, [uploadedImages])

  const value = {
    albums,
    setAlbums,
    uploadedImages,
    addImagesToAlbum,
    getAlbumImages,
    updateAlbum,
    deleteImage
  }

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  )
}

export default GalleryContext
