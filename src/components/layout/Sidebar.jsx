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
  Shield,
  Edit3,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigation } from '../../contexts/NavigationContext'

const Sidebar = () => {
  const location = useLocation()
  const { isAdmin } = useAuth()
  const { isSidebarOpen, isMobile, closeSidebar } = useNavigation()

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
    { name: 'Content Manager', href: '/content-manager', icon: Edit3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActiveLink = (href) => {
    return location.pathname === href
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64' : 'w-16'}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/20 overflow-hidden
      `}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-primary-50/30"></div>
        
        <div className="relative h-full overflow-y-auto">
          <div className="px-3 py-4">
            {/* Main Navigation */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveLink(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={isMobile ? closeSidebar : undefined}
                    className={`
                      group flex items-center text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden
                      ${isSidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'}
                      ${isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700 hover:shadow-md hover:scale-105'
                      }
                    `}
                  >
                    <Icon className={`
                      h-5 w-5 flex-shrink-0 transition-all duration-200
                      ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'}
                      ${isSidebarOpen ? 'mr-3' : 'mr-0'}
                      group-hover:scale-110
                    `} />
                    <span className={`
                      transition-all duration-300 whitespace-nowrap
                      ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 w-0'}
                    `}>
                      {item.name}
                    </span>
                    {!isSidebarOpen && (
                      <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>

        {/* Admin Section */}
        {isAdmin() && (
          <div className="mt-8">
            <div className={`px-3 py-2 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
            </div>
            <nav className="space-y-1">
              {adminItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveLink(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={isMobile ? closeSidebar : undefined}
                    className={`
                      group flex items-center text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden
                      ${isSidebarOpen ? 'px-3 py-3' : 'px-3 py-3 justify-center'}
                      ${isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-100 hover:text-amber-700 hover:shadow-md hover:scale-105'
                      }
                    `}
                  >
                    <Icon className={`
                      h-5 w-5 flex-shrink-0 transition-all duration-200
                      ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-amber-600'}
                      ${isSidebarOpen ? 'mr-3' : 'mr-0'}
                      group-hover:scale-110
                    `} />
                    <span className={`
                      transition-all duration-300 whitespace-nowrap
                      ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 w-0'}
                    `}>
                      {item.name}
                    </span>
                    {!isSidebarOpen && (
                      <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* Quick Actions */}
        {isSidebarOpen && (
          <div className="mt-8 transition-all duration-300">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </h3>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 group">
                <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">+ New Project</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 group">
                <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">+ Schedule Meeting</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105 group">
                <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">+ Upload Document</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        {isSidebarOpen && (
          <div className="mt-8 px-3 transition-all duration-300">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-green-800 font-medium">
                    System Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
