import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createAlbumSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow(''),
  isPrivate: Joi.boolean().default(false)
});

const updateAlbumSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(500).allow(''),
  isPrivate: Joi.boolean()
});

// Get all albums
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      // Non-admins can only see public albums
      ...(req.user.role !== 'admin' && { isPrivate: false })
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true }
          },
          images: {
            select: { id: true },
            take: 1 // Just for count
          },
          _count: {
            select: { images: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.album.count({ where })
    ]);

    res.json({
      success: true,
      data: albums,
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

// Get album by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        images: {
          include: {
            uploadedBy: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        },
        _count: {
          select: { images: true }
        }
      }
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    // Check privacy permissions
    if (album.isPrivate && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private album'
      });
    }

    const totalImages = await prisma.image.count({
      where: { albumId: id }
    });

    res.json({
      success: true,
      data: {
        ...album,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalImages,
          pages: Math.ceil(totalImages / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create album (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { error, value } = createAlbumSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Check if album name already exists
    const existingAlbum = await prisma.album.findFirst({
      where: { name: value.name }
    });

    if (existingAlbum) {
      return res.status(400).json({
        success: false,
        message: 'Album name already exists'
      });
    }

    const album = await prisma.album.create({
      data: {
        ...value,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        _count: {
          select: { images: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Album created successfully',
      data: album
    });
  } catch (error) {
    next(error);
  }
});

// Update album (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateAlbumSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Check if new name already exists (if name is being changed)
    if (value.name) {
      const existingAlbum = await prisma.album.findFirst({
        where: {
          name: value.name,
          id: { not: id }
        }
      });

      if (existingAlbum) {
        return res.status(400).json({
          success: false,
          message: 'Album name already exists'
        });
      }
    }

    const album = await prisma.album.update({
      where: { id },
      data: value,
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        _count: {
          select: { images: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Album updated successfully',
      data: album
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }
    next(error);
  }
});

// Delete album (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if album has images
    const imageCount = await prisma.image.count({
      where: { albumId: id }
    });

    if (imageCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete album with ${imageCount} images. Please move or delete images first.`
      });
    }

    await prisma.album.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Album deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }
    next(error);
  }
});

// Get album statistics (admin only)
router.get('/:id/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const album = await prisma.album.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    const [imageCount, totalSize, recentImages] = await Promise.all([
      prisma.image.count({
        where: { albumId: id }
      }),
      prisma.image.aggregate({
        where: { albumId: id },
        _sum: { fileSize: true }
      }),
      prisma.image.findMany({
        where: { albumId: id },
        select: {
          id: true,
          title: true,
          createdAt: true,
          uploadedBy: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        album,
        stats: {
          imageCount,
          totalSize: totalSize._sum.fileSize || 0,
          recentImages
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
