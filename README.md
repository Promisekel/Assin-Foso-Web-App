# Assin Foso KCCR Research Platform

A comprehensive web application for the Infectious Disease Epidemiology Group at Assin Foso KCCR, providing collaborative tools for research management, team communication, and data visualization.

## 🚀 Features

### Core Features
- **🏠 Dashboard**: Overview of projects, activities, and notifications
- **📸 Gallery**: Image management with album organization
- **📊 Project Tracker**: Google Sheets integration for project management
- **📋 Kanban Board**: Drag-and-drop task management
- **📅 Calendar**: Event scheduling and deadline tracking
- **💬 Real-time Chat**: Team communication with Socket.IO
- **🎥 Video Meetings**: Integrated video conferencing
- **👥 Team Management**: Staff profiles and role management
- **📞 Contact System**: Contact forms with EmailJS integration

### Advanced Features
- **🗺️ Interactive Maps**: Research location mapping with Leaflet
- **📚 Knowledge Base**: Document and protocol management
- **📄 Document Viewer**: PDF and document preview
- **📈 Analytics**: Usage tracking and metrics
- **🔐 Authentication**: Firebase-based secure authentication
- **👨‍💼 Admin Panel**: User management and system administration
- **📧 Email Invitations**: Invite system for new users

## 🛠️ Tech Stack

- **Frontend**: React.js 18 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Real-time**: Socket.IO
- **Maps**: Leaflet.js + React Leaflet
- **Calendar**: FullCalendar
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Hosting**: Netlify

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assin-foso-web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Storage
   - Copy your config and update `src/config/firebase.js`

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy dist folder to your hosting provider
```

## 🔧 Configuration

### Google Sheets Integration
1. Enable Google Sheets API in Google Cloud Console
2. Create service account and download credentials
3. Share your Google Sheet with the service account email
4. Update the API integration in relevant components

### Socket.IO Server
1. Set up a Socket.IO server for real-time chat
2. Update the server URL in `src/contexts/SocketContext.jsx`

### Email Integration
1. Set up EmailJS account
2. Configure email templates
3. Update EmailJS configuration in contact forms

## 👥 User Roles

- **Admin**: Full access to all features and user management
- **Member**: Access to most features except admin functions
- **Viewer**: Read-only access to public content

## 🔒 Security Features

- Firebase Authentication with email/password
- Role-based access control
- Protected routes
- Input validation and sanitization
- Secure API integrations

## 🎨 Customization

### Theming
- Colors and design tokens are defined in `tailwind.config.js`
- Custom components styles in `src/index.css`

### Adding New Features
1. Create component in `src/components/` or `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/layout/Sidebar.jsx`

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 📊 Performance

- Optimized with Vite for fast development and builds
- Code splitting and lazy loading
- Image optimization
- Efficient state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: research@assinfoso-kccr.org
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🙏 Acknowledgments

- Assin Foso KCCR team
- Open source community
- Research collaborators

---

**Built with ❤️ for global health research**
