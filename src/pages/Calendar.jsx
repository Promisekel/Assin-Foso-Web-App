import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus, RefreshCw, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Calendar = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  
  const isAdmin = user && user.role === 'ADMIN'

  // Mock events - replace with Google Calendar API integration
  const mockEvents = [
    {
      id: '1',
      title: 'Team Meeting',
      start: '2025-07-05T09:00:00',
      end: '2025-07-05T10:00:00',
      color: '#3b82f6'
    },
    {
      id: '2',
      title: 'Data Collection Deadline',
      start: '2025-07-10',
      color: '#ef4444'
    },
    {
      id: '3',
      title: 'Lab Training Workshop',
      start: '2025-07-15T14:00:00',
      end: '2025-07-15T17:00:00',
      color: '#10b981'
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  const handleDateClick = (arg) => {
    if (isAdmin()) {
      // Open event creation modal
      console.log('Create event for:', arg.dateStr)
    }
  }

  const handleEventClick = (arg) => {
    // Open event details modal
    console.log('Event clicked:', arg.event)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">
            Project deadlines and team events
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          {isAdmin() && (
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </button>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={isAdmin()}
          selectable={isAdmin()}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
    </div>
  )
}

export default Calendar
