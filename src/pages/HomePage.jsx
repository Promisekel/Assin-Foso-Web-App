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
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 rounded-xl shadow-xl p-6 text-white relative overflow-hidden animate-slideInUp">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full animate-float delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="animate-slideInLeft">
            <h1 className="text-3xl font-bold mb-3 animate-glow">
              Welcome to Assin Foso KCCR Research Hub, {userProfile?.name || user?.displayName || 'Researcher'}!
            </h1>
            <p className="text-primary-100 text-lg">
              Leading the fight against infectious diseases through innovative research, community engagement, and data-driven solutions.
            </p>
          </div>
          <div className="hidden md:block animate-slideInRight">
            <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 animate-float hover:scale-110 transition-transform duration-300">
              <div className="h-16 w-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">🔬</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: FolderOpen, label: 'Active Projects', value: stats.activeProjects, color: 'primary', delay: '0ms' },
          { icon: Users, label: 'Team Members', value: stats.teamMembers, color: 'success', delay: '100ms' },
          { icon: CheckCircle, label: 'Completed Tasks', value: stats.completedTasks, color: 'secondary', delay: '200ms' },
          { icon: Clock, label: 'Upcoming Deadlines', value: stats.upcomingDeadlines, color: 'warning', delay: '300ms' }
        ].map((stat, index) => (
          <div 
            key={index}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 group animate-slideInUp relative overflow-hidden"
            style={{ animationDelay: stat.delay }}
          >
            <div className="flex items-center relative z-10">
              <div className={`p-3 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600 group-hover:animate-wiggle`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {stat.value}
                </p>
              </div>
            </div>
            {/* Animated border */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slideInUp" style={{ animationDelay: '400ms' }}>
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
            <div className="p-6 border-b border-gray-100/50">
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Quick Actions
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="group flex items-center p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 animate-slideInLeft"
                    style={{ animationDelay: `${500 + index * 100}ms` }}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 bg-${action.color}-100 group-hover:bg-${action.color}-200`}>
                      <Icon className={`h-5 w-5 text-${action.color}-600 group-hover:animate-wiggle transition-all duration-300`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-primary-600 transition-colors">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500">
            <div className="p-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Recent Activity
                </h3>
                <Link 
                  to="/activity" 
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-all duration-200 hover:scale-105"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50 transition-all duration-300 group cursor-pointer animate-slideInRight"
                      style={{ animationDelay: `${600 + index * 100}ms` }}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                        activity.type === 'project' ? 'bg-primary-100 group-hover:bg-primary-200' :
                        activity.type === 'meeting' ? 'bg-secondary-100 group-hover:bg-secondary-200' :
                        activity.type === 'document' ? 'bg-success-100 group-hover:bg-success-200' :
                        'bg-warning-100 group-hover:bg-warning-200'
                      }`}>
                        <Icon className={`h-4 w-4 transition-all duration-300 group-hover:animate-wiggle ${
                          activity.type === 'project' ? 'text-primary-600' :
                          activity.type === 'meeting' ? 'text-secondary-600' :
                          activity.type === 'document' ? 'text-success-600' :
                          'text-warning-600'
                        }`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-primary-600 transition-colors">
                          by {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="h-4 w-4 text-primary-500" />
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
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500 animate-slideInUp" style={{ animationDelay: '800ms' }}>
        <div className="p-6 border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Upcoming Events
            </h3>
            <Link 
              to="/calendar" 
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-all duration-200 hover:scale-105"
            >
              View calendar
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 hover:bg-gradient-to-br hover:from-primary-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 group cursor-pointer animate-slideInUp"
                style={{ animationDelay: `${900 + index * 150}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-300 group-hover:scale-105 ${
                    event.type === 'Training' ? 'bg-primary-100 text-primary-700 group-hover:bg-primary-200' :
                    event.type === 'Meeting' ? 'bg-secondary-100 text-secondary-700 group-hover:bg-secondary-200' :
                    'bg-success-100 text-success-700 group-hover:bg-success-200'
                  }`}>
                    {event.type}
                  </span>
                  <Calendar className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {event.title}
                </h4>
                <p className="text-sm text-gray-500 group-hover:text-primary-600 transition-colors flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </p>
                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
