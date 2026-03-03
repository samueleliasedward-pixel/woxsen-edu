import React, { useState, useEffect } from 'react';
import { 
  Bell, Calendar, Clock, CheckCircle, AlertCircle, 
  FileText, MessageSquare, Star, Trash2, CheckCheck,
  BookOpen, Award, X, Filter, MoreVertical
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../services/api';
import './StudentNotifications.css';

const StudentNotifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
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

  const deleteNotification = async (id) => {
    // This would need a delete endpoint
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  };

  const groupByDate = (notifications) => {
    const groups = { today: [], yesterday: [], earlier: [] };
    const today = new Date().setHours(0,0,0,0);
    const yesterday = new Date(Date.now() - 86400000).setHours(0,0,0,0);

    notifications.forEach(n => {
      const notifDate = new Date(n.createdAt).setHours(0,0,0,0);
      if (notifDate === today) groups.today.push(n);
      else if (notifDate === yesterday) groups.yesterday.push(n);
      else groups.earlier.push(n);
    });
    return groups;
  };

  const groupedNotifications = groupByDate(getFilteredNotifications());

  const getIcon = (type) => {
    switch(type) {
      case 'assignment': return FileText;
      case 'exam': return Calendar;
      case 'grade': return Star;
      case 'announcement': return AlertCircle;
      case 'ai': return MessageSquare;
      case 'deadline': return Clock;
      case 'achievement': return Award;
      default: return Bell;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'assignment': return '#3b82f6';
      case 'exam': return '#f59e0b';
      case 'grade': return '#10b981';
      case 'announcement': return '#ef4444';
      case 'ai': return '#8b5cf6';
      case 'deadline': return '#ec4899';
      case 'achievement': return '#C6A75E';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loader"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your academic activities</p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
              <CheckCheck size={18} />
              Mark all as read
            </button>
          )}
          <button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className={`notifications-toolbar ${showFilters ? 'show' : ''}`}>
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All <span className="filter-count">{notifications.length}</span>
          </button>
          <button className={`filter-tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            Unread <span className="filter-count">{unreadCount}</span>
          </button>
          <button className={`filter-tab ${filter === 'read' ? 'active' : ''}`} onClick={() => setFilter('read')}>
            Read
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {Object.entries(groupedNotifications).map(([period, notifs]) => 
          notifs.length > 0 && (
            <div key={period} className="notification-group">
              <h3 className="group-title">{period.charAt(0).toUpperCase() + period.slice(1)}</h3>
              {notifs.map(notification => {
                const Icon = getIcon(notification.type);
                const color = getColor(notification.type);
                return (
                  <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                    <div className="notification-icon" style={{ background: `${color}15` }}>
                      <Icon style={{ color }} />
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3>{notification.title}</h3>
                        <span className="notification-time">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-footer">
                        {!notification.read && (
                          <button className="notification-action mark-read" onClick={() => markAsRead(notification.id)}>
                            <CheckCircle size={14} />
                            Mark as read
                          </button>
                        )}
                        <button className="notification-action view" onClick={() => window.location.href = notification.actionUrl || '#'}>
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        {getFilteredNotifications().length === 0 && (
          <div className="empty-state">
            <Bell size={48} />
            <h3>All caught up!</h3>
            <p>No notifications to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;