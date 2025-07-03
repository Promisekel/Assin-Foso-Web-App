import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled').default('todo'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().iso(),
  projectId: Joi.string().uuid().required(),
  assignedToId: Joi.string().uuid(),
  tags: Joi.array().items(Joi.string().max(50)).default([])
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(1000).allow(''),
  status: Joi.string().valid('todo', 'in_progress', 'review', 'done', 'cancelled'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  dueDate: Joi.date().iso().allow(null),
  assignedToId: Joi.string().uuid().allow(null),
  tags: Joi.array().items(Joi.string().max(50))
});

// Get all tasks
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      assignedTo, 
      projectId, 
      search,
      dueDate 
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.dueDate = {
        gte: date,
        lt: nextDay
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: {
            select: { id: true, name: true, status: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          createdBy: {
            select: { id: true, name: true }
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
      prisma.task.count({ where })
    ]);

    res.json({
      success: true,
      data: tasks,
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

// Get task by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { 
            id: true, 
            name: true, 
            status: true,
            teamMembers: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// Create task
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: value.projectId },
      select: { id: true, name: true, status: true }
    });

    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if assigned user exists and is active
    if (value.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: value.assignedToId },
        select: { id: true, isActive: true }
      });

      if (!assignedUser || !assignedUser.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found or inactive'
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        ...value,
        createdById: req.user.id
      },
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateTaskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Check if assigned user exists and is active (if being assigned)
    if (value.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: value.assignedToId },
        select: { id: true, isActive: true }
      });

      if (!assignedUser || !assignedUser.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user not found or inactive'
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: value,
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    next(error);
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user can delete this task (admin or creator)
    const task = await prisma.task.findUnique({
      where: { id },
      select: { createdById: true }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== task.createdById) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only task creator or admin can delete tasks.'
      });
    }

    await prisma.task.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    next(error);
  }
});

// Get tasks by project
router.get('/project/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, assignedTo } = req.query;

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

    if (status) {
      where.status = status;
    }

    if (assignedTo) {
      where.assignedToId = assignedTo;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: {
        project,
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get tasks assigned to user
router.get('/assigned/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, priority } = req.query;

    // Users can only view their own assigned tasks, admins can view any
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const where = { assignedToId: userId };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, status: true }
        },
        createdBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// Update task status (for Kanban board)
router.patch('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['todo', 'in_progress', 'review', 'done', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignedTo: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    next(error);
  }
});

export default router;
