import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createEventSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  location: Joi.string().max(200).allow(''),
  type: Joi.string().valid('meeting', 'deadline', 'workshop', 'presentation', 'other').default('other'),
  isAllDay: Joi.boolean().default(false),
  projectId: Joi.string().uuid(),
  attendeeIds: Joi.array().items(Joi.string().uuid()).default([])
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(1000).allow(''),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  location: Joi.string().max(200).allow(''),
  type: Joi.string().valid('meeting', 'deadline', 'workshop', 'presentation', 'other'),
  isAllDay: Joi.boolean(),
  projectId: Joi.string().uuid().allow(null),
  attendeeIds: Joi.array().items(Joi.string().uuid())
});

// Get all calendar events
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { 
      start, 
      end, 
      projectId, 
      type,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    // Filter by date range
    if (start && end) {
      where.OR = [
        {
          startDate: {
            gte: new Date(start),
            lte: new Date(end)
          }
        },
        {
          endDate: {
            gte: new Date(start),
            lte: new Date(end)
          }
        },
        {
          AND: [
            { startDate: { lte: new Date(start) } },
            { endDate: { gte: new Date(end) } }
          ]
        }
      ];
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (type) {
      where.type = type;
    }

    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true }
          },
          project: {
            select: { id: true, name: true, status: true }
          },
          attendees: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.calendarEvent.count({ where })
    ]);

    // Format events for FullCalendar
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate.toISOString(),
      end: event.endDate.toISOString(),
      allDay: event.isAllDay,
      backgroundColor: getEventColor(event.type),
      borderColor: getEventColor(event.type),
      extendedProps: {
        description: event.description,
        location: event.location,
        type: event.type,
        project: event.project,
        createdBy: event.createdBy,
        attendees: event.attendees
      }
    }));

    res.json({
      success: true,
      data: formattedEvents,
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

// Get event by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        },
        attendees: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

// Create calendar event
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = createEventSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { attendeeIds, ...eventData } = value;

    // Validate project exists if provided
    if (eventData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: eventData.projectId },
        select: { id: true }
      });

      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Validate attendees exist if provided
    if (attendeeIds.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { 
          id: { in: attendeeIds },
          isActive: true
        },
        select: { id: true }
      });

      if (existingUsers.length !== attendeeIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more attendees not found or inactive'
        });
      }
    }

    const event = await prisma.calendarEvent.create({
      data: {
        ...eventData,
        createdById: req.user.id,
        attendees: {
          connect: attendeeIds.map(id => ({ id }))
        }
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        },
        attendees: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
});

// Update calendar event
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateEventSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    // Check if user can edit this event (admin or creator)
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
      select: { createdById: true }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== existingEvent.createdById) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or admin can edit events.'
      });
    }

    const { attendeeIds, ...eventData } = value;

    // Validate project exists if provided
    if (eventData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: eventData.projectId },
        select: { id: true }
      });

      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Validate attendees exist if provided
    if (attendeeIds && attendeeIds.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { 
          id: { in: attendeeIds },
          isActive: true
        },
        select: { id: true }
      });

      if (existingUsers.length !== attendeeIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more attendees not found or inactive'
        });
      }
    }

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...eventData,
        ...(attendeeIds && {
          attendees: {
            set: attendeeIds.map(id => ({ id }))
          }
        })
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, name: true, status: true }
        },
        attendees: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    next(error);
  }
});

// Delete calendar event
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user can delete this event (admin or creator)
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      select: { createdById: true }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.id !== event.createdById) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only event creator or admin can delete events.'
      });
    }

    await prisma.calendarEvent.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    next(error);
  }
});

// Get events by project
router.get('/project/:projectId', authenticateToken, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { start, end } = req.query;

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

    // Filter by date range if provided
    if (start && end) {
      where.OR = [
        {
          startDate: {
            gte: new Date(start),
            lte: new Date(end)
          }
        },
        {
          endDate: {
            gte: new Date(start),
            lte: new Date(end)
          }
        }
      ];
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        attendees: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    res.json({
      success: true,
      data: {
        project,
        events
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get event colors based on type
function getEventColor(type) {
  const colors = {
    meeting: '#3b82f6',      // blue
    deadline: '#ef4444',     // red
    workshop: '#10b981',     // green
    presentation: '#f59e0b', // yellow
    other: '#6b7280'         // gray
  };
  return colors[type] || colors.other;
}

export default router;
