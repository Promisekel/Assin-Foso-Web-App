import React, { useState } from 'react'
import { Plus, Edit3, Trash2, Image, FileText, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const ContentManager = () => {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('text')
  const [content, setContent] = useState({
    welcomeTitle: 'Welcome to Assin Foso KCCR Research Platform',
    welcomeSubtitle: 'Advancing infectious disease epidemiology research in Ghana and beyond.',
    aboutText: 'Our research focuses on infectious disease surveillance, prevention, and control strategies.',
    missionStatement: 'To advance public health through cutting-edge infectious disease research and community engagement.'
  })

  const [editMode, setEditMode] = useState({})

  const toggleEdit = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const saveContent = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }))
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }))
    toast.success('Content updated successfully!')
  }

  if (!userProfile?.role === 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
        <p className="text-gray-600">Manage your website content, images, and media</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'text', name: 'Text Content', icon: FileText },
            { id: 'images', name: 'Images', icon: Image },
            { id: 'pages', name: 'Page Content', icon: Edit3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Text Content Tab */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Homepage Content</h2>
            
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <button
                    onClick={() => toggleEdit(key)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                
                {editMode[key] ? (
                  <div className="space-y-2">
                    <textarea
                      defaultValue={value}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      id={`edit-${key}`}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const newValue = document.getElementById(`edit-${key}`).value
                          saveContent(key, newValue)
                        }}
                        className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 flex items-center space-x-1"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => toggleEdit(key)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 bg-gray-50 p-3 rounded">{value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Image Gallery</h2>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Upload Image</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Placeholder for images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Upload your first image</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Image Guidelines:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Recommended size: 1200x800px for hero images</li>
                <li>• Supported formats: JPG, PNG, WebP</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Use descriptive filenames</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Page Management</h2>
            
            <div className="space-y-4">
              {[
                { name: 'Homepage', description: 'Main landing page content', status: 'Published' },
                { name: 'About Us', description: 'Organization information', status: 'Published' },
                { name: 'Research Areas', description: 'Current research focus', status: 'Draft' },
                { name: 'Team', description: 'Team member profiles', status: 'Published' }
              ].map((page, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{page.name}</h3>
                    <p className="text-sm text-gray-600">{page.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      page.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.status}
                    </span>
                    <button className="text-primary-600 hover:text-primary-800">
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentManager
