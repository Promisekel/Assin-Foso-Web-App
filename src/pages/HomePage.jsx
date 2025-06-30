import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart, 
  Calendar, 
  Users, 
  FolderOpen, 
  MessageCircle, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const HomePage = () => {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState({
    activeProjects: 12,
    teamMembers: 8,
    completedTasks: 45,
    upcomingDeadlines: 3
  })

  const recentActivity = [
    {
      id: 1,
      type: 'project',
      title: 'New malaria surveillance data uploaded',
      user: 'Dr. Sarah Johnson',
      timestamp: '2 hours ago',
      icon: FolderOpen
    },
    {
      id: 2,
      type: 'meeting',
      title: 'Weekly team meeting scheduled',
      user: 'Prof. Michael Asante',
      timestamp: '4 hours ago',
      icon: Calendar
    },
    {
      id: 3,
      type: 'document',
      title: 'Research protocol updated',
      user: 'Dr. Kwame Osei',
      timestamp: '1 day ago',
      icon: CheckCircle
    },
    {
      id: 4,
      type: 'alert',
      title: 'Data collection deadline approaching',
      user: 'System',
      timestamp: '2 days ago',
      icon: AlertCircle
    }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Data Analysis Workshop',
      date: '2025-07-05',
      time: '09:00 AM',
      type: 'Training'
    },
    {
      id: 2,
      title: 'Project Review Meeting',
      date: '2025-07-07',
      time: '02:00 PM',
      type: 'Meeting'
    },
    {
      id: 3,
      title: 'Field Work - Assin North',
      date: '2025-07-10',
      time: '06:00 AM',
      type: 'Fieldwork'
    }
  ]

  const quickActions = [
    {
      title: 'Start New Project',
      description: 'Create a new research project',
      href: '/projects',
      icon: Plus,
      color: 'primary'
    },
    {
      title: 'Upload Data',
      description: 'Upload research data or documents',
      href: '/documents',
      icon: FolderOpen,
      color: 'success'
    },
    {
      title: 'Schedule Meeting',
      description: 'Schedule a team meeting',
      href: '/meeting',
      icon: Calendar,
      color: 'secondary'
    },
    {
      title: 'View Analytics',
      description: 'Check project analytics',
      href: '/analytics',
      icon: BarChart,
      color: 'warning'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {userProfile?.name || user?.displayName || 'Researcher'}!
            </h1>
            <p className="text-primary-100">
              Ready to advance infectious disease research today?
            </p>
          </div>
          <div className="hidden md:block">
            <img 
              src="/research-illustration.svg" 
              alt="Research" 
              className="h-20 w-20 opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <Users className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingDeadlines}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                      <Icon className={`h-5 w-5 text-${action.color}-600`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Link to="/activity" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-start">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          by {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <Link to="/calendar" className="text-sm text-primary-600 hover:text-primary-700">
              View calendar
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.type === 'Training' ? 'bg-primary-100 text-primary-700' :
                    event.type === 'Meeting' ? 'bg-secondary-100 text-secondary-700' :
                    'bg-success-100 text-success-700'
                  }`}>
                    {event.type}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
