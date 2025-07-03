# 🚀 Assin Foso Research Platform - New Stack Migration Guide

## 📋 Overview

This guide will help you migrate from Firebase to the new production-ready stack:

**New Stack:**
- **Frontend**: React.js + Tailwind CSS (Netlify)
- **Backend**: Node.js + Express.js API 
- **Database**: PostgreSQL (Neon.tech)
- **ORM**: Prisma
- **Media Storage**: Cloudinary
- **Authentication**: Custom SQL-based with JWT

## 🛠 Setup Instructions

### 1. Backend Setup (Node.js + Express + PostgreSQL)

#### A. Database Setup (Neon.tech)

1. **Create Neon Account**: Go to [neon.tech](https://neon.tech) and sign up
2. **Create Database**: Create a new PostgreSQL database
3. **Get Connection String**: Copy your database URL (format: `postgresql://username:password@hostname/dbname`)

#### B. Cloudinary Setup

1. **Create Account**: Go to [cloudinary.com](https://cloudinary.com) and sign up
2. **Get Credentials**: From dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

#### C. Backend Environment Variables

Create `backend/.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@hostname/dbname"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-256-bits-long"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (SMTP) - Use Gmail, SendGrid, or similar
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Assin Foso Research <your-email@gmail.com>"

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://your-netlify-site.netlify.app"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS="https://your-netlify-site.netlify.app"
```

#### D. Backend Deployment Commands

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with initial data
npm run db:seed

# Start development server
npm run dev

# Or start production server
npm start
```

#### E. Backend Deployment (Railway/Render)

**Option 1: Railway**
1. Connect GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically

**Option 2: Render**
1. Connect GitHub repo to Render
2. Set build command: `npm install && npm run db:generate`
3. Set start command: `npm start`
4. Add environment variables

### 2. Frontend Setup (React + New API)

#### A. Frontend Environment Variables

Update `frontend/.env`:

```bash
# New Backend API
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
VITE_SOCKET_SERVER_URL=https://your-backend-url.railway.app

# App URL
VITE_APP_URL=https://your-netlify-site.netlify.app

# Optional third-party services
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
VITE_DAILY_API_KEY=your-daily-video-key
```

#### B. Update App.jsx to Use New Contexts

Replace the old Firebase contexts with new ones:

```jsx
// OLD: Remove these imports
// import { AuthProvider } from './contexts/AuthContext'
// import { GalleryProvider } from './contexts/GalleryContext'

// NEW: Add these imports
import { AuthProvider } from './contexts/NewAuthContext'
import { GalleryProvider } from './contexts/NewGalleryContext'

// Update the provider wrapping
function App() {
  return (
    <AuthProvider>
      <GalleryProvider>
        {/* Your existing app components */}
      </GalleryProvider>
    </AuthProvider>
  )
}
```

#### C. Frontend Deployment (Netlify)

Your app is already on Netlify, just update:

1. **Environment Variables**: Add new env vars in Netlify dashboard
2. **Build Settings**: Should remain the same (`npm run build`)
3. **Deploy**: Push changes to trigger auto-deploy

### 3. Migration Steps

#### Step 1: Test Backend Locally

```bash
cd backend
npm run dev
```

Visit `http://localhost:5000/health` - should show "OK"

#### Step 2: Test Database Connection

```bash
npm run db:push
npm run db:seed
```

You should see sample data created.

#### Step 3: Test Image Upload

Use API client (Postman/Insomnia) to test:
- Login: `POST /api/auth/login`
- Upload: `POST /api/images/upload` (with Bearer token)

#### Step 4: Update Frontend Gradually

1. **Replace contexts**: Use NewAuthContext and NewGalleryContext
2. **Update components**: Replace Firebase calls with new API calls
3. **Test features**: Gallery, login, image upload, etc.

#### Step 5: Remove Firebase Code

Once everything works:
1. Remove Firebase dependencies from package.json
2. Delete Firebase config files
3. Delete old context files

## 📊 Storage Estimation

### Cloudinary Free Tier Limits
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month

### Project Estimation (10-15 projects, 5 team members)
- **Per Project**: ~100MB images + 20MB documents = 120MB
- **15 Projects**: 15 × 120MB = 1.8GB
- **Buffer for Growth**: 3-5GB recommended
- **Total Usage**: ~5GB (20% of free tier)

### Monitoring Storage
- Use `/api/images/stats/overview` endpoint
- Dashboard shows: total usage, percentage used, projects remaining
- Set up alerts when approaching 80% usage

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with 12 rounds
- **Token Expiry**: 7-day expiration with refresh capability

### Authorization
- **Role-based**: Admin vs User permissions
- **Route Protection**: All API routes require authentication
- **Resource Ownership**: Users can only modify their own data

### Security Middleware
- **Helmet**: Security headers
- **CORS**: Restricted origins
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schema validation

## 🧪 Testing Checklist

### Backend API Testing
- [ ] Health check: `GET /health`
- [ ] Auth: `POST /api/auth/login`
- [ ] Users: `GET /api/users/profile`
- [ ] Images: `POST /api/images/upload`
- [ ] Albums: `GET /api/albums`
- [ ] Projects: `GET /api/projects`
- [ ] Tasks: `GET /api/tasks`
- [ ] Calendar: `GET /api/calendar`
- [ ] Invites: `POST /api/invites/send`

### Frontend Testing
- [ ] Login/logout
- [ ] Image upload (admin only)
- [ ] Gallery browsing
- [ ] Album management
- [ ] Project tracking
- [ ] Calendar events
- [ ] User management
- [ ] Invite system

### Integration Testing
- [ ] Socket.IO real-time updates
- [ ] Email invitations
- [ ] File upload to Cloudinary
- [ ] Database persistence
- [ ] Error handling

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify network access to Neon
   - Run `npm run db:push` to sync schema

2. **Cloudinary Upload Failed**
   - Verify API credentials
   - Check file size limits (50MB)
   - Ensure proper CORS settings

3. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token in localStorage
   - Check API request headers

4. **CORS Errors**
   - Add frontend URL to ALLOWED_ORIGINS
   - Verify credentials: true in CORS config

### Logs and Monitoring
- **Backend Logs**: Check Railway/Render logs
- **Frontend Errors**: Browser developer console
- **Database**: Use Prisma Studio (`npm run db:studio`)
- **Storage**: Cloudinary media library

## 📚 Additional Resources

- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **JWT Guide**: [jwt.io/introduction](https://jwt.io/introduction)

## 🎯 Next Steps After Migration

1. **Performance Optimization**: Add caching, image compression
2. **Monitoring**: Set up error tracking (Sentry)
3. **Backups**: Database backup strategy
4. **CDN**: Optimize image delivery
5. **Testing**: Unit and integration tests
6. **Documentation**: API documentation with Swagger

---

✅ **Migration Complete!** Your app now runs on a production-ready, scalable, Firebase-free stack!
