import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { NavigationProvider, useNavigation } from './contexts/NavigationContext'
import { GalleryProvider } from './contexts/GalleryContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'

import FloatingActionButton from './components/FloatingActionButton'
import ParticleBackground from './components/ParticleBackground'

// Page Components
import HomePage from './pages/HomePage'
import LoginPage from './pages/NewLoginPage'
import SignUpPage from './pages/SignUpPage'
import Gallery from './pages/Gallery'
import ProjectTracker from './pages/ProjectTracker'
import KanbanBoard from './pages/KanbanBoard'
import Calendar from './pages/Calendar'
import ChatRoom from './pages/ChatRoom'
import MeetingRoom from './pages/MeetingRoom'
import Team from './pages/Team'
import Contact from './pages/Contact'
import KnowledgeBase from './pages/KnowledgeBase'
import DocumentViewer from './pages/DocumentViewer'
import InteractiveMap from './pages/InteractiveMap'
import AdminPanel from './pages/AdminPanel'
import Analytics from './pages/Analytics'
import ContentManager from './pages/ContentManager'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Layout Wrapper for Protected Pages
const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-green-400/10 to-blue-400/10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/5 to-pink-400/5 animate-pulse delay-500"></div>
      </div>
      
      <Navbar />
      <div className="flex relative">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
      <Footer />
    </div>
  )
}

// Main content area that responds to sidebar state
const MainContent = ({ children }) => {
  const { isSidebarOpen, isMobile } = useNavigation()
  
  return (
    <main className={`
      flex-1 transition-all duration-300 ease-in-out p-6 relative z-10 pt-20
      ${isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-16'}
    `}>
      <div className="backdrop-blur-sm bg-white/70 rounded-xl shadow-lg border border-white/20 p-6 min-h-[calc(100vh-12rem)]">
        {children}
      </div>
      <FloatingActionButton />
    </main>
  )
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <NavigationProvider>
      <GalleryProvider>
        <div className="App">
          <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <SignUpPage /> : <Navigate to="/" replace />} 
        />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <HomePage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/gallery" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Gallery />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ProjectTracker />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/kanban" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <KanbanBoard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Calendar />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ChatRoom />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/meeting" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <MeetingRoom />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/team" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Team />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/contact" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Contact />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/knowledge-base" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <KnowledgeBase />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/documents" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DocumentViewer />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/map" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <InteractiveMap />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <AdminPanel />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Analytics />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/content-manager" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ContentManager />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
      </GalleryProvider>
    </NavigationProvider>
  )
}

export default App
