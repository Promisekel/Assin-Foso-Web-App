import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await login(formData.email, formData.password)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <img
              className="h-10 w-10"
              src="/logo.svg"
              alt="Assin Foso KCCR"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the Infectious Disease Epidemiology Research Platform
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LogIn className="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
                  </span>
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Need access? Contact your administrator for an invitation.
            </p>
          </div>
        </form>

        {/* Production Mode Notice */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-medium text-green-800">🚀 Production Mode Active</h3>
          </div>
          <p className="text-xs text-green-700 mb-3">
            Firebase authentication is configured. Create your account or login with your credentials.
          </p>
          <div className="text-xs text-green-700 space-y-1 bg-green-100 p-3 rounded">
            <p><strong>New Users:</strong> <Link to="/signup" className="underline text-primary-600 hover:text-primary-800">Click "Sign Up"</Link> to create your account</p>
            <p><strong>Existing Users:</strong> Login with your email and password</p>
          </div>
          <p className="text-xs text-green-600 mt-2 italic">
            Demo credentials are no longer active.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
