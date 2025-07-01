import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigation } from '../../contexts/NavigationContext'

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, userProfile, logout } = useAuth()
  const { toggleSidebar, isSidebarOpen, isMobile } = useNavigation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            {/* Desktop Sidebar Toggle */}
            <button
              className="hidden md:flex p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 group"
              onClick={toggleSidebar}
            >
              <div className="relative">
                {isSidebarOpen ? (
                  <ChevronLeft className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
                ) : (
                  <ChevronRight className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
                )}
                <div className="absolute inset-0 rounded-lg bg-primary-600/10 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              </div>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative">
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                ) : (
                  <Menu className="h-6 w-6 transform rotate-0 transition-transform duration-200" />
                )}
              </div>
            </button>
            <Link to="/" className="flex items-center ml-2 md:ml-4 group">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-sm">AF</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent hidden sm:block">
                  Assin Foso KCCR
                </h1>
                <p className="text-xs text-gray-500 hidden lg:block">
                  Infectious Disease Research
                </p>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white sm:text-sm transition-all duration-200"
                  placeholder="Search projects, documents..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-primary-600 relative group rounded-lg hover:bg-primary-50 transition-all duration-200">
              <Bell className="h-6 w-6 transform group-hover:scale-110 transition-transform" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white animate-pulse"></span>
              <div className="absolute inset-0 rounded-lg bg-primary-600/10 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 group"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <span className="text-white text-sm font-medium">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.displayName || user?.email}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 py-1 z-50 animate-fadeIn">
                  <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100/50">
                    <p className="font-medium">{userProfile?.name || user?.displayName}</p>
                    <p className="text-primary-600 font-medium">{userProfile?.role || 'Member'}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {/* Mobile navigation items would go here */}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
