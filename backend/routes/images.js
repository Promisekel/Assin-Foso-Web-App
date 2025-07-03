import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import Joi from 'joi'
import { prisma } from '../server.js'
import { requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 10 // Maximum 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false)
    }
  }
})

// Validation schemas
const uploadSchema = Joi.object({
  albumId: Joi.string().required(),
  titles: Joi.array().items(Joi.string().max(100)).optional(),
  captions: Joi.array().items(Joi.string().max(500)).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  isPublic: Joi.boolean().default(false)
})

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: 'assin-foso/gallery',
      use_filename: true,
      unique_filename: true,
      ...options
    }
    
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    ).end(buffer)
  })
}

// @route   POST /api/images/upload
// @desc    Upload multiple images to album
// @access  Admin only
router.post('/upload', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }
    
    // Validate request body
    const { error, value } = uploadSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      })
    }
    
    const { albumId, titles = [], captions = [], tags = [], isPublic } = value
    
    // Check if album exists
    const album = await prisma.album.findUnique({
      where: { id: albumId }
    })
    
    if (!album) {
      return res.status(404).json({ error: 'Album not found' })
    }
    
    const uploadResults = []
    const errors = []
    
    // Process each file
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const title = titles[i] || file.originalname
      const caption = captions[i] || null
      const fileTags = tags[i] ? tags[i].split(',').map(tag => tag.trim()) : []
      
      try {
        console.log(`📤 Uploading file ${i + 1}/${req.files.length}: ${file.originalname}`)
        
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          public_id: `${albumId}/${Date.now()}_${i}`,
          tags: ['assin-foso', 'gallery', albumId, ...fileTags],
          context: {
            album_id: albumId,
            uploaded_by: req.user.id,
            original_name: file.originalname
          }
        })
        
        // Generate thumbnail URL
        const thumbnailUrl = cloudinary.url(cloudinaryResult.public_id, {
          width: 300,
          height: 200,
          crop: 'fill',
          quality: 'auto',
          format: 'auto'
        })
        
        // Save to database
        const image = await prisma.image.create({
          data: {
            albumId,
            title,
            caption,
            cloudinaryId: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            thumbnailUrl,
            format: cloudinaryResult.format,
            width: cloudinaryResult.width,
            height: cloudinaryResult.height,
            size: cloudinaryResult.bytes,
            tags: fileTags,
            metadata: {
              etag: cloudinaryResult.etag,
              version: cloudinaryResult.version,
              signature: cloudinaryResult.signature
            },
            uploadedById: req.user.id,
            isPublic
          },
          include: {
            album: {
              select: { title: true }
            },
            uploadedBy: {
              select: { name: true, email: true }
            }
          }
        })
        
        uploadResults.push({
          success: true,
          image,
          cloudinaryData: {
            public_id: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
            thumbnail_url: thumbnailUrl
          }
        })
        
        console.log(`✅ Successfully uploaded: ${file.originalname}`)
        
      } catch (uploadError) {
        console.error(`❌ Failed to upload ${file.originalname}:`, uploadError)
        errors.push({
          filename: file.originalname,
          error: uploadError.message
        })
      }
    }
    
    // Return results
    const response = {
      message: `Upload completed: ${uploadResults.length} successful, ${errors.length} failed`,
      successful: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: req.files.length,
        successful: uploadResults.length,
        failed: errors.length
      }
    }
    
    const statusCode = errors.length > 0 ? 207 : 201 // 207 Multi-Status if partial success
    res.status(statusCode).json(response)
    
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// @route   GET /api/images/album/:albumId
// @desc    Get all images from an album
// @access  Private
router.get('/album/:albumId', async (req, res) => {
  try {
    const { albumId } = req.params
    const { page = 1, limit = 20 } = req.query
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Check if album exists and user has access
    const album = await prisma.album.findUnique({
      where: { id: albumId }
    })
    
    if (!album) {
      return res.status(404).json({ error: 'Album not found' })
    }
    
    // If album is not public and user is not admin/owner, deny access
    if (!album.isPublic && req.user.role !== 'ADMIN' && album.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this album' })
    }
    
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where: { albumId },
        include: {
          uploadedBy: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.image.count({ where: { albumId } })
    ])
    
    res.json({
      images,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    })
    
  } catch (error) {
    console.error('Get album images error:', error)
    res.status(500).json({ error: 'Failed to get album images' })
  }
})

// @route   DELETE /api/images/:imageId
// @desc    Delete an image
// @access  Admin or image owner
router.delete('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params
    
    // Find the image
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: { album: true }
    })
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' })
    }
    
    // Check permissions
    if (req.user.role !== 'ADMIN' && image.uploadedById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    try {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(image.cloudinaryId)
      console.log(`🗑️ Deleted from Cloudinary: ${image.cloudinaryId}`)
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError)
      // Continue with database deletion even if Cloudinary fails
    }
    
    // Delete from database
    await prisma.image.delete({
      where: { id: imageId }
    })
    
    res.json({ message: 'Image deleted successfully' })
    
  } catch (error) {
    console.error('Delete image error:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
})

// @route   PUT /api/images/:imageId
// @desc    Update image metadata
// @access  Admin or image owner
router.put('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params
    const updateSchema = Joi.object({
      title: Joi.string().max(100).optional(),
      caption: Joi.string().max(500).optional(),
      tags: Joi.array().items(Joi.string().max(50)).optional(),
      isPublic: Joi.boolean().optional()
    })
    
    const { error, value } = updateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      })
    }
    
    // Find the image
    const image = await prisma.image.findUnique({
      where: { id: imageId }
    })
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' })
    }
    
    // Check permissions
    if (req.user.role !== 'ADMIN' && image.uploadedById !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' })
    }
    
    // Update image
    const updatedImage = await prisma.image.update({
      where: { id: imageId },
      data: value,
      include: {
        album: {
          select: { title: true }
        },
        uploadedBy: {
          select: { name: true, email: true }
        }
      }
    })
    
    res.json({
      message: 'Image updated successfully',
      image: updatedImage
    })
    
  } catch (error) {
    console.error('Update image error:', error)
    res.status(500).json({ error: 'Failed to update image' })
  }
})

export default router
