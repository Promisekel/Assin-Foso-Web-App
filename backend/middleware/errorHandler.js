export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ 
      error: 'Duplicate entry. This record already exists.',
      field: err.meta?.target?.[0] || 'unknown'
    })
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ 
      error: 'Record not found.' 
    })
  }
  
  if (err.code === 'P2003') {
    return res.status(400).json({ 
      error: 'Invalid reference. Related record does not exist.' 
    })
  }
  
  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({ 
      error: 'Validation error',
      details: err.details.map(detail => detail.message)
    })
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' })
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' })
  }
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large. Maximum size is 10MB.' 
    })
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ 
      error: 'Too many files. Maximum 10 files per upload.' 
    })
  }
  
  // Default error
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
