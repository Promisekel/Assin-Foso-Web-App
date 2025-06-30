import React from 'react'
import { BookOpen, FileText, Download } from 'lucide-react'

const KnowledgeBase = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600 mt-1">Research protocols, SOPs, and documentation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <BookOpen className="h-8 w-8 text-primary-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard Operating Procedures</h3>
          <p className="text-gray-600 text-sm mb-4">Laboratory and field work protocols</p>
          <button className="btn-primary w-full">
            <FileText className="h-4 w-4 mr-2" />
            View SOPs
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <FileText className="h-8 w-8 text-secondary-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Publications</h3>
          <p className="text-gray-600 text-sm mb-4">Published papers and reports</p>
          <button className="btn-secondary w-full">
            <Download className="h-4 w-4 mr-2" />
            Browse Publications
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <Download className="h-8 w-8 text-success-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Materials</h3>
          <p className="text-gray-600 text-sm mb-4">Educational resources and guides</p>
          <button className="btn-success w-full">
            <BookOpen className="h-4 w-4 mr-2" />
            Access Training
          </button>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBase
