import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid('admin', 'user'),
  isActive: Joi.boolean()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            uploadedImages: true,
            uploadedDocuments: true,
            createdProjects: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            uploadedImages: true,
            uploadedDocuments: true,
            createdProjects: true,
            tasks: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile, admins can view any
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            uploadedImages: true,
            uploadedDocuments: true,
            createdProjects: true,
            tasks: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Users can only update their own profile (except role), admins can update any
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only admins can change roles and active status
    if (req.user.role !== 'admin') {
      delete value.role;
      delete value.isActive;
    }

    // Check if email is already taken
    if (value.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: value.email,
          id: { not: id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: value,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    next(error);
  }
});

// Change password
router.put('/:id/password', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = changePasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Users can only change their own password, admins can change any
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password (skip for admin changing other user's password)
    if (req.user.id === id) {
      const isValidPassword = await bcrypt.compare(value.currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(value.newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    next(error);
  }
});

// Get user activity/stats
router.get('/:id/activity', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Users can only view their own activity, admins can view any
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [recentImages, recentDocuments, recentTasks, recentProjects] = await Promise.all([
      prisma.image.findMany({
        where: { uploadedById: id },
        select: {
          id: true,
          title: true,
          createdAt: true,
          album: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.document.findMany({
        where: { uploadedById: id },
        select: {
          id: true,
          title: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.task.findMany({
        where: { assignedToId: id },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          project: { select: { name: true } }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),
      prisma.project.findMany({
        where: { createdById: id },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        recentImages,
        recentDocuments,
        recentTasks,
        recentProjects
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
