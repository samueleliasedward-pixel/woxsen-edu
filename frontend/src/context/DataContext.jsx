import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import websocket from '../services/websocket';
import { studentApi } from '../services/api';
import { facultyApi } from '../services/faculty';
import { adminApi } from '../services/api';
import { attendanceApi } from '../services/attendance';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Connect WebSocket
      websocket.connect(localStorage.getItem('token'));

      // Set up WebSocket listeners
      setupWebSocketListeners();

      // Fetch initial data
      fetchNotifications();
      fetchAnnouncements();
    }

    return () => {
      websocket.disconnect();
    };
  }, [user]);

  const setupWebSocketListeners = () => {
    websocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    websocket.on('announcement', (data) => {
      setAnnouncements(prev => [data, ...prev]);
      addNotification({
        type: 'announcement',
        title: 'New Announcement',
        message: data.message,
        data
      });
    });

    websocket.on('attendance-marked', (data) => {
      addNotification({
        type: 'attendance',
        title: 'Attendance Marked',
        message: `Your attendance for ${new Date(data.date).toLocaleDateString()} has been marked.`,
        data
      });
    });

    websocket.on('grade-received', (data) => {
      addNotification({
        type: 'grade',
        title: 'New Grade',
        message: `You received a grade of ${data.score}`,
        data
      });
    });

    websocket.on('new-submission', (data) => {
      if (user?.role === 'FACULTY') {
        addNotification({
          type: 'submission',
          title: 'New Submission',
          message: `${data.studentName} submitted ${data.assignmentTitle}`,
          data
        });
      }
    });
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markNotificationAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const value = {
    notifications,
    announcements,
    onlineUsers,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refresh: {
      notifications: fetchNotifications,
      announcements: fetchAnnouncements
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};