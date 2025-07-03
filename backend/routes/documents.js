import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, PowerPoint, and text files are allowed.'), false);
    }
  }
});

// Validation schemas
const updateDocumentSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(1000).allow(''),
  projectId: Joi.string().uuid().allow(null),
  tags: Joi.array().items(Joi.string().max(50))
});

// Get all documents
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      projectId, 
      fileType, 
      search,
      uploadedBy 
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (fileType) {
      where.fileType = fileType;
    }

    if (uploadedBy) {
      where.uploadedById = uploadedBy;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, name: true }
          },
          project: {
            select: { id: true, name: true, status: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

// Upload document (admin only)
router.post('/upload', authenticateToken, requireAdmin, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, projectId, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Document title is required'
      });
    }

    // Validate project exists if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true }
      });

      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'assin-foso/documents',
          public_id: `doc_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`,
          use_filename: true,
          unique_filename: true
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    const uploadResult = await uploadPromise;

    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        title,
        description: description || '',
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        url: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
        tags: tags ? JSON.parse(tags) : [],
        projectId: projectId || null,
        uploadedById: req.user.id
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Document upload error:', error);
    next(error);
  }
});

// Update document metadata
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateDocumentSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Validate project exists if provided
    if (value.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: value.projectId },
        select: { id: true }
      });

      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    const document = await prisma.document.update({
      where: { id },
      data: value,
      include: {
        uploadedBy: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    next(error);
  }
});

// Delete document (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get document details for Cloudinary deletion
    const document = await prisma.document.findUnique({
      where: { id },
      select: { cloudinaryId: true, title: true }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(document.cloudinaryId, {
        resource_type: 'auto'
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await prisma.document.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    next(error);
  }
});

// Get documents by project
router.get('/project/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { fileType } = req.query;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const where = { projectId };

    if (fileType) {
      where.fileType = fileType;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        project,
        documents
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get document statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const [totalCount, totalSize, fileTypeStats, recentDocuments] = await Promise.all([
      prisma.document.count(),
      prisma.document.aggregate({
        _sum: { fileSize: true }
      }),
      prisma.document.groupBy({
        by: ['fileType'],
        _count: { id: true },
        _sum: { fileSize: true }
      }),
      prisma.document.findMany({
        include: {
          uploadedBy: {
            select: { id: true, name: true }
          },
          project: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCount,
          totalSize: totalSize._sum.fileSize || 0
        },
        fileTypeStats,
        recentDocuments
      }
    });
  } catch (error) {
    next(error);
  }
});

// Download document (redirect to Cloudinary URL)
router.get('/:id/download', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      select: { url: true, title: true, originalName: true }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Redirect to Cloudinary URL for download
    res.redirect(document.url);
  } catch (error) {
    next(error);
  }
});

export default router;
