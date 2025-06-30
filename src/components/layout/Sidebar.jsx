import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home,
  Image,
  FolderOpen,
  Trello,
  Calendar,
  MessageCircle,
  Video,
  Users,
  Mail,
  BookOpen,
  FileText,
  Map,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const { isAdmin } = useAuth()

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Gallery', href: '/gallery', icon: Image },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Kanban Board', href: '/kanban', icon: Trello },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Chat Room', href: '/chat', icon: MessageCircle },
    { name: 'Meeting Room', href: '/meeting', icon: Video },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Contact', href: '/contact', icon: Mail },
    { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Interactive Map', href: '/map', icon: Map },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ]

  const adminItems = [
    { name: 'Admin Panel', href: '/admin', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActiveLink = (href) => {
    return location.pathname === href
  }

  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto z-30">
      <div className="px-3 py-4">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActiveLink(item.href)
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon 
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActiveLink(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Admin Section */}
        {isAdmin() && (
          <div className="mt-8">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
            </div>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActiveLink(item.href)
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon 
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActiveLink(item.href)
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md">
              + New Project
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md">
              + Schedule Meeting
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-md">
              + Upload Document
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-8 px-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-2">
                <p className="text-xs text-green-800">
                  System Status: Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
