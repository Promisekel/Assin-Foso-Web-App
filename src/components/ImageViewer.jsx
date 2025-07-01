import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Heart,
  Share2,
  Maximize,
  Minimize
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ImageViewer = ({ 
  image, 
  images = [], 
  isOpen, 
  onClose, 
  onDelete, 
  onPrevious, 
  onNext 
}) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [liked, setLiked] = useState(false)
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const hideControlsTimeoutRef = useRef(null)
  const { isAdmin } = useAuth()

  // Safety check for isAdmin function
  const isAdminUser = React.useMemo(() => {
    try {
      if (typeof isAdmin === 'function') {
        return Boolean(isAdmin())
      }
      return false
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }, [isAdmin])

  // Reset viewer state when image changes
  useEffect(() => {
    if (image) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setLiked(image.liked || false)
    }
  }, [image])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onPrevious && onPrevious()
          break
        case 'ArrowRight':
          onNext && onNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          resetZoom()
          break
        case 'r':
          setRotation(prev => prev + 90)
          break
        case 'f':
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, onClose, onPrevious, onNext])

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      clearTimeout(hideControlsTimeoutRef.current)
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => clearTimeout(hideControlsTimeoutRef.current)
  }, [showControls])

  // Mouse move handler to show controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Mouse down handler for panning
  const handleMouseDown = useCallback((e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }, [zoom])

  // Mouse move handler for panning
  const handleMouseMove2 = useCallback((e) => {
    if (isDragging && zoom > 1) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastPanPoint({ x: e.clientX, y: e.clientY })
    }
  }, [isDragging, lastPanPoint, zoom])

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Wheel handler for zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }, [handleZoomIn, handleZoomOut])

  const handleDownload = useCallback(() => {
    if (image?.url) {
      const link = document.createElement('a')
      link.href = image.url
      link.download = image.title || 'image'
      link.click()
    }
  }, [image])

  const handleDelete = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      onDelete && onDelete(image)
    }
  }, [image, onDelete])

  const toggleLike = useCallback(() => {
    setLiked(prev => !prev)
    // In a real app, you'd sync this with the backend
  }, [])

  const handleShare = useCallback(() => {
    if (navigator.share && image) {
      navigator.share({
        title: image.title,
        text: image.description,
        url: image.url
      }).catch(console.error)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(image?.url || '').then(() => {
        alert('Image URL copied to clipboard!')
      })
    }
  }, [image])

  if (!isOpen || !image) return null

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${
        isFullscreen ? 'cursor-none' : ''
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Main Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove2}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          ref={imageRef}
          src={image.url}
          alt={image.title}
          className="max-w-none transition-transform duration-200 select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px) rotate(${rotation}deg)`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          draggable={false}
        />
      </div>

      {/* Controls Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 pointer-events-auto">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div>
                <h3 className="font-semibold">{image.title}</h3>
                <p className="text-sm text-white/70">{image.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Action Buttons */}
              <button
                onClick={toggleLike}
                className={`p-2 rounded-full transition-colors ${
                  liked ? 'text-red-500 bg-white/20' : 'hover:bg-white/20'
                }`}
              >
                <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
              
              {isAdminUser && (
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors pointer-events-auto"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors pointer-events-auto"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 pointer-events-auto">
          <div className="flex items-center justify-center space-x-4 text-white">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              disabled={zoom <= 0.1}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            
            <span className="text-sm bg-black/30 px-3 py-1 rounded-full">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              disabled={zoom >= 5}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setRotation(prev => prev + 90)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            
            <button
              onClick={resetZoom}
              className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Image Info */}
          <div className="text-center mt-2 text-sm text-white/70">
            {image.uploadedBy && <span>By {image.uploadedBy}</span>}
            {image.uploadedAt && <span> • {new Date(image.uploadedAt).toLocaleDateString()}</span>}
            {images.length > 1 && (
              <span> • {images.findIndex(img => img.id === image.id) + 1} of {images.length}</span>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {showControls && (
        <div className="absolute bottom-4 left-4 text-xs text-white/60 bg-black/30 p-2 rounded">
          <div>ESC: Close • ←/→: Navigate • +/-: Zoom • R: Rotate • F: Fullscreen</div>
        </div>
      )}
    </div>
  )
}

export default ImageViewer
