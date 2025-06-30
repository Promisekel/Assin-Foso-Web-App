import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [messages, setMessages] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Replace with your Socket.IO server URL
      const newSocket = io('ws://localhost:5000', {
        auth: {
          userId: user.uid,
          username: user.displayName || user.email
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to server')
        setSocket(newSocket)
      })

      newSocket.on('users-online', (users) => {
        setOnlineUsers(users)
      })

      newSocket.on('new-message', (message) => {
        setMessages(prev => [...prev, message])
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server')
      })

      return () => {
        newSocket.close()
        setSocket(null)
      }
    }
  }, [user])

  const sendMessage = (message) => {
    if (socket) {
      socket.emit('send-message', {
        message,
        userId: user.uid,
        username: user.displayName || user.email,
        timestamp: new Date()
      })
    }
  }

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join-room', roomId)
    }
  }

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave-room', roomId)
    }
  }

  const value = {
    socket,
    onlineUsers,
    messages,
    sendMessage,
    joinRoom,
    leaveRoom,
    setMessages
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
