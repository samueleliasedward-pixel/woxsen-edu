// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Clock,
  Users,
  UserCog,
  GraduationCap,
  BarChart,
  Settings,
  LogOut,
  MessageSquare,
  Bell,
  FolderOpen,
  Database,
  Shield,
  Activity,
  HelpCircle,
  Megaphone
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Student menu
  const studentMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/student/courses' },
    { icon: FileText, label: 'Assignments', path: '/student/assignments' },
    { icon: Calendar, label: 'Exams', path: '/student/exams' },
    { icon: Clock, label: 'Timetable', path: '/student/timetable' },
    { icon: FolderOpen, label: 'Academic Files', path: '/student/files' },
    { icon: HelpCircle, label: 'Ask Doubts', path: '/student/queries' },
    { icon: MessageSquare, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Profile Settings', path: '/settings/profile' },
  ];

  // Faculty menu
  const facultyMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/faculty/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/faculty/courses' },
    { icon: FileText, label: 'Assignments', path: '/faculty/assignments' },
    { icon: Users, label: 'Students', path: '/faculty/students' },
    { icon: BarChart, label: 'Gradebook', path: '/faculty/gradebook' },
    { icon: Calendar, label: 'Schedule', path: '/faculty/schedule' },
    { icon: HelpCircle, label: 'Student Queries', path: '/faculty/queries' },
    { icon: Megaphone, label: 'Announcements', path: '/faculty/announcements' },
    { icon: MessageSquare, label: 'AI Assistant', path: '/ai-assistant' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings/profile' },
  ];

  // Admin menu
  const adminMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Student Management', path: '/admin/students' },
    { icon: UserCog, label: 'Faculty Management', path: '/admin/faculty' },
    { icon: BookOpen, label: 'Course Management', path: '/admin/courses' },
    { icon: Calendar, label: 'Timetable Manager', path: '/admin/timetable' },
    { icon: Clock, label: 'Deadline Manager', path: '/admin/deadlines' },
    { icon: FolderOpen, label: 'File Repository', path: '/admin/files' },
    { icon: Activity, label: 'AI Monitoring', path: '/admin/ai-monitoring' },
    { icon: HelpCircle, label: 'Query Monitor', path: '/admin/queries' },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
    { icon: Database, label: 'System Logs', path: '/admin/logs' },
    { icon: Shield, label: 'Security', path: '/admin/security' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const getMenu = () => {
    switch (user?.role) {
      case 'STUDENT':
        return studentMenu;
      case 'FACULTY':
        return facultyMenu;
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return adminMenu;
      default:
        return [];
    }
  };

  const menu = getMenu();

  if (!user) return null;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <GraduationCap size={32} className="logo-icon" />
            <div className="logo-text">
              <h2>Woxsen</h2>
              <p>EDU AI</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-large">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <h4>{user?.name || 'User'}</h4>
            <p>{user?.role?.replace('_', ' ') || 'Student'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isQueryItem = item.label === 'Ask Doubts' || 
                               item.label === 'Student Queries' || 
                               item.label === 'Query Monitor';
            const isAnnouncementItem = item.label === 'Announcements';
            
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''} ${isQueryItem || isAnnouncementItem ? 'highlight-item' : ''}`
                }
                onClick={onClose}
                data-tooltip={item.label}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {(isQueryItem || isAnnouncementItem) && (
                  <span className="nav-badge">
                    {user?.role === 'STUDENT' && item.label === 'Ask Doubts' ? '2' : ''}
                    {user?.role === 'FACULTY' && item.label === 'Student Queries' ? '5' : ''}
                    {user?.role === 'ADMIN' && item.label === 'Query Monitor' ? '12' : ''}
                    {item.label === 'Announcements' && '3'}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;