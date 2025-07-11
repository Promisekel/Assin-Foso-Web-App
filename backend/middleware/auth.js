import jwt from 'jsonwebtoken'
import { prisma } from '../server.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user not found.' })
    }
    
    // Add user to request object
    req.user = user
    next()
    
  } catch (error) {
    console.error('Authentication error:', error)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' })
    }
    
    res.status(500).json({ error: 'Authentication failed.' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' })
  }
  next()
}

export const requireAdminOrOwner = (userIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField]
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next()
    } else {
      res.status(403).json({ error: 'Access denied. Insufficient privileges.' })
    }
  }
}

// Alias for backward compatibility
export const authenticateToken = authenticate
