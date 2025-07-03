import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled').default('planning'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  startDate: Joi.date().iso(),
  dueDate: Joi.date().iso().min(Joi.ref('startDate')),
  teamMemberIds: Joi.array().items(Joi.string().uuid()).default([])
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('planning', 'active', 'on_hold', 'completed', 'cancelled'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  startDate: Joi.date().iso(),
  dueDate: Joi.date().iso(),
  teamMemberIds: Joi.array().items(Joi.string().uuid())
});

// Get all projects
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true }
          },
          teamMembers: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { 
              tasks: true,
              documents: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      success: true,
      data: projects,
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

// Get project by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        teamMembers: {
          select: { id: true, name: true, email: true, role: true }
        },
        tasks: {
          include: {
            assignedTo: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        documents: {
          include: {
            uploadedBy: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { 
            tasks: true,
            documents: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Create project (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { error, value } = createProjectSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { teamMemberIds, ...projectData } = value;

    // Validate team members exist
    if (teamMemberIds.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { 
          id: { in: teamMemberIds },
          isActive: true
        },
        select: { id: true }
      });

      if (existingUsers.length !== teamMemberIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more team members not found or inactive'
        });
      }
    }

    const project = await prisma.project.create({
      data: {
        ...projectData,
        createdById: req.user.id,
        teamMembers: {
          connect: teamMemberIds.map(id => ({ id }))
        }
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        teamMembers: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { 
            tasks: true,
            documents: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
});

// Update project (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProjectSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { teamMemberIds, ...projectData } = value;

    // Validate team members exist if provided
    if (teamMemberIds && teamMemberIds.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { 
          id: { in: teamMemberIds },
          isActive: true
        },
        select: { id: true }
      });

      if (existingUsers.length !== teamMemberIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more team members not found or inactive'
        });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        ...(teamMemberIds && {
          teamMembers: {
            set: teamMemberIds.map(id => ({ id }))
          }
        })
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        teamMembers: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { 
            tasks: true,
            documents: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    next(error);
  }
});

// Delete project (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if project has tasks or documents
    const [taskCount, documentCount] = await Promise.all([
      prisma.task.count({ where: { projectId: id } }),
      prisma.document.count({ where: { projectId: id } })
    ]);

    if (taskCount > 0 || documentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete project with ${taskCount} tasks and ${documentCount} documents. Please remove them first.`
      });
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    next(error);
  }
});

// Get project statistics
router.get('/:id/stats', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const [taskStats, documentCount, teamMemberCount] = await Promise.all([
      prisma.task.groupBy({
        by: ['status'],
        where: { projectId: id },
        _count: { id: true }
      }),
      prisma.document.count({ where: { projectId: id } }),
      prisma.project.findUnique({
        where: { id },
        select: {
          _count: { select: { teamMembers: true } }
        }
      })
    ]);

    const taskStatusCounts = taskStats.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        project,
        stats: {
          tasks: {
            total: taskStats.reduce((sum, curr) => sum + curr._count.id, 0),
            byStatus: taskStatusCounts
          },
          documents: documentCount,
          teamMembers: teamMemberCount._count.teamMembers
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Add team member to project (admin only)
router.post('/:id/members', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if user is already a team member
    const existingMember = await prisma.project.findFirst({
      where: {
        id,
        teamMembers: {
          some: { id: userId }
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    await prisma.project.update({
      where: { id },
      data: {
        teamMembers: {
          connect: { id: userId }
        }
      }
    });

    res.json({
      success: true,
      message: 'Team member added successfully',
      data: user
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    next(error);
  }
});

// Remove team member from project (admin only)
router.delete('/:id/members/:userId', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    await prisma.project.update({
      where: { id },
      data: {
        teamMembers: {
          disconnect: { id: userId }
        }
      }
    });

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    next(error);
  }
});

export default router;
