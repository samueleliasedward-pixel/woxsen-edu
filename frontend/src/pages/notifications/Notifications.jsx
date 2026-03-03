import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X, RefreshCw } from 'lucide-react';
import { notificationApi } from '../../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationApi.getNotifications();
      
      let notificationsData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        notificationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data?.notifications) {
        notificationsData = response.data.notifications;
      }
      
      setNotifications(notificationsData);
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} className="notification-icon success" />;
      case 'warning': return <AlertCircle size={20} className="notification-icon warning" />;
      case 'error': return <X size={20} className="notification-icon error" />;
      default: return <Info size={20} className="notification-icon info" />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your latest activities and alerts</p>
        </div>
        <button onClick={fetchNotifications} className="refresh-btn">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error ? (
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Failed to load notifications</h3>
          <p>{error}</p>
          <button onClick={fetchNotifications} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={64} />
          <h3>No notifications</h3>
          <p>You're all caught up! New notifications will appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
              <div className="notification-icon-wrapper">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              {!notification.read && (
                <span className="unread-dot"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;