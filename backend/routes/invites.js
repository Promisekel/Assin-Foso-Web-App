import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Validation schemas
const sendInviteSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('admin', 'user').default('user')
});

const acceptInviteSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required()
});

// Get all invites (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }

    const [invites, total] = await Promise.all([
      prisma.invite.findMany({
        where,
        include: {
          invitedBy: {
            select: { id: true, name: true, email: true }
          },
          acceptedBy: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.invite.count({ where })
    ]);

    res.json({
      success: true,
      data: invites,
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

// Get invite by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { id },
      include: {
        invitedBy: {
          select: { id: true, name: true, email: true }
        },
        acceptedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    res.json({
      success: true,
      data: invite
    });
  } catch (error) {
    next(error);
  }
});

// Send invite (admin only)
router.post('/send', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { error, value } = sendInviteSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { email, name, role } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email,
        status: 'pending'
      }
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Pending invite already exists for this email'
      });
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        email,
        name,
        role,
        token,
        expiresAt,
        invitedById: req.user.id
      },
      include: {
        invitedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Send invite email
    const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Invitation to Join Assin Foso Research Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You're Invited!</h2>
          <p>Hello ${name},</p>
          <p>You have been invited by ${req.user.name} to join the Assin Foso Research Platform as a ${role}.</p>
          <p>Click the button below to accept your invitation and create your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This invitation will expire on ${expiresAt.toLocaleDateString()}.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you can't click the button, copy and paste this link into your browser:<br>
            <a href="${inviteLink}">${inviteLink}</a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Assin Foso KCCR - Infectious Disease Epidemiology Group
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Delete the invite if email fails
      await prisma.invite.delete({ where: { id: invite.id } });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send invitation email. Please check email configuration.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        invitedBy: invite.invitedBy
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get invite by token (public)
router.get('/token/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true
      }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite token'
      });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has already been used or expired'
      });
    }

    if (new Date() > invite.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired'
      });
    }

    res.json({
      success: true,
      data: invite
    });
  } catch (error) {
    next(error);
  }
});

// Accept invite (public)
router.post('/accept', async (req, res, next) => {
  try {
    const { error, value } = acceptInviteSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { token, password, name } = value;

    // Find and validate invite
    const invite = await prisma.invite.findUnique({
      where: { token }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite token'
      });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has already been used or expired'
      });
    }

    if (new Date() > invite.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and update invite in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email: invite.email,
          password: hashedPassword,
          role: invite.role,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      // Update invite status
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: 'accepted',
          acceptedById: user.id,
          acceptedAt: new Date()
        }
      });

      return user;
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now log in.',
      data: result
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
});

// Resend invite (admin only)
router.post('/:id/resend', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { id }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only resend pending invitations'
      });
    }

    // Generate new token and extend expiry
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedInvite = await prisma.invite.update({
      where: { id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt
      }
    });

    // Send new invite email
    const inviteLink = `${process.env.FRONTEND_URL}/invite/${newToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: invite.email,
      subject: 'Invitation Reminder - Assin Foso Research Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Invitation Reminder</h2>
          <p>Hello ${invite.name},</p>
          <p>This is a reminder about your invitation to join the Assin Foso Research Platform as a ${invite.role}.</p>
          <p>Click the button below to accept your invitation and create your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This invitation will expire on ${newExpiresAt.toLocaleDateString()}.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Assin Foso KCCR - Infectious Disease Epidemiology Group
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send invitation email'
      });
    }

    res.json({
      success: true,
      message: 'Invitation resent successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Cancel invite (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { id }
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: 'Invite not found'
      });
    }

    if (invite.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an accepted invitation'
      });
    }

    await prisma.invite.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get invite statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const [statusStats, recentInvites] = await Promise.all([
      prisma.invite.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.invite.findMany({
        include: {
          invitedBy: {
            select: { id: true, name: true }
          },
          acceptedBy: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const statusCounts = statusStats.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        stats: {
          total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
          byStatus: statusCounts
        },
        recentInvites
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
