import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to socket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('new-message', (message) => {
      toast.success(`New message from ${message.sender?.name || 'someone'}`);
    });

    newSocket.on('new-announcement', (announcement) => {
      toast.success(`📢 New announcement: ${announcement.content?.substring(0, 50)}...`);
    });

    newSocket.on('new-query', (query) => {
      if (user?.role === 'FACULTY' || user?.role === 'ADMIN') {
        toast.success(`❓ New query from ${query.studentName || 'a student'}`);
      }
    });

    newSocket.on('query-reply', (reply) => {
      toast.success(`💬 New reply from ${reply.sender?.name || 'faculty'}`);
    });

    newSocket.on('schedule-updated', (update) => {
      toast.success(`📅 Schedule updated`);
    });

    newSocket.on('error', (error) => {
      toast.error(error.message || 'Socket error occurred');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from socket server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Send message
  const sendMessage = (data) => {
    if (socket) {
      socket.emit('send-message', data);
    }
  };

  // Send announcement
  const sendAnnouncement = (data) => {
    if (socket) {
      socket.emit('send-announcement', data);
    }
  };

  // Send query
  const sendQuery = (data) => {
    if (socket) {
      socket.emit('send-query', data);
    }
  };

  // Reply to query
  const replyToQuery = (data) => {
    if (socket) {
      socket.emit('reply-query', data);
    }
  };

  // Update schedule
  const updateSchedule = (data) => {
    if (socket) {
      socket.emit('schedule-update', data);
    }
  };

  // Join course room
  const joinCourse = (courseId) => {
    if (socket) {
      socket.emit('join-course', courseId);
    }
  };

  // Leave course room
  const leaveCourse = (courseId) => {
    if (socket) {
      socket.emit('leave-course', courseId);
    }
  };

  // Send typing indicator
  const sendTyping = (room, isTyping) => {
    if (socket) {
      socket.emit('typing', { room, isTyping });
    }
  };

  const value = {
    socket,
    onlineUsers,
    notifications,
    sendMessage,
    sendAnnouncement,
    sendQuery,
    replyToQuery,
    updateSchedule,
    joinCourse,
    leaveCourse,
    sendTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};