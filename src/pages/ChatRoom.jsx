import React, { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Users, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'

const ChatRoom = () => {
  const [message, setMessage] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('general')
  const messagesEndRef = useRef(null)
  const { user } = useAuth()
  const { messages, sendMessage, onlineUsers } = useSocket()

  const rooms = [
    { id: 'general', name: 'General', unread: 0 },
    { id: 'research', name: 'Research Updates', unread: 2 },
    { id: 'fieldwork', name: 'Field Work', unread: 0 },
    { id: 'lab', name: 'Laboratory', unread: 1 }
  ]

  // Mock messages
  const mockMessages = [
    {
      id: 1,
      user: 'Dr. Sarah Johnson',
      message: 'Good morning team! Ready for today\'s field work?',
      timestamp: new Date(Date.now() - 3600000),
      room: 'general'
    },
    {
      id: 2,
      user: 'Prof. Michael Asante',
      message: 'The new lab results are ready for review.',
      timestamp: new Date(Date.now() - 1800000),
      room: 'research'
    },
    {
      id: 3,
      user: 'Dr. Kwame Osei',
      message: 'Can we schedule a meeting for next week?',
      timestamp: new Date(Date.now() - 900000),
      room: 'general'
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.trim()) {
      sendMessage(message)
      setMessage('')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="flex h-screen bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-50 border-r border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat Rooms</h2>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Rooms List */}
        <div className="p-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                selectedRoom === room.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{room.name}</span>
                {room.unread > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    {room.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Online Users */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Online ({onlineUsers.length})
          </h3>
          <div className="space-y-2">
            {onlineUsers.map((user, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                #{rooms.find(r => r.id === selectedRoom)?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {onlineUsers.length} members online
              </p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages
            .filter(msg => msg.room === selectedRoom)
            .map((msg) => (
              <div key={msg.id} className="flex space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {msg.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {msg.user}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{msg.message}</p>
                </div>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
