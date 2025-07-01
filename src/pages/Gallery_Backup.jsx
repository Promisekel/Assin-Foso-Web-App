import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  X, 
  Download, 
  Heart,
  Share2,
  Eye,
  Upload,
  FolderPlus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGallery } from '../contexts/GalleryContext'
import ImageUpload from '../components/ImageUpload'

// Memoized Album Card Component to prevent unnecessary re-renders
const AlbumCard = React.memo(({ album, index, onSelect, isHovered, onHover, onLeave, onUpload, isAdmin }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
  }, [])

  const handleClick = useCallback(() => {
    onSelect(album)
  }, [album, onSelect])

  const handleMouseEnter = useCallback(() => {
    onHover(`album-${album.id}`)
  }, [album.id, onHover])

  const handleMouseLeave = useCallback(() => {
    onLeave()
  }, [onLeave])

  const handleUploadClick = useCallback((e) => {
    e.stopPropagation() // Prevent card click
    onUpload(album)
  }, [album, onUpload])

  return (
    <div
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 cursor-pointer animate-slideInUp overflow-hidden gallery-card prevent-flicker"
      style={{ 
        animationDelay: `${index * 100}ms`,
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backfaceVisibility: 'hidden',
        willChange: 'auto'
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Album Cover with Loading State */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
          </div>
        )}
        
        {/* Actual Image */}
        <img
          src={imageError ? '/placeholder-image.jpg' : album.coverImage}
          alt={album.name}
          className={`w-full h-full object-cover gallery-image ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          draggable={false}
        />
        
        {/* Stable overlay */}
        <div 
          className="absolute inset-0 gallery-overlay prevent-flicker"
          style={{ 
            backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0)',
            transition: 'background-color 0.3s ease-in-out'
          }}
        >
          <div className="flex items-center justify-center h-full">
            <Eye 
              className="h-8 w-8 text-white drop-shadow-lg gallery-badge"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>
        </div>
        
        {/* Photo count badge - Always visible with stable positioning */}
        <div className="absolute top-3 right-3 bg-primary-500/90 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg backdrop-blur-sm stable-text">
          {album.imageCount} photos
        </div>
        
        {/* Upload button - Show on hover for admins */}
        {isAdminUser && (
          <div 
            className="absolute top-3 left-3 gallery-badge prevent-flicker"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <button
              onClick={handleUploadClick}
              className="bg-white/90 hover:bg-white text-primary-600 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
              title="Upload images to this album"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Album Info - Stable positioning with fixed height to prevent layout shifts */}
      <div className="p-5 bg-white gallery-content">
        <div className="min-h-[100px]">
          <h3 
            className="text-lg font-bold mb-2 gallery-title"
            style={{
              color: isHovered ? '#2563eb' : '#111827',
              transition: 'color 0.2s ease-in-out',
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased'
            }}
          >
            {album.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 stable-text line-clamp-2">
            {album.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500 gallery-stats">
            <span className="flex items-center stable-text">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
              {album.imageCount} photos
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full stable-text whitespace-nowrap">
              {new Date(album.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

// Memoized Image Card Component
const ImageCard = React.memo(({ image, index, onSelect, isHovered, onHover, onLeave }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleImageError = useCallback(() => {
    setImageError(true)
    setImageLoaded(true)
  }, [])

  const handleClick = useCallback(() => {
    onSelect(image)
  }, [image, onSelect])

  const handleMouseEnter = useCallback(() => {
    onHover(`image-${image.id}`)
  }, [image.id, onHover])

  const handleMouseLeave = useCallback(() => {
    onLeave()
  }, [onLeave])

  return (
    <div
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 cursor-pointer animate-slideInUp overflow-hidden gallery-card prevent-flicker"
      style={{ 
        animationDelay: `${index * 50}ms`,
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backfaceVisibility: 'hidden',
        willChange: 'auto'
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl overflow-hidden">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
          </div>
        )}
        
        <img
          src={imageError ? '/placeholder-image.jpg' : image.thumbnail}
          alt={image.title}
          className={`w-full h-full object-cover gallery-image ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          draggable={false}
        />
        
        {/* Stable overlay */}
        <div 
          className="absolute inset-0 gallery-overlay prevent-flicker"
          style={{ 
            backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0)',
            transition: 'background-color 0.3s ease-in-out'
          }}
        >
          <div className="flex items-center justify-center h-full">
            <Eye 
              className="h-8 w-8 text-white drop-shadow-lg gallery-badge"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>
        </div>
        
        {/* Tags - Fixed positioning */}
        <div 
          className="absolute bottom-2 left-2 flex flex-wrap gap-1 gallery-badge prevent-flicker"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {image.tags.slice(0, 2).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="text-xs bg-primary-500/90 text-white px-2 py-1 rounded-full font-medium shadow-lg backdrop-blur-sm stable-text"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Fixed title area with stable height */}
      <div className="p-4 bg-white gallery-content">
        <div className="min-h-[60px]">
          <h3 
            className="font-semibold text-sm mb-2 gallery-title line-clamp-2"
            style={{
              color: isHovered ? '#2563eb' : '#111827',
              transition: 'color 0.2s ease-in-out',
              textRendering: 'optimizeLegibility'
            }}
          >
            {image.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 gallery-stats">
            <span className="flex items-center stable-text">
              <Eye className="h-3 w-3 mr-1 flex-shrink-0" />
              {image.views}
            </span>
            <span className="flex items-center stable-text">
              <Heart className="h-3 w-3 mr-1 flex-shrink-0" />
              {image.likes}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

const Gallery = () => {
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadingToAlbum, setUploadingToAlbum] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const { isAdmin } = useAuth()
  const galleryContext = useGallery()
  const { albums = [], setAlbums, uploadedImages = [], addImagesToAlbum, getAlbumImages } = galleryContext || {}

  // Safety check for isAdmin function
  const isAdminUser = typeof isAdmin === 'function' ? isAdmin() : false

  // Stable hover handlers with debouncing and throttling to prevent rapid state changes
  const hoverTimeoutRef = useRef(null)
  
  const handleCardHover = useCallback((cardId) => {
    // Clear any existing timeout to prevent multiple rapid calls
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Only update if the card ID is different
    if (hoveredCard !== cardId) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredCard(cardId)
      }, 10) // Very small delay to prevent rapid oscillation
    }
  }, [hoveredCard])

  const handleCardLeave = useCallback(() => {
    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // Small delay before clearing to prevent flicker when moving between elements
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCard(null)
    }, 50)
  }, [])

  // Memoized handlers to prevent unnecessary re-renders
  const handleAlbumSelect = useCallback((album) => {
    setSelectedAlbum(album)
    setLoading(true)
    // Filter images by album from both mock data and uploaded images
    setTimeout(() => {
      const mockAlbumImages = mockImages.filter(img => img.albumId === album.id)
      const uploadedAlbumImages = getAlbumImages ? getAlbumImages(album.id) : []
      const allImages = [...mockAlbumImages, ...uploadedAlbumImages]
      setImages(allImages)
      setLoading(false)
    }, 500)
  }, [getAlbumImages, mockImages])

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setSelectedImage(null)
  }, [])

  // Upload handlers
  const handleUploadClick = useCallback((album = null) => {
    setUploadingToAlbum(album || selectedAlbum)
    setShowImageUpload(true)
    setUploadInProgress(true)
  }, [selectedAlbum])

  const handleUploadComplete = useCallback((uploadedImages) => {
    try {
      // Add uploaded images to the gallery context
      if (uploadingToAlbum && Array.isArray(uploadedImages) && addImagesToAlbum) {
        addImagesToAlbum(uploadingToAlbum.id, uploadedImages)
        
        // If we're currently viewing this album, update the displayed images immediately
        if (selectedAlbum && selectedAlbum.id === uploadingToAlbum.id) {
          setImages(prev => {
            // Avoid duplicates by checking if images already exist
            const existingIds = prev.map(img => img.id)
            const newImages = uploadedImages.filter(img => !existingIds.includes(img.id))
            return [...prev, ...newImages]
          })
        }
        
        // Show success message
        setUploadSuccess(true)
        setUploadInProgress(false)
        setTimeout(() => setUploadSuccess(false), 3000)
      }
      
      setShowImageUpload(false)
      setUploadingToAlbum(null)
    } catch (error) {
      console.error('Error handling upload completion:', error)
      setUploadInProgress(false)
      setShowImageUpload(false)
      setUploadingToAlbum(null)
    }
  }, [uploadingToAlbum, addImagesToAlbum, selectedAlbum])

  const handleUploadClose = useCallback(() => {
    setShowImageUpload(false)
    setUploadingToAlbum(null)
    setUploadInProgress(false)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Memoized mock data to prevent recreation on every render
  const mockAlbums = useMemo(() => [
    {
      id: 1,
      name: 'Field Work',
      description: 'Research activities in the field',
      imageCount: 24,
      coverImage: '/gallery/fieldwork-cover.jpg',
      createdAt: '2025-01-15'
    },
    {
      id: 2,
      name: 'Laboratory',
      description: 'Lab research and testing procedures',
      imageCount: 18,
      coverImage: '/gallery/lab-cover.jpg',
      createdAt: '2025-02-01'
    },
    {
      id: 3,
      name: 'Conferences',
      description: 'Scientific conferences and presentations',
      imageCount: 12,
      coverImage: '/gallery/conference-cover.jpg',
      createdAt: '2025-03-10'
    },
    {
      id: 4,
      name: 'Team Events',
      description: 'Team building and social events',
      imageCount: 8,
      coverImage: '/gallery/team-cover.jpg',
      createdAt: '2025-04-05'
    },
    {
      id: 5,
      name: 'Community Outreach',
      description: 'Health education and community programs',
      imageCount: 15,
      coverImage: '/gallery/outreach-cover.jpg',
      createdAt: '2025-05-12'
    },
    {
      id: 6,
      name: 'Training Workshops',
      description: 'Staff training and capacity building',
      imageCount: 10,
      coverImage: '/gallery/training-cover.jpg',
      createdAt: '2025-06-20'
    }
  ], [])

  const mockImages = useMemo(() => [
    {
      id: 1,
      albumId: 1,
      title: 'Data Collection in Assin North',
      description: 'Community health workers collecting malaria surveillance data',
      url: '/gallery/fieldwork-1.jpg',
      thumbnail: '/gallery/fieldwork-1-thumb.jpg',
      tags: ['fieldwork', 'data collection', 'malaria'],
      uploadedBy: 'Dr. Sarah Johnson',
      uploadedAt: '2025-06-15',
      views: 45,
      likes: 12
    },
    {
      id: 2,
      albumId: 1,
      title: 'Village Health Assessment',
      description: 'Conducting health assessments in rural communities',
      url: '/gallery/fieldwork-2.jpg',
      thumbnail: '/gallery/fieldwork-2-thumb.jpg',
      tags: ['fieldwork', 'assessment', 'community'],
      uploadedBy: 'Dr. Kwame Osei',
      uploadedAt: '2025-06-20',
      views: 32,
      likes: 8
    },
    {
      id: 3,
      albumId: 2,
      title: 'PCR Testing Setup',
      description: 'Laboratory setup for PCR testing of samples',
      url: '/gallery/lab-1.jpg',
      thumbnail: '/gallery/lab-1-thumb.jpg',
      tags: ['laboratory', 'PCR', 'testing'],
      uploadedBy: 'Dr. Ama Mensah',
      uploadedAt: '2025-06-25',
      views: 28,
      likes: 15
    }
  ], [])

  useEffect(() => {
    // Load mock albums into context if not already loaded
    if (albums.length === 0 && setAlbums) {
      setLoading(true)
      setTimeout(() => {
        setAlbums(mockAlbums)
        setLoading(false)
      }, 1000)
    }
  }, [mockAlbums, albums.length, setAlbums])

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const filteredImages = useMemo(() => {
    return images.filter(image =>
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [images, searchTerm])

  if (!selectedAlbum) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Success Notification */}
        {uploadSuccess && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideInRight">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">Images uploaded successfully!</span>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-slideInUp">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Photo Gallery
            </h1>
            <p className="text-gray-600 mt-2">
              Explore our research activities through beautiful imagery
            </p>
          </div>
          {isAdminUser && (
            <div className="flex space-x-3 mt-4 md:mt-0 animate-slideInRight">
              <button className="btn-secondary hover:scale-105 transition-transform duration-200 group">
                <FolderPlus className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                New Album
              </button>
              <button 
                onClick={() => handleUploadClick()}
                className="btn-primary hover:scale-105 transition-transform duration-200 group shadow-lg hover:shadow-xl"
              >
                <Upload className="h-4 w-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                Upload Images
              </button>
            </div>
          )}
        </div>

        {/* Albums Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <div className="absolute inset-0 rounded-full border-2 border-primary-200 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album, index) => (
              <AlbumCard
                key={album.id}
                album={album}
                index={index}
                onSelect={handleAlbumSelect}
                isHovered={hoveredCard === `album-${album.id}`}
                onHover={handleCardHover}
                onLeave={handleCardLeave}
                onUpload={handleUploadClick}
                isAdmin={isAdminUser}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn pt-4">
      {/* Success Notification */}
      {uploadSuccess && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideInRight">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">Images uploaded successfully!</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between animate-slideInUp">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2 hover:scale-105 transition-all duration-200"
          >
            <span>←</span>
            <span>Back to Albums</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {selectedAlbum.name}
            </h1>
            <p className="text-gray-600 mt-1">{selectedAlbum.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          {isAdminUser && (
            <button 
              onClick={() => handleUploadClick()}
              className="btn-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 animate-slideInUp" style={{ animationDelay: '200ms' }}>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search photos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white sm:text-sm transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-200">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Images Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              onSelect={handleImageClick}
              isHovered={hoveredCard === `image-${image.id}`}
              onHover={handleCardHover}
              onLeave={handleCardLeave}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="divide-y divide-gray-200">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className="h-16 w-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg'
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{image.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{image.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>By {image.uploadedBy}</span>
                      <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {image.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {image.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={handleCloseModal}></div>

            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{selectedImage.title}</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-0">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full max-h-96 object-contain bg-black"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg'
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200">
                <p className="text-gray-600 mb-3">{selectedImage.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedImage.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Uploaded by {selectedImage.uploadedBy}</span>
                  <span>{new Date(selectedImage.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && uploadingToAlbum && (
        <ImageUpload
          albumId={uploadingToAlbum.id}
          albumName={uploadingToAlbum.name}
          onUploadComplete={handleUploadComplete}
          onClose={handleUploadClose}
        />
      )}
    </div>
  )
}

export default Gallery
