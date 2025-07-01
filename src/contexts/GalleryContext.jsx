import React, { createContext, useContext, useState, useCallback } from 'react'

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

  // Delete image
  const deleteImage = useCallback((imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

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
