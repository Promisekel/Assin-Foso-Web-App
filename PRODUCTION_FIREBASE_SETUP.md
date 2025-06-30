# 🔥 Firebase Production Setup - Complete Guide

## 📋 **Before You Start - Checklist**

- [ ] Firebase account created
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Storage bucket created
- [ ] Firebase configuration copied
- [ ] Environment variables updated
- [ ] Security rules deployed

---

## 🚀 **Step-by-Step Setup Process**

### **1. Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. **Project name**: `assin-foso-research-platform`
4. **Enable Google Analytics**: Yes (recommended)
5. **Analytics account**: Create new or use existing

### **2. Enable Authentication**

1. **Go to Authentication** → **Get started**
2. **Sign-in method** tab
3. **Enable Email/Password**
4. **Enable Email link** (optional, for passwordless)
5. **Add authorized domains** (your Netlify domain later)

### **3. Create Firestore Database**

1. **Go to Firestore Database** → **Create database**
2. **Start in test mode** (we'll secure it with rules)
3. **Location**: Choose `us-central1` or closest to Ghana
4. **Done**

### **4. Set Up Storage**

1. **Go to Storage** → **Get started**
2. **Start in test mode**
3. **Same location as Firestore**
4. **Done**

### **5. Get Your Configuration**

1. **Go to Project Settings** (⚙️ gear icon)
2. **Scroll to "Your apps"** section
3. **Click Web icon** `</>`
4. **App nickname**: `Assin Foso Research Platform`
5. **Register app**
6. **Copy the configuration object**

**Example configuration you'll get:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyExample-your-api-key-here",
  authDomain: "assin-foso-research.firebaseapp.com",
  projectId: "assin-foso-research",
  storageBucket: "assin-foso-research.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
}
```

### **6. Update Your Environment Variables**

Replace the values in your `.env` file:

```bash
# Replace with your actual Firebase configuration
VITE_FIREBASE_API_KEY=AIzaSyExample-your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=assin-foso-research.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=assin-foso-research
VITE_FIREBASE_STORAGE_BUCKET=assin-foso-research.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### **7. Deploy Security Rules**

**Firestore Rules:**
1. **Go to Firestore** → **Rules** tab
2. **Replace with the rules from `firestore.rules` file**
3. **Publish**

**Storage Rules:**
1. **Go to Storage** → **Rules** tab
2. **Replace with the rules from `storage.rules` file**
3. **Publish**

### **8. Create Your First Admin User**

1. **Go to Authentication** → **Users** tab
2. **Add user** manually
3. **Email**: `admin@assinfoso-kccr.org`
4. **Password**: Create a strong password
5. **Save**

6. **Go to Firestore** → **Start collection**
7. **Collection ID**: `users`
8. **Document ID**: Use the User UID from Authentication
9. **Add fields**:
   ```
   email: admin@assinfoso-kccr.org
   name: System Administrator
   role: admin
   department: IT Administration
   permissions: ["read", "write", "delete", "invite", "manage_users", "analytics"]
   createdAt: timestamp (now)
   status: active
   ```

### **9. Test Your Setup**

1. **Restart your development server**
2. **Check console** for Firebase initialization
3. **Try logging in** with your admin credentials
4. **Verify Firestore** data is being read/written

---

## 🔐 **Security Configuration**

### **Firestore Security Rules** (Already created in `firestore.rules`)

Key features of our security rules:
- ✅ **Users can only access their own data**
- ✅ **Role-based permissions** (admin, researcher, member)
- ✅ **Admin-only collections** protected
- ✅ **Research publications** manageable by researchers
- ✅ **Project-based access** control

### **Storage Security Rules** (Already created in `storage.rules`)

Key features:
- ✅ **File size limits** (5MB profiles, 50MB publications)
- ✅ **Role-based upload** permissions
- ✅ **User-specific folders** for profiles
- ✅ **Project-based access** for project files

---

## 👥 **User Management System**

Your app now includes a complete user invitation system:

### **Admin Features:**
- ✅ **Invite new users** by email
- ✅ **Assign roles** (admin, researcher, member)
- ✅ **Manage user permissions**
- ✅ **View all users** and invitations
- ✅ **Cancel pending invitations**

### **User Roles:**

**Admin:**
- Full access to everything
- Can invite users
- Manage all content
- View analytics

**Researcher:**
- Read/write research publications
- Manage projects
- Upload files
- Create knowledge base articles

**Member:**
- Read access to content
- Can comment and participate
- Limited upload permissions

### **Invitation Process:**
1. **Admin sends invitation** with email and role
2. **System creates user account** with temporary password
3. **Password reset email** sent automatically
4. **User sets their own password** on first login

---

## 🌐 **Deployment to Netlify**

### **Environment Variables on Netlify:**

1. **Go to Netlify site settings**
2. **Environment variables** section
3. **Add all VITE_ variables** from your `.env` file
4. **Deploy site**

### **Domain Configuration:**

1. **Copy your Netlify domain** (e.g., `amazing-site-123.netlify.app`)
2. **Go to Firebase Authentication** → **Settings**
3. **Add domain** to authorized domains
4. **Save**

---

## 🧪 **Testing Your Production App**

### **Test Checklist:**

- [ ] **Firebase initialized** without errors
- [ ] **Admin login** works
- [ ] **User profile** loads from Firestore
- [ ] **Firestore rules** prevent unauthorized access
- [ ] **File uploads** work (if testing storage)
- [ ] **User invitation** system works
- [ ] **All pages** load correctly
- [ ] **Research publications** section works

### **Creating Test Users:**

Use the invitation system or manually create users:

```javascript
// In Firebase Console → Firestore
Collection: users
Document ID: [User UID from Authentication]
Fields:
{
  email: "researcher@assinfoso-kccr.org",
  name: "Dr. Research Scientist",
  role: "researcher",
  department: "Infectious Disease Epidemiology",
  permissions: ["read", "write", "publish", "manage_projects"],
  createdAt: [timestamp],
  status: "active"
}
```

---

## ⚠️ **Important Security Notes**

1. **Never commit `.env`** to version control
2. **Use different projects** for development/production
3. **Regularly review** Firestore security rules
4. **Monitor usage** in Firebase Console
5. **Enable App Check** for additional security (optional)
6. **Set up billing alerts** to monitor usage

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**"Firebase not initialized"**
- Check `.env` file has correct values
- Restart development server
- Verify all environment variables are set

**"Permission denied"**
- Check Firestore security rules
- Verify user has correct role in Firestore
- Check user document exists

**"Invalid API key"**
- Double-check Firebase configuration
- Verify project ID and API key
- Check if project is active

**"Domain not authorized"**
- Add your domain to Firebase Authentication settings
- Include both with and without www

---

## 📞 **Support Resources**

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)
- [Netlify Documentation](https://docs.netlify.com/)

---

## ✅ **Next Steps After Setup**

1. **Create your first admin user**
2. **Invite team members**
3. **Add research publications**
4. **Set up project structure**
5. **Configure email templates** (optional)
6. **Set up analytics** (Google Analytics integration)
7. **Deploy to production**

---

**🎉 Your Assin Foso Research Platform is now ready for production use!**
