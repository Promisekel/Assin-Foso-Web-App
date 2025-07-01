import React, { useState } from 'react'
import { Plus, X, Calendar, FolderOpen, Upload, Users, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const quickActions = [
    { name: 'New Project', href: '/projects', icon: FolderOpen, color: 'bg-primary-500' },
    { name: 'Schedule Meeting', href: '/calendar', icon: Calendar, color: 'bg-secondary-500' },
    { name: 'Upload File', href: '/documents', icon: Upload, color: 'bg-success-500' },
    { name: 'Join Chat', href: '/chat', icon: MessageCircle, color: 'bg-purple-500' },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {quickActions.map((action, index) => (
          <Link
            key={action.name}
            to={action.href}
            className={`flex items-center space-x-3 px-4 py-3 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInRight group`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setIsOpen(false)}
          >
            <action.icon className="h-5 w-5 group-hover:animate-wiggle" />
            <span className="text-sm font-medium whitespace-nowrap">{action.name}</span>
          </Link>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 group-hover:animate-wiggle" />
        ) : (
          <Plus className="h-6 w-6 group-hover:animate-wiggle" />
        )}
      </button>

      {/* Ripple effect */}
      <div className={`absolute inset-0 rounded-full bg-primary-400 animate-ping ${
        isOpen ? 'opacity-75' : 'opacity-0'
      } transition-opacity duration-300`}></div>
    </div>
  )
}

export default FloatingActionButton
