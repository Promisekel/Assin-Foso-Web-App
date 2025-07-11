import React, { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'

const DemoModeNotification = () => {
  const [show, setShow] = useState(false)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    // Check if we're in production mode based on environment variable
    const appEnv = import.meta.env.VITE_APP_ENV
    const isProductionMode = appEnv === 'production'
    
    setIsProduction(isProductionMode)
    setShow(true)
    
    // Auto-hide after 8 seconds
    const timer = setTimeout(() => setShow(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${
        isProduction 
          ? 'bg-green-50 border-green-200' 
          : 'bg-blue-50 border-blue-200'
      } border rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {isProduction ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-400" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              isProduction ? 'text-green-800' : 'text-blue-800'
            }`}>
              {isProduction ? '🚀 Production Mode Active' : '🎭 Demo Mode Active'}
            </h3>
            <p className={`mt-1 text-xs ${
              isProduction ? 'text-green-700' : 'text-blue-700'
            }`}>
              {isProduction ? (
                'Backend API is configured for production. All features are fully functional.'
              ) : (
                'Development mode: Backend running locally. Contact administrator for credentials.'
              )}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className={`${
                isProduction 
                  ? 'bg-green-50 text-green-400 hover:text-green-500' 
                  : 'bg-blue-50 text-blue-400 hover:text-blue-500'
              } rounded-md inline-flex focus:outline-none`}
              onClick={() => setShow(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoModeNotification
