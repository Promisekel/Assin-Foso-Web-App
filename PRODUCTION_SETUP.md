# 🚀 Production Firebase Setup Guide

## 📋 **Quick Setup Checklist**

- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password)
- [ ] Set up Firestore Database
- [ ] Set up Firebase Storage
- [ ] Get Firebase configuration
- [ ] Update .env file
- [ ] Deploy security rules
- [ ] Create first admin user
- [ ] Test authentication
- [ ] Deploy to Netlify

---

## 🔥 **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Project name: `assin-foso-research-platform`
4. Enable Google Analytics: **Yes** (recommended)
5. Choose analytics account or create new one

---

## 🔐 **Step 2: Set Up Authentication**

1. In Firebase Console → **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** ✅
4. Optionally enable **Google** for easier sign-in
5. Go to **Settings** tab → **Authorized domains**
6. Add your Netlify domain: `your-app-name.netlify.app`

---

## 📊 **Step 3: Set Up Firestore Database**

1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** (we'll add rules later)
3. Select location: **us-central1** (or closest to Ghana)
4. Click **Done**

---

## 📁 **Step 4: Set Up Storage**

1. Go to **Storage** → **Get started**
2. Choose **"Start in test mode"**
3. Select the **same location** as Firestore
4. Click **Done**

---

## 🔑 **Step 5: Get Firebase Configuration**

1. Go to **Project Settings** (gear icon ⚙️)
2. Scroll to **"Your apps"**
3. Click **Web icon** (`</>`)
4. App nickname: `Assin Foso Research Platform`
5. **DO NOT** check "Set up Firebase Hosting"
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## ⚙️ **Step 6: Update Environment Variables**

Replace the values in your `.env` file:

```bash
# Firebase Configuration (REPLACE WITH YOUR ACTUAL VALUES)
VITE_FIREBASE_API_KEY=AIzaSyC...your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🛡️ **Step 7: Deploy Security Rules**

### Firestore Rules:
1. Go to **Firestore Database** → **Rules**
2. Replace the rules with content from `firestore.rules`
3. Click **Publish**

### Storage Rules:
1. Go to **Storage** → **Rules**
2. Replace the rules with content from `storage.rules`
3. Click **Publish**

---

## 👤 **Step 8: Create Your First Admin User**

### Option A: Through Firebase Console
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Email: `your-admin-email@domain.com`
4. Password: Create a strong password
5. Click **Add user**

### Option B: Through the App (Recommended)
1. Start your app: `npm run dev`
2. Go to login page
3. Use any email/password to create account
4. Manually set role in Firestore

### Set Admin Role in Firestore:
1. Go to **Firestore Database**
2. Create collection: `users`
3. Document ID: `[your-user-uid]`
4. Add fields:
   ```json
   {
     "role": "admin",
     "permissions": ["read", "write", "admin", "invite"],
     "name": "Your Name",
     "email": "your-email@domain.com",
     "department": "Infectious Disease Epidemiology",
     "joinDate": "2024-12-30T10:00:00.000Z"
   }
   ```

---

## 🧪 **Step 9: Test Production Authentication**

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Check console logs** - should see:
   ```
   🔥 Firebase Configuration Status: PRODUCTION
   ✅ Firebase initialized successfully with production config
   🔥 Setting up Firebase Auth listener
   ```

3. **Test login** with your Firebase user credentials

4. **Verify user profile** loads correctly

---

## 🚀 **Step 10: Deploy to Netlify**

### Environment Variables in Netlify:
1. Go to your Netlify site dashboard
2. **Site settings** → **Environment variables**
3. Add all `VITE_*` variables from your `.env` file

### Deploy:
```bash
# Build the project
npm run build

# Deploy to Netlify (drag dist folder to Netlify)
# OR connect your GitHub repo for auto-deployment
```

---

## 🎯 **Step 11: User Management**

### Creating New Users:
1. **Admin Panel** in your app (accessible to admin users)
2. Send email invitations
3. Users receive invitation link
4. They create account with temporary password
5. Admin assigns appropriate role/permissions

### User Roles:
- **`admin`**: Full access to everything
- **`researcher`**: Can create/edit research content
- **`member`**: Read-only access
- **`guest`**: Limited access

---

## 🔧 **Troubleshooting**

### Common Issues:

1. **"Firebase not configured"**
   - Check `.env` file values
   - Restart development server
   - Verify Firebase config in console

2. **"Permission denied"**
   - Check Firestore rules
   - Verify user has correct role in `users` collection
   - Check authentication status

3. **"User not found"**
   - Create user profile in Firestore `users` collection
   - Ensure user document ID matches Firebase Auth UID

4. **Storage upload fails**
   - Check file size (max 10MB)
   - Verify file type is allowed
   - Check storage rules

---

## 📈 **Next Steps After Setup**

1. **✅ Invite team members** through admin panel
2. **✅ Upload real research publications**
3. **✅ Configure email templates** for invitations
4. **✅ Set up Google Sheets integration** for project tracking
5. **✅ Configure real-time chat** with Socket.IO
6. **✅ Set up video conferencing** with Daily.co
7. **✅ Add Google Analytics** for usage tracking

---

## 🆘 **Getting Help**

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security
- **Authentication Guide**: https://firebase.google.com/docs/auth/web/start

---

## 🎉 **You're Ready for Production!**

Once you complete these steps, your Assin Foso Research Platform will be running with:
- ✅ Real Firebase authentication
- ✅ Secure database rules
- ✅ File upload capabilities
- ✅ Role-based access control
- ✅ Production-ready deployment

**Your demo credentials will no longer work** - you'll use real Firebase accounts!
