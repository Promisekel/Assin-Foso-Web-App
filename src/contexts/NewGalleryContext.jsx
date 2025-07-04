import React, { createContext, useContext, useState, useCallback } from 'react';
import { albumsAPI, imagesAPI, handleApiError, storageUtils } from '../services/api';
import { useAuth } from './NewAuthContext';
import toast from 'react-hot-toast';

const GalleryContext = createContext();

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

export const GalleryProvider = ({ children }) => {
  const { user, canUploadImages } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageStats, setStorageStats] = useState({
    totalUsed: 0,
    totalImages: 0,
    totalDocuments: 0,
    percentageUsed: 0,
    remainingStorage: 0,
    estimatedProjectsRemaining: 0
  });

  // Fetch all albums
  const fetchAlbums = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await albumsAPI.getAll(params);
      if (response.data.success) {
        setAlbums(response.data.data);
        return response.data;
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to load albums: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch images for a specific album
  const fetchAlbumImages = useCallback(async (albumId, params = {}) => {
    try {
      setLoading(true);
      const response = await albumsAPI.getById(albumId, params);
      if (response.data.success) {
        const albumData = response.data.data;
        setSelectedAlbum(albumData);
        setImages(albumData.images || []);
        return response.data;
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to load album images: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all images (for gallery overview)
  const fetchAllImages = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await imagesAPI.getAll(params);
      if (response.data.success) {
        setImages(response.data.data);
        return response.data;
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to load images: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new album
  const createAlbum = useCallback(async (albumData) => {
    if (!canUploadImages()) {
      toast.error('You do not have permission to create albums');
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const response = await albumsAPI.create(albumData);
      if (response.data.success) {
        const newAlbum = response.data.data;
        setAlbums(prev => [newAlbum, ...prev]);
        toast.success('Album created successfully');
        return { success: true, data: newAlbum };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to create album: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    }
  }, [canUploadImages]);

  // Update album
  const updateAlbum = useCallback(async (albumId, updateData) => {
    if (!canUploadImages()) {
      toast.error('You do not have permission to update albums');
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const response = await albumsAPI.update(albumId, updateData);
      if (response.data.success) {
        const updatedAlbum = response.data.data;
        setAlbums(prev => 
          prev.map(album => 
            album.id === albumId ? updatedAlbum : album
          )
        );
        if (selectedAlbum?.id === albumId) {
          setSelectedAlbum(updatedAlbum);
        }
        toast.success('Album updated successfully');
        return { success: true, data: updatedAlbum };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to update album: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    }
  }, [canUploadImages, selectedAlbum]);

  // Delete album
  const deleteAlbum = useCallback(async (albumId) => {
    if (!canUploadImages()) {
      toast.error('You do not have permission to delete albums');
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const response = await albumsAPI.delete(albumId);
      if (response.data.success) {
        setAlbums(prev => prev.filter(album => album.id !== albumId));
        if (selectedAlbum?.id === albumId) {
          setSelectedAlbum(null);
          setImages([]);
        }
        toast.success('Album deleted successfully');
        return { success: true };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to delete album: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    }
  }, [canUploadImages, selectedAlbum]);

  // Upload images
  const uploadImages = useCallback(async (files, albumId, metadata = {}) => {
    if (!canUploadImages()) {
      toast.error('You do not have permission to upload images');
      return { success: false, error: 'Insufficient permissions' };
    }

    if (!files || files.length === 0) {
      toast.error('No files selected');
      return { success: false, error: 'No files selected' };
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('albumId', albumId);
        formData.append('title', metadata.title || file.name);
        formData.append('description', metadata.description || '');
        
        if (metadata.tags) {
          formData.append('tags', JSON.stringify(metadata.tags));
        }

        const response = await imagesAPI.upload(formData);
        
        // Update progress
        const progress = ((index + 1) / files.length) * 100;
        setUploadProgress(progress);
        
        return response.data;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        // Add new images to the current list
        const newImages = successfulUploads.map(result => result.data);
        setImages(prev => [...newImages, ...prev]);
        
        // Update storage stats
        await fetchStorageStats();
        
        toast.success(`${successfulUploads.length} image(s) uploaded successfully`);
      }

      if (failedUploads.length > 0) {
        toast.error(`${failedUploads.length} image(s) failed to upload`);
      }

      return {
        success: true,
        data: {
          successful: successfulUploads.length,
          failed: failedUploads.length,
          images: successfulUploads.map(result => result.data)
        }
      };
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Upload failed: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [canUploadImages]);

  // Update image
  const updateImage = useCallback(async (imageId, updateData) => {
    if (!canUploadImages()) {
      toast.error('You do not have permission to update images');
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const response = await imagesAPI.update(imageId, updateData);
      if (response.data.success) {
        const updatedImage = response.data.data;
        setImages(prev => 
          prev.map(image => 
            image.id === imageId ? updatedImage : image
          )
        );
        toast.success('Image updated successfully');
        return { success: true, data: updatedImage };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to update image: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    }
  }, [canUploadImages]);

  // Delete image
  const deleteImage = useCallback(async (imageId) => {
    if (!canUploadImages()) {
      toast.error('You do not have permission to delete images');
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      const response = await imagesAPI.delete(imageId);
      if (response.data.success) {
        setImages(prev => prev.filter(image => image.id !== imageId));
        toast.success('Image deleted successfully');
        
        // Update storage stats
        await fetchStorageStats();
        
        return { success: true };
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(`Failed to delete image: ${errorInfo.message}`);
      return { success: false, error: errorInfo };
    }
  }, [canUploadImages]);

  // Fetch storage statistics
  const fetchStorageStats = useCallback(async () => {
    try {
      const response = await imagesAPI.getStats();
      if (response.data.success) {
        const stats = response.data.data;
        const totalUsed = stats.overview.totalSize;
        const percentageUsed = storageUtils.calculateStoragePercentage(
          totalUsed, 
          storageUtils.CLOUDINARY_FREE_LIMIT
        );
        const remainingStorage = storageUtils.CLOUDINARY_FREE_LIMIT - totalUsed;
        const estimatedProjectsRemaining = storageUtils.calculateMaxProjects(totalUsed);

        const storageData = {
          totalUsed,
          totalImages: stats.overview.totalCount,
          percentageUsed,
          remainingStorage,
          estimatedProjectsRemaining,
          formattedUsed: storageUtils.formatBytes(totalUsed),
          formattedRemaining: storageUtils.formatBytes(remainingStorage),
          formattedLimit: storageUtils.formatBytes(storageUtils.CLOUDINARY_FREE_LIMIT)
        };

        setStorageStats(storageData);
        return storageData;
      }
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
      return null;
    }
  }, []);

  // Get image URL with transformations
  const getImageUrl = useCallback((image, transformations = {}) => {
    if (!image?.url) return null;
    
    // For Cloudinary URLs, we can add transformations
    const { width, height, quality = 'auto', format = 'auto' } = transformations;
    
    if (width || height || quality !== 'auto' || format !== 'auto') {
      // This is a simplified transformation - in practice, you'd use Cloudinary's URL API
      const baseUrl = image.url.replace('/upload/', `/upload/w_${width || 'auto'},h_${height || 'auto'},q_${quality},f_${format}/`);
      return baseUrl;
    }
    
    return image.url;
  }, []);

  const value = {
    // State
    albums,
    selectedAlbum,
    images,
    loading,
    uploading,
    uploadProgress,
    storageStats,

    // Actions
    fetchAlbums,
    fetchAlbumImages,
    fetchAllImages,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    uploadImages,
    updateImage,
    deleteImage,
    fetchStorageStats,

    // Utilities
    getImageUrl,
    
    // Selection
    setSelectedAlbum: (album) => {
      setSelectedAlbum(album);
      if (album) {
        fetchAlbumImages(album.id);
      } else {
        setImages([]);
      }
    },
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>  
  );
};
