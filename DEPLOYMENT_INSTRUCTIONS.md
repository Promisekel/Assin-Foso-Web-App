# Railway Deployment Instructions

## 1. Backend Deployment to Railway

### Prerequisites:
- GitHub account
- Railway account (sign up at railway.app)

### Steps:

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Production deployment ready"
git push origin main
```

2. **Deploy to Railway:**
- Go to https://railway.app
- Click "Deploy from GitHub repo"
- Select your repository
- Railway will auto-detect Node.js and deploy

3. **Set Environment Variables in Railway:**
```
DATABASE_URL=postgresql://neondb_owner:npg_anZ1B2UluseH@ep-broad-sun-a9qej5ml-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=assin-foso-research-platform-2025-production-secure-jwt-secret-key-256-bits-random
CLOUDINARY_CLOUD_NAME=dwwbegf2y
CLOUDINARY_API_KEY=416313624663736
CLOUDINARY_API_SECRET=your_actual_api_secret
NODE_ENV=production
PORT=5000
```

4. **Railway will provide a URL like:**
`https://your-app-name.up.railway.app`

## 2. Frontend Deployment to Netlify

### Steps:

1. **Update Frontend .env for production:**
```
VITE_API_BASE_URL=https://your-railway-url.up.railway.app/api
VITE_APP_ENV=production
```

2. **Build the frontend:**
```bash
npm run build
```

3. **Deploy to Netlify:**
- Go to https://netlify.com
- Drag and drop the `dist` folder
- Or connect your GitHub repo for auto-deployment

4. **Netlify will provide a URL like:**
`https://assinfoso-kccr-research.netlify.app`

## 3. Update CORS Settings

After deployment, update backend CORS to allow your Netlify domain.
