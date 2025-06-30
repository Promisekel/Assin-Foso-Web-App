import React, { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'

const DemoModeNotification = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode
    const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                       import.meta.env.VITE_FIREBASE_API_KEY?.includes('demo')
    
    if (isDemoMode) {
      setShow(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShow(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              🎭 Demo Mode Active
            </h3>
            <p className="mt-1 text-xs text-blue-700">
              App is running in demo mode. Firebase authentication is disabled. 
              Use demo credentials to log in.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="bg-blue-50 rounded-md inline-flex text-blue-400 hover:text-blue-500 focus:outline-none"
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
