import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Eye,
  Upload,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertCircle,
  ImageIcon,
  Calendar
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AdminImageUpload from '../components/AdminImageUpload'
import EnhancedImageViewer from '../components/EnhancedImageViewer'
import ErrorBoundary from '../components/ErrorBoundary'
import toast from 'react-hot-toast'

const Gallery = () => {
  const { user } = useAuth()
  const [albums, setAlbums] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)

  // Temporarily allow access for testing (remove in production)
  const testMode = true
  const isAdmin = user?.role === 'admin' || testMode

  // Fetch albums
  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/albums`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAlbums(data.data || [])
      } else {
        console.warn('Albums API not available, using sample data')
        // Sample albums for demonstration
        setAlbums([
          {
            id: 1,
            name: 'Field Research 2025',
            description: 'Documentation of field research activities in Assin Foso',
            coverImage: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400',
            imageCount: 24,
            createdAt: '2025-01-15',
            isPrivate: false
          },
          {
            id: 2,
            name: 'Laboratory Studies',
            description: 'Laboratory analysis and testing procedures',
            coverImage: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
            imageCount: 18,
            createdAt: '2025-01-10',
            isPrivate: false
          },
          {
            id: 3,
            name: 'Community Engagement',
            description: 'Community health education and outreach programs',
            coverImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
            imageCount: 32,
            createdAt: '2025-01-05',
            isPrivate: false
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
      toast.error('Failed to load albums')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch images for selected album
  const fetchImages = useCallback(async (albumId) => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/albums/${albumId}/images`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setImages(data.data?.images || [])
      } else {
        console.warn('Images API not available, using sample data')
        // Sample images for demonstration
        setImages([
          {
            id: 1,
            title: 'Research Site Overview',
            description: 'Aerial view of the primary research location',
            url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=200',
            createdAt: '2025-01-15',
            fileSize: 2400000,
            format: 'JPEG',
            albumId,
            width: 1920,
            height: 1080
          },
          {
            id: 2,
            title: 'Data Collection Setup',
            description: 'Field equipment and data collection instruments',
            url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=200',
            createdAt: '2025-01-14',
            fileSize: 1800000,
            format: 'JPEG',
            albumId,
            width: 1920,
            height: 1280
          },
          {
            id: 3,
            title: 'Community Workshop',
            description: 'Health education session with community members',
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200',
            createdAt: '2025-01-13',
            fileSize: 3100000,
            format: 'JPEG',
            albumId,
            width: 1920,
            height: 1080
          },
          {
            id: 4,
            title: 'Laboratory Analysis',
            description: 'Microscopic examination of samples',
            url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=200',
            createdAt: '2025-01-12',
            fileSize: 2200000,
            format: 'JPEG',
            albumId,
            width: 1920,
            height: 1080
          },
          {
            id: 5,
            title: 'Field Team Documentation',
            description: 'Research team during field work',
            url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
            thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200',
            createdAt: '2025-01-11',
            fileSize: 2800000,
            format: 'JPEG',
            albumId,
            width: 1920,
            height: 1280
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlbums()
  }, [fetchAlbums])

  // Handle album selection
  const handleAlbumSelect = useCallback((album) => {
    setSelectedAlbum(album)
    fetchImages(album.id)
  }, [fetchImages])

  // Handle image selection
  const handleImageSelect = useCallback((image) => {
    const imageIndex = images.findIndex(img => img.id === image.id)
    setCurrentImageIndex(imageIndex)
    setSelectedImage(image)
    setShowImageViewer(true)
  }, [images])

  // Handle image navigation
  const handleImageNavigation = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < images.length) {
      setCurrentImageIndex(newIndex)
      setSelectedImage(images[newIndex])
    }
  }, [images])

  // Handle upload complete
  const handleUploadComplete = useCallback(() => {
    fetchAlbums()
    if (selectedAlbum) {
      fetchImages(selectedAlbum.id)
    }
    setShowUploadModal(false)
    toast.success('Images uploaded successfully!')
  }, [fetchAlbums, fetchImages, selectedAlbum])

  // Filter albums and images
  const filteredAlbums = albums.filter(album => 
    album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (album.description && album.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredImages = images.filter(image => 
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isAdmin && !testMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <Lock className="mx-auto text-gray-400 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Access Required</h2>
              <p className="text-gray-600">
                The photo gallery is currently restricted to administrators only.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center text-blue-600 mb-2">
                <AlertCircle className="mr-2" size={20} />
                <span className="font-medium">Contact Administrator</span>
              </div>
              <p className="text-sm text-blue-700">
                Please contact Dr. Samuel Kwame Asiedu for gallery access permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedAlbum && (
                  <button
                    onClick={() => {
                      setSelectedAlbum(null)
                      setImages([])
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedAlbum ? selectedAlbum.name : 'Photo Gallery'}
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {selectedAlbum 
                      ? selectedAlbum.description 
                      : 'Explore our research activities through beautiful imagery'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder={selectedAlbum ? "Search images..." : "Search albums..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List size={18} />
                  </button>
                </div>

                {/* Upload Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload size={18} />
                  <span>Upload Images</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedAlbum ? (
            /* Images Grid/List */
            <div className="space-y-6">
              {/* Album Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedAlbum.name}</h2>
                    <p className="text-gray-600 mt-1">{selectedAlbum.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ImageIcon size={16} />
                        <span>{filteredImages.length} images</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>Created {formatDate(selectedAlbum.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={18} />
                    <span>Add Images</span>
                  </button>
                </div>
              </div>

              {/* Images */}
              {filteredImages.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredImages.map((image) => (
                      <div
                        key={image.id}
                        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => handleImageSelect(image)}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={image.thumbnail || image.url}
                            alt={image.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                            <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={24} />
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{image.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(image.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {filteredImages.map((image) => (
                        <div
                          key={image.id}
                          className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleImageSelect(image)}
                        >
                          <img
                            src={image.thumbnail || image.url}
                            alt={image.title}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{image.title}</h3>
                            <p className="text-sm text-gray-600 truncate mt-1">{image.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{formatFileSize(image.fileSize)}</span>
                              <span>{image.width} × {image.height}</span>
                              <span>{image.format}</span>
                              <span>{formatDate(image.createdAt)}</span>
                            </div>
                          </div>
                          <Eye className="text-gray-400" size={20} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-16">
                  <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'No images match your search criteria.' : 'This album doesn\'t have any images yet.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mx-auto"
                    >
                      <Upload size={20} />
                      <span>Upload First Images</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Albums Grid/List */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Photo Albums</h2>
                  <p className="text-gray-600 mt-1">Organize your research images into albums</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FolderPlus size={18} />
                  <span>New Album</span>
                </button>
              </div>

              {filteredAlbums.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAlbums.map((album) => (
                      <div
                        key={album.id}
                        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => handleAlbumSelect(album)}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={album.coverImage}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="flex items-center space-x-2 text-white text-sm">
                              <ImageIcon size={16} />
                              <span>{album.imageCount || 0} images</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{album.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{album.description}</p>
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <span>{formatDate(album.createdAt)}</span>
                            {album.isPrivate && <Lock size={12} />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {filteredAlbums.map((album) => (
                        <div
                          key={album.id}
                          className="flex items-center p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleAlbumSelect(album)}
                        >
                          <img
                            src={album.coverImage}
                            alt={album.name}
                            className="w-20 h-20 object-cover rounded-lg mr-6"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{album.name}</h3>
                              {album.isPrivate && <Lock className="text-gray-400" size={16} />}
                            </div>
                            <p className="text-gray-600 mt-1">{album.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <ImageIcon size={16} />
                                <span>{album.imageCount || 0} images</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar size={16} />
                                <span>{formatDate(album.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="text-gray-400" size={20} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-16">
                  <FolderPlus className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Albums Found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'No albums match your search criteria.' : 'Create your first album to start organizing images.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors mx-auto"
                    >
                      <FolderPlus size={20} />
                      <span>Create First Album</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <AdminImageUpload
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUploadComplete={handleUploadComplete}
            existingAlbums={albums}
            selectedAlbum={selectedAlbum}
          />
        )}

        {/* Image Viewer */}
        {showImageViewer && selectedImage && (
          <EnhancedImageViewer
            images={filteredImages}
            currentIndex={currentImageIndex}
            isOpen={showImageViewer}
            onClose={() => setShowImageViewer(false)}
            onNavigate={handleImageNavigation}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default Gallery
