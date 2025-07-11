import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Info,
  Copy
} from 'lucide-react'
import toast from 'react-hot-toast'

const EnhancedImageViewer = ({
  images = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onNavigate,
  isAdmin = false
}) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const touchStartRef = useRef({ x: 0, y: 0, zoom: 1, distance: 0 })

  const currentImage = images[currentIndex]

  // Reset state when image changes
  useEffect(() => {
    if (currentImage) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setIsLoading(true)
    }
  }, [currentIndex, currentImage])

  // Keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
        case 'R':
          handleRotate()
          break
        case 'f':
        case 'F':
          handleFullscreen()
          break
        case '0':
          handleResetZoom()
          break
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleDownload()
          }
          break
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleShare()
          }
          break
        case 'i':
        case 'I':
          setShowInfo(prev => !prev)
          break
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isOpen, currentIndex])

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1)
    }
  }, [currentIndex, onNavigate])

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1)
    }
  }, [currentIndex, images.length, onNavigate])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const handleDownload = useCallback(async () => {
    if (!currentImage) return

    try {
      const response = await fetch(currentImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentImage.title || 'image'}.${currentImage.format?.toLowerCase() || 'jpg'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Image downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }, [currentImage])

  const handleShare = useCallback(async () => {
    if (!currentImage) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.title || 'Research Image',
          text: currentImage.description || 'Shared from KCCR Research Platform',
          url: currentImage.url
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentImage.url)
        toast.success('Image URL copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy URL')
      }
    }
  }, [currentImage])

  const handleCopyLink = useCallback(async () => {
    if (!currentImage) return

    try {
      await navigator.clipboard.writeText(currentImage.url)
      toast.success('Image URL copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }, [currentImage])

  // Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      e.preventDefault()
    }
  }, [zoom, position])

  const handleMouseMove = useCallback((e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart, zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)))
  }, [])

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        zoom,
        distance: 0
      }
      if (zoom > 1) {
        setIsDragging(true)
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
      }
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      touchStartRef.current = { ...touchStartRef.current, distance, zoom }
    }
  }, [zoom, position])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()

    if (e.touches.length === 1 && isDragging && zoom > 1) {
      const touch = e.touches[0]
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      })
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )

      if (touchStartRef.current.distance > 0) {
        const scale = distance / touchStartRef.current.distance
        const newZoom = Math.max(0.1, Math.min(5, touchStartRef.current.zoom * scale))
        setZoom(newZoom)
      }
    }
  }, [isDragging, dragStart, zoom])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    touchStartRef.current = { x: 0, y: 0, zoom: 1, distance: 0 }
  }, [])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen || !currentImage) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Image */}
        <img
          ref={imageRef}
          src={currentImage.url}
          alt={currentImage.title}
          className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
            isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            userSelect: 'none',
            pointerEvents: 'none'
          }}
          onMouseDown={handleMouseDown}
          onLoad={handleImageLoad}
          draggable={false}
        />

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">{currentImage.title}</h2>
              <span className="text-sm opacity-70">
                {currentIndex + 1} of {images.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn size={20} />
              </button>

              {/* Action Controls */}
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Rotate (R)"
              >
                <RotateCw size={20} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Download (Ctrl+D)"
              >
                <Download size={20} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Share (Ctrl+S)"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Copy Link"
              >
                <Copy size={20} />
              </button>
              <button
                onClick={() => setShowInfo(prev => !prev)}
                className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${
                  showInfo ? 'bg-white/20' : ''
                }`}
                title="Info (I)"
              >
                <Info size={20} />
              </button>
              <button
                onClick={handleFullscreen}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            title="Previous (←)"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            title="Next (→)"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleResetZoom}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-sm"
                title="Reset Zoom (0)"
              >
                Fit to Screen
              </button>
            </div>

            {/* Image Thumbnails Navigation */}
            <div className="flex items-center space-x-2 max-w-md overflow-x-auto">
              {images.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((image, idx) => {
                const actualIndex = Math.max(0, currentIndex - 2) + idx
                return (
                  <button
                    key={image.id}
                    onClick={() => onNavigate(actualIndex)}
                    className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden transition-all ${
                      actualIndex === currentIndex 
                        ? 'ring-2 ring-white scale-110' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.thumbnail || image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Image Info Panel */}
        {showInfo && (
          <div className="absolute top-16 right-4 bg-black/80 text-white p-4 rounded-lg max-w-sm">
            <h3 className="font-semibold mb-2">{currentImage.title}</h3>
            {currentImage.description && (
              <p className="text-sm opacity-90 mb-3">{currentImage.description}</p>
            )}
            <div className="text-xs space-y-1 opacity-75">
              <div>Dimensions: {currentImage.width} × {currentImage.height}</div>
              <div>Size: {formatFileSize(currentImage.fileSize)}</div>
              <div>Format: {currentImage.format}</div>
              <div>Created: {formatDate(currentImage.createdAt)}</div>
              {currentImage.uploadedBy && (
                <div>Uploaded by: {currentImage.uploadedBy.name}</div>
              )}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/60 text-xs text-center">
          <div>Use mouse wheel or pinch to zoom • Click and drag to pan • Arrow keys to navigate</div>
          <div>Press F for fullscreen • R to rotate • I for info • Esc to close</div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedImageViewer