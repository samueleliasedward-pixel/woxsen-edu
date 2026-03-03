import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'New Assignment', message: 'ML Assignment posted', time: '5 min ago', read: false },
    { id: 2, title: 'Exam Reminder', message: 'Mid-term exams start tomorrow', time: '1 hour ago', read: false },
    { id: 3, title: 'Grade Published', message: 'Your assignment was graded', time: '2 hours ago', read: true },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Woxsen" className="navbar-logo-img" />
          <span>Woxsen EDU AI</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        <div className="navbar-notifications">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <button className="mark-read">Mark all as read</button>
              </div>
              <div className="notification-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                    <div className="notification-content">
                      <h5>{notif.title}</h5>
                      <p>{notif.message}</p>
                      <span className="notification-time">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <Link to="/notifications">View all</Link>
              </div>
            </div>
          )}
        </div>

        <div className="navbar-user">
          <button 
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Student'}</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <Link to="/profile" className="dropdown-item">
                <User size={16} />
                <span>Profile</span>
              </Link>
              <Link to="/settings" className="dropdown-item">
                <Settings size={16} />
                <span>Settings</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;