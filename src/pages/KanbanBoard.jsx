import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  User, 
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Sortable Task Card Component
const TaskCard = ({ task, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: sortableDragging ? 0.5 : 1,
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-danger-500 bg-danger-50'
      case 'medium': return 'border-l-warning-500 bg-warning-50'
      case 'low': return 'border-l-success-500 bg-success-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getDueDateColor = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'text-danger-600'
    if (diffDays <= 3) return 'text-warning-600'
    return 'text-gray-600'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border-l-4 p-4 mb-3 cursor-grab hover:shadow-md transition-shadow ${getPriorityColor(task.priority)} ${
        isDragging ? 'rotate-5' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-xs text-gray-600 mb-3">{task.description}</p>
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Task Meta */}
      <div className="space-y-2">
        {task.assignee && (
          <div className="flex items-center text-xs text-gray-500">
            <User className="h-3 w-3 mr-1" />
            <span>{task.assignee}</span>
          </div>
        )}
        
        {task.dueDate && (
          <div className={`flex items-center text-xs ${getDueDateColor(task.dueDate)}`}>
            <Calendar className="h-3 w-3 mr-1" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${
            task.priority === 'high' ? 'bg-danger-100 text-danger-700' :
            task.priority === 'medium' ? 'bg-warning-100 text-warning-700' :
            'bg-success-100 text-success-700'
          }`}>
            {task.priority}
          </span>
          
          {task.estimatedHours && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Sortable Column Component
const KanbanColumn = ({ column, tasks }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getColumnIcon = (status) => {
    switch (status) {
      case 'todo': return <AlertCircle className="h-5 w-5 text-gray-500" />
      case 'in-progress': return <Clock className="h-5 w-5 text-warning-500" />
      case 'done': return <CheckCircle className="h-5 w-5 text-success-500" />
      default: return <Tag className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-lg p-4 w-80 min-h-96"
    >
      <div className="flex items-center justify-between mb-4" {...attributes} {...listeners}>
        <div className="flex items-center space-x-2">
          {getColumnIcon(column.id)}
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No tasks yet</p>
          <button className="text-primary-600 hover:text-primary-700 text-sm mt-2">
            + Add a task
          </button>
        </div>
      )}
    </div>
  )
}

const KanbanBoard = () => {
  const [columns, setColumns] = useState([])
  const [tasks, setTasks] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  
  const isAdmin = user && user.role === 'ADMIN'

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Mock data - replace with Google Sheets integration
  const mockColumns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ]

  const mockTasks = [
    {
      id: '1',
      title: 'Data Collection Protocol',
      description: 'Finalize data collection protocol for malaria study',
      status: 'todo',
      priority: 'high',
      assignee: 'Dr. Sarah Johnson',
      dueDate: '2025-07-10',
      estimatedHours: 8,
      tags: ['protocol', 'malaria']
    },
    {
      id: '2',
      title: 'Lab Equipment Setup',
      description: 'Set up new PCR machines in the laboratory',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Dr. Ama Mensah',
      dueDate: '2025-07-15',
      estimatedHours: 12,
      tags: ['lab', 'equipment']
    },
    {
      id: '3',
      title: 'Literature Review',
      description: 'Complete literature review for TB research proposal',
      status: 'todo',
      priority: 'low',
      assignee: 'Dr. Kwame Osei',
      dueDate: '2025-07-20',
      estimatedHours: 16,
      tags: ['research', 'literature']
    },
    {
      id: '4',
      title: 'Data Analysis',
      description: 'Analyze field survey data from Q2',
      status: 'review',
      priority: 'high',
      assignee: 'Prof. Michael Asante',
      dueDate: '2025-07-08',
      estimatedHours: 20,
      tags: ['analysis', 'data']
    },
    {
      id: '5',
      title: 'Report Writing',
      description: 'Write quarterly progress report',
      status: 'done',
      priority: 'medium',
      assignee: 'Dr. Sarah Johnson',
      dueDate: '2025-06-30',
      estimatedHours: 6,
      tags: ['report', 'quarterly']
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setColumns(mockColumns)
      setTasks(mockTasks)
      setLoading(false)
    }, 1000)
  }, [])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the containers
    const activeTask = tasks.find(task => task.id === activeId)
    if (!activeTask) return

    const overTask = tasks.find(task => task.id === overId)
    const overColumn = columns.find(col => col.id === overId)

    if (!overTask && !overColumn) return

    const activeContainer = activeTask.status
    const overContainer = overTask ? overTask.status : overColumn.id

    if (activeContainer === overContainer) return

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex(task => task.id === activeId)
      const overIndex = overTask ? tasks.findIndex(task => task.id === overId) : tasks.filter(task => task.status === overContainer).length

      // Update the task's status
      const updatedTasks = [...tasks]
      updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], status: overContainer }

      return arrayMove(updatedTasks, activeIndex, overIndex)
    })
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) {
      setActiveId(null)
      return
    }

    const activeTask = tasks.find(task => task.id === activeId)
    const overTask = tasks.find(task => task.id === overId)

    if (!activeTask) {
      setActiveId(null)
      return
    }

    const activeContainer = activeTask.status
    const overContainer = overTask ? overTask.status : overId

    if (activeContainer === overContainer) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex(task => task.id === activeId)
        const overIndex = tasks.findIndex(task => task.id === overId)

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    setActiveId(null)
  }

  const syncWithGoogleSheets = async () => {
    setLoading(true)
    // Implement Google Sheets API integration here
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600 mt-1">
            Manage tasks with drag-and-drop workflow
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
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <TaskCard
              task={tasks.find(task => task.id === activeId)}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Summary */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
            return (
              <div key={column.id} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{columnTasks.length}</div>
                <div className="text-sm text-gray-600">{column.title}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default KanbanBoard
