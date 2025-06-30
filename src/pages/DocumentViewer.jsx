import React from 'react'
import { FileText, Upload, Eye } from 'lucide-react'

const DocumentViewer = () => {
  const documents = [
    {
      id: 1,
      name: 'Research Protocol - Malaria Study.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadedBy: 'Dr. Sarah Johnson',
      uploadedAt: '2025-06-15'
    },
    {
      id: 2,
      name: 'Data Collection Guidelines.docx',
      type: 'Word',
      size: '1.8 MB',
      uploadedBy: 'Prof. Michael Asante',
      uploadedAt: '2025-06-10'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Viewer</h1>
          <p className="text-gray-600 mt-1">View and manage research documents</p>
        </div>
        <button className="btn-primary">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                  <p className="text-sm text-gray-600">
                    {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy}
                  </p>
                </div>
              </div>
              <button className="btn-secondary">
                <Eye className="h-4 w-4 mr-2" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DocumentViewer
