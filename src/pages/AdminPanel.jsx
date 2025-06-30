import React from 'react'
import { Users, Mail, Settings, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const AdminPanel = () => {
  const { isAdmin } = useAuth()

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">You need administrator privileges to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage users, settings, and system configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <Users className="h-8 w-8 text-primary-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
          <p className="text-gray-600 text-sm mb-4">Manage user accounts and permissions</p>
          <button className="btn-primary w-full">Manage Users</button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <Mail className="h-8 w-8 text-secondary-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Invitations</h3>
          <p className="text-gray-600 text-sm mb-4">Send invitations to new team members</p>
          <button className="btn-secondary w-full">Send Invites</button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <Settings className="h-8 w-8 text-success-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
          <p className="text-gray-600 text-sm mb-4">Configure system preferences</p>
          <button className="btn-success w-full">View Settings</button>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
