# 🔥 Firebase Setup Guide for Assin Foso Research Web App

## 🚨 Current Status: Demo Mode Active

Your app is currently running in **Demo Mode** with placeholder Firebase credentials. This allows you to test the app functionality, but authentication and real-time features won't work until you set up proper Firebase credentials.

## 🎯 Demo Credentials (Current)

**Admin Access:**
- Email: `admin@assinfoso-kccr.org`
- Password: `admin123`

**Member Access:**
- Email: `member@assinfoso-kccr.org`
- Password: `member123`

## 🚀 Setting Up Real Firebase (Required for Production)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Project name: `assin-foso-research-app`
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account

### Step 2: Set Up Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Enable **Email link (passwordless sign-in)** if desired

### Step 3: Set Up Firestore Database

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location close to your users (e.g., `us-central1`)

### Step 4: Set Up Storage

1. Go to **Storage**
2. Click **"Get started"**
3. Accept the default security rules
4. Choose the same location as Firestore

### Step 5: Get Configuration Keys

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **"Web"** icon (`</>`)
4. Register app name: `Assin Foso Research Platform`
5. **Copy the configuration object**

### Step 6: Update Environment Variables

Replace the values in your `.env` file with the real Firebase config:

```bash
# Firebase Configuration (Replace with your actual values)
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-actual-measurement-id
```

### Step 7: Set Up Firestore Security Rules

In Firestore Database > Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Research publications are readable by authenticated users
    match /publications/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'researcher'];
    }
    
    // Projects are readable by authenticated users
    match /projects/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'researcher'];
    }
    
    // Admin-only collections
    match /admin/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 8: Set Up Storage Security Rules

In Storage > Rules, replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images and documents
    match /uploads/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Profile pictures
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ⚙️ Additional Firebase Features to Enable

### 1. Cloud Functions (Optional)
- For advanced backend logic
- Email invitations
- Data processing

### 2. Cloud Messaging (Optional)
- Push notifications
- Real-time updates

### 3. Remote Config (Optional)
- Feature flags
- A/B testing

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment variables** for all sensitive data
3. **Set up proper Firestore rules** before going to production
4. **Enable App Check** for additional security
5. **Monitor usage** in Firebase Console

## 🧪 Testing Firebase Setup

After updating your `.env` file:

1. **Restart your development server**
2. **Try logging in** with real credentials
3. **Check browser console** for any errors
4. **Verify Firestore** data is being written
5. **Test file uploads** to Storage

## 📱 Deployment Considerations

### For Netlify Deployment:

1. Add environment variables in **Netlify Site Settings**
2. Go to **Site settings > Environment variables**
3. Add all `VITE_` prefixed variables
4. Redeploy your site

### Security Headers:

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase not initialized"** - Check `.env` file and restart server
2. **"Permission denied"** - Update Firestore rules
3. **"API key not valid"** - Double-check Firebase config
4. **"App not found"** - Verify project ID and app registration

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

## 📝 Next Steps

1. ✅ **Set up real Firebase project** (follow this guide)
2. ✅ **Test authentication** with real users
3. ✅ **Configure user roles** in Firestore
4. ✅ **Set up email invitations**
5. ✅ **Deploy to production** on Netlify

---

**Note:** The app will continue to work in demo mode for testing purposes, but you'll need real Firebase credentials for production deployment and full functionality.
