import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Layout Components
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import DemoModeNotification from './components/DemoModeNotification'

// Page Components
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Layout Wrapper for Protected Pages
const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  const { user } = useAuth()

  return (
    <div className="App">
      <DemoModeNotification />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" replace />} 
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
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
