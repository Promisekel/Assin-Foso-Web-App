import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import { prisma } from '../server.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  token: Joi.string().required() // Invite token
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// @route   POST /api/auth/register
// @desc    Register a new user with invite token
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      })
    }
    
    const { name, email, password, token } = value
    
    // Check if invite token exists and is valid
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { inviter: true }
    })
    
    if (!invite) {
      return res.status(400).json({ error: 'Invalid invite token' })
    }
    
    if (invite.status !== 'PENDING') {
      return res.status(400).json({ error: 'Invite token has already been used or expired' })
    }
    
    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      })
      return res.status(400).json({ error: 'Invite token has expired' })
    }
    
    if (invite.email !== email) {
      return res.status(400).json({ error: 'Email does not match the invitation' })
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: invite.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    // Mark invite as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        usedAt: new Date()
      }
    })
    
    // Generate JWT token
    const authToken = generateToken(user.id)
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token: authToken
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      })
    }
    
    const { email, password } = value
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    // Generate JWT token
    const token = generateToken(user.id)
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          department: user.department
        },
        token
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user information
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        department: true,
        createdAt: true,
        lastLoginAt: true
      }
    })
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      })
    }
    
    res.json({ 
      success: true,
      data: user
    })
    
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user information' })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  // In JWT, logout is typically handled client-side by removing the token
  // If you want server-side logout, you'd need to implement a token blacklist
  res.json({ message: 'Logout successful' })
})

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticate, (req, res) => {
  try {
    const newToken = generateToken(req.user.id)
    res.json({ token: newToken })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: 'Token refresh failed' })
  }
})

export default router
