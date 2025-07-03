import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  User, 
  Tag,
  Download,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ProjectTracker = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const isAdmin = user && user.role === 'ADMIN'

  // Mock data - replace with Google Sheets API integration
  const mockProjects = [
    {
      id: 1,
      title: 'Malaria Vector Control Study',
      description: 'Investigating effectiveness of new vector control methods',
      lead: 'Dr. Sarah Johnson',
      status: 'active',
      priority: 'high',
      startDate: '2025-01-15',
      dueDate: '2025-08-30',
      progress: 65,
      budget: 50000,
      tags: ['Malaria', 'Vector Control', 'Field Study']
    },
    {
      id: 2,
      title: 'COVID-19 Variant Surveillance',
      description: 'Monitoring genetic variants in local population',
      lead: 'Prof. Michael Asante',
      status: 'planning',
      priority: 'medium',
      startDate: '2025-03-01',
      dueDate: '2025-12-31',
      progress: 25,
      budget: 75000,
      tags: ['COVID-19', 'Genomics', 'Surveillance']
    },
    {
      id: 3,
      title: 'Community Health Education Program',
      description: 'Educational intervention for disease prevention',
      lead: 'Dr. Kwame Osei',
      status: 'completed',
      priority: 'low',
      startDate: '2024-06-01',
      dueDate: '2024-12-31',
      progress: 100,
      budget: 25000,
      tags: ['Education', 'Community', 'Prevention']
    },
    {
      id: 4,
      title: 'Tuberculosis Contact Tracing',
      description: 'Digital contact tracing system for TB patients',
      lead: 'Dr. Ama Mensah',
      status: 'on-hold',
      priority: 'high',
      startDate: '2025-02-01',
      dueDate: '2025-10-15',
      progress: 40,
      budget: 60000,
      tags: ['Tuberculosis', 'Digital Health', 'Contact Tracing']
    }
  ]

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setProjects(mockProjects)
      setFilteredProjects(mockProjects)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = projects

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.lead.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success-100 text-success-700'
      case 'planning': return 'bg-secondary-100 text-secondary-700'
      case 'completed': return 'bg-primary-100 text-primary-700'
      case 'on-hold': return 'bg-warning-100 text-warning-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-danger-100 text-danger-700'
      case 'medium': return 'bg-warning-100 text-warning-700'
      case 'low': return 'bg-success-100 text-success-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const syncWithGoogleSheets = async () => {
    setLoading(true)
    // Implement Google Sheets API integration here
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Tracker</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all research projects
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={syncWithGoogleSheets}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync with Sheets
          </button>
          {isAdmin() && (
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              {/* Project Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {project.description}
                    </p>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>Lead: {project.lead}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Tag className="h-4 w-4 mr-2" />
                  <span>Budget: ${project.budget.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex space-x-2">
                  <button className="flex-1 text-sm px-3 py-2 text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors">
                    View Details
                  </button>
                  {isAdmin() && (
                    <button className="flex-1 text-sm px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first project.'
            }
          </p>
          {isAdmin() && (
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectTracker
