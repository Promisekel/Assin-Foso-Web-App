import React, { useState, useEffect } from 'react'
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

const Gallery = () => {
  const [albums, setAlbums] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { isAdmin } = useAuth()

  // Mock data - replace with Netlify Large Media or Cloudinary integration
  const mockAlbums = [
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
    }
  ]

  const mockImages = [
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
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setAlbums(mockAlbums)
      setLoading(false)
    }, 1000)
  }, [])

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album)
    setLoading(true)
    // Filter images by album
    setTimeout(() => {
      const albumImages = mockImages.filter(img => img.albumId === album.id)
      setImages(albumImages)
      setLoading(false)
    }, 500)
  }

  const handleImageClick = (image) => {
    setSelectedImage(image)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedImage(null)
  }

  const filteredImages = images.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!selectedAlbum) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
            <p className="text-gray-600 mt-1">
              Explore our research activities through images
            </p>
          </div>
          {isAdmin() && (
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button className="btn-secondary">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Album
              </button>
              <button className="btn-primary">
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </button>
            </div>
          )}
        </div>

        {/* Albums Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleAlbumSelect(album)}
              >
                {/* Album Cover */}
                <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Album Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {album.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {album.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{album.imageCount} photos</span>
                    <span>{new Date(album.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Albums
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedAlbum.name}</h1>
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
          {isAdmin() && (
            <button className="btn-primary">
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => handleImageClick(image)}
            >
              <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={image.thumbnail}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg'
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {image.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
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
    </div>
  )
}

export default Gallery
