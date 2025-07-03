# 🔬 Assin Foso Research Platform - Production Stack

A modern, scalable research collaboration platform for the Infectious Disease Epidemiology Group at Assin Foso KCCR.

## 🏗️ Architecture Overview

### Production Stack
- **Frontend**: React.js + Tailwind CSS (Deployed on Netlify)
- **Backend**: Node.js + Express.js REST API
- **Database**: PostgreSQL (Neon.tech) with Prisma ORM
- **Media Storage**: Cloudinary for images and documents
- **Authentication**: Custom SQL-based with JWT tokens
- **Real-time**: Socket.IO for live updates
- **Email**: Nodemailer for invitations and notifications

### Key Features
- 🖼️ **Gallery Management** - Upload, organize, and browse research images
- 📊 **Project Tracking** - Comprehensive project lifecycle management
- 📋 **Task Management** - Kanban-style task boards with assignments
- 📅 **Calendar System** - Event scheduling and deadline tracking
- 👥 **Team Collaboration** - User roles, permissions, and team management
- 📧 **Invitation System** - Email-based user onboarding
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔒 **Secure Access** - Role-based authentication and authorization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Neon.tech account)
- Cloudinary account for media storage
- SMTP email service (Gmail, SendGrid, etc.)

### Backend Setup

```bash
# Clone and navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, Cloudinary credentials, etc.

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Seed database with initial data
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend root
cd ../

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL

# Start development server
npm run dev
```

### Production Deployment

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed deployment instructions.

## 📚 API Documentation

### Authentication Endpoints
```http
POST /api/auth/login          # User login
POST /api/auth/register       # User registration (invite-only)
GET  /api/auth/profile        # Get current user profile
POST /api/auth/logout         # User logout
```

### Core Resource Endpoints
```http
# Users
GET    /api/users             # List all users (admin)
GET    /api/users/{id}        # Get user by ID
PUT    /api/users/{id}        # Update user
DELETE /api/users/{id}        # Delete user (admin)

# Projects
GET    /api/projects          # List projects
POST   /api/projects          # Create project (admin)
GET    /api/projects/{id}     # Get project details
PUT    /api/projects/{id}     # Update project (admin)
DELETE /api/projects/{id}     # Delete project (admin)

# Tasks
GET    /api/tasks             # List tasks with filters
POST   /api/tasks             # Create task
PUT    /api/tasks/{id}        # Update task
DELETE /api/tasks/{id}        # Delete task
PATCH  /api/tasks/{id}/status # Update task status

# Images & Albums
GET    /api/albums            # List albums
POST   /api/albums            # Create album (admin)
GET    /api/albums/{id}       # Get album with images
POST   /api/images/upload     # Upload images (admin)
PUT    /api/images/{id}       # Update image metadata
DELETE /api/images/{id}       # Delete image (admin)

# Documents
GET    /api/documents         # List documents
POST   /api/documents/upload  # Upload document (admin)
GET    /api/documents/{id}    # Get document details
DELETE /api/documents/{id}    # Delete document (admin)

# Calendar
GET    /api/calendar          # List events
POST   /api/calendar          # Create event
PUT    /api/calendar/{id}     # Update event
DELETE /api/calendar/{id}     # Delete event

# Invitations
GET    /api/invites           # List invites (admin)
POST   /api/invites/send      # Send invitation (admin)
GET    /api/invites/token/{token} # Get invite by token
POST   /api/invites/accept    # Accept invitation
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts, roles, and authentication
- **projects** - Research projects with metadata and team assignments
- **tasks** - Project tasks with status, priority, and assignments
- **albums** - Image gallery organization
- **images** - Image metadata and Cloudinary URLs
- **documents** - Document storage and project associations
- **calendar_events** - Scheduled events and deadlines
- **invites** - Email invitation management

### Relationships
- Users can belong to multiple projects (many-to-many)
- Projects have many tasks, events, and documents
- Albums contain multiple images
- All uploads are tracked by user and timestamp

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication with 7-day expiration
- **Password Security**: bcrypt hashing with 12 rounds
- **Role-based Access**: Admin vs User permissions
- **Route Protection**: All API endpoints require authentication

### Security Middleware
- **Helmet**: Security headers (XSS, CSRF protection)
- **CORS**: Restricted to allowed origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation on all inputs

### File Upload Security
- **File Type Validation**: Only allowed image and document formats
- **Size Limits**: 10MB for images, 50MB for documents
- **Virus Scanning**: Cloudinary automatic malware detection
- **Secure URLs**: Temporary signed URLs for sensitive documents

## 📊 Storage Management

### Cloudinary Integration
- **Free Tier**: 25GB storage, 25GB monthly bandwidth
- **Automatic Optimization**: Image compression and format conversion
- **CDN Delivery**: Global content delivery network
- **Transformations**: On-the-fly image resizing and effects

### Storage Monitoring
```javascript
// Storage usage estimation
const projectEstimate = 120; // MB per project (100MB images + 20MB docs)
const maxProjects = Math.floor(25000 / projectEstimate); // ~208 projects
const currentUsage = await getStorageStats();
const remainingCapacity = 25000 - currentUsage.totalMB;
```

## 🧪 Testing

### Backend Testing
```bash
# Run API tests
npm run test

# Test specific endpoints
curl -X GET http://localhost:5000/health
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@assinfoso.edu.gh","password":"admin123456"}'
```

### Frontend Testing
```bash
# Run component tests
npm run test

# Build production bundle
npm run build

# Preview production build
npm run preview
```

## 📈 Performance Optimization

### Backend Optimizations
- **Database Indexing**: Optimized queries with Prisma
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for session and query caching
- **Compression**: Gzip response compression

### Frontend Optimizations
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Cloudinary transformations
- **Bundle Analysis**: Webpack bundle optimization
- **Service Workers**: Offline functionality and caching

## 🚨 Monitoring & Logging

### Error Tracking
- **Backend Logs**: Structured logging with timestamps
- **Error Boundaries**: React error handling
- **API Monitoring**: Request/response tracking
- **Database Monitoring**: Query performance tracking

### Analytics
- **User Activity**: Login patterns and feature usage
- **Performance Metrics**: API response times and error rates
- **Storage Usage**: Media upload trends and capacity planning
- **System Health**: Server uptime and resource usage

## 🔧 Development Workflow

### Local Development
```bash
# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
npm run dev

# Access application
open http://localhost:3000
```

### Environment Management
- **Development**: Local PostgreSQL + Cloudinary
- **Staging**: Neon database + Production Cloudinary
- **Production**: Full production stack

### Database Migrations
```bash
# Create migration
npm run db:migrate

# Reset database
npm run db:reset

# View database
npm run db:studio
```

## 📦 Deployment

### Backend Deployment (Railway)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Frontend Deployment (Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Database (Neon.tech)
- Managed PostgreSQL with automatic backups
- Branching for development/staging environments
- Connection pooling and scaling

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **ESLint**: JavaScript/React linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **TypeScript**: Gradual migration to TypeScript

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Assin Foso KCCR** - Infectious Disease Epidemiology Group
- **Neon.tech** - PostgreSQL hosting
- **Cloudinary** - Media storage and optimization
- **Netlify** - Frontend hosting and deployment

## 📞 Support

For technical support or questions:
- **Email**: tech-support@assinfoso.edu.gh
- **Documentation**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Issues**: GitHub Issues tab

---

**Built with ❤️ for advancing infectious disease research in Ghana**
