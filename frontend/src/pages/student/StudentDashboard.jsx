import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Clock, FileText, Bell,
  TrendingUp, CheckCircle, AlertCircle, Award,
  Users, MessageSquare, Download, Eye
} from 'lucide-react';
import { studentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCourses: 0,
      completedAssignments: 0,
      pendingAssignments: 0,
      attendance: '0%',
      cgpa: '0.0'
    },
    upcomingClasses: [],
    upcomingAssignments: [],
    upcomingExams: [],
    recentActivities: [],
    announcements: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentApi.getDashboard();
      
      // Extract dashboard data
      let data = {};
      
      if (response.data?.data) {
        data = response.data.data;
      } else if (response.data) {
        data = response.data;
      }
      
      setDashboardData({
        stats: {
          totalCourses: data.stats?.totalCourses || 0,
          completedAssignments: data.stats?.completedAssignments || 0,
          pendingAssignments: data.stats?.pendingAssignments || 0,
          attendance: data.stats?.attendance || '0%',
          cgpa: data.stats?.cgpa || '0.0'
        },
        upcomingClasses: data.upcomingClasses || [],
        upcomingAssignments: data.upcomingAssignments || [],
        upcomingExams: data.upcomingExams || [],
        recentActivities: data.recentActivities || [],
        announcements: data.announcements || []
      });
      
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {user?.name || 'Student'}! 👋</h1>
          <p>Here's what's happening with your academics today</p>
        </div>
        <div className="date-badge">
          <Calendar size={18} />
          <span>{getCurrentDate()}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Current CGPA</span>
            <span className="stat-value">{dashboardData.stats.cgpa}</span>
            <span className="stat-change positive">↑ 0.3 from last sem</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Enrolled Courses</span>
            <span className="stat-value">{dashboardData.stats.totalCourses}</span>
            <span className="stat-change">Current semester</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{dashboardData.stats.completedAssignments}</span>
            <span className="stat-change positive">Well done!</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{dashboardData.stats.pendingAssignments}</span>
            <span className="stat-change warning">Need attention</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Attendance</span>
            <span className="stat-value">{dashboardData.stats.attendance}</span>
            <span className="stat-change success">On track</span>
          </div>
        </div>
      </div>

      <div className="quick-ai-box" onClick={() => window.location.href = '/ai-assistant'}>
        <div className="ai-box-content">
          <MessageSquare className="ai-icon" size={24} />
          <input 
            type="text" 
            placeholder="Ask AI about your courses, assignments, or schedule..."
            readOnly
          />
          <button>Ask AI</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-column">
          <div className="section">
            <div className="section-header">
              <h2>Today's Classes</h2>
              <a href="/student/timetable" className="view-all">View Schedule →</a>
            </div>
            <div className="class-list">
              {dashboardData.upcomingClasses?.length > 0 ? (
                dashboardData.upcomingClasses.map((class_, index) => (
                  <div key={index} className="class-item">
                    <div className="class-time">
                      <Clock size={14} />
                      <span>{class_.time || 'TBD'}</span>
                    </div>
                    <div className="class-info">
                      <h4>{class_.name || class_.course}</h4>
                      <p>{class_.room || 'Online'} • {class_.faculty?.name || 'TBA'}</p>
                    </div>
                    <span className="class-status upcoming">Upcoming</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No classes scheduled for today</p>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>Upcoming Deadlines</h2>
              <a href="/student/assignments" className="view-all">View All →</a>
            </div>
            <div className="deadline-list">
              {dashboardData.upcomingAssignments?.length > 0 ? (
                dashboardData.upcomingAssignments.map((deadline, index) => (
                  <div key={index} className="deadline-item">
                    <div className="deadline-info">
                      <h4>{deadline.title}</h4>
                      <p>{deadline.course}</p>
                    </div>
                    <span className={`deadline-badge ${deadline.status === 'PENDING' ? 'warning' : 'success'}`}>
                      {new Date(deadline.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-data">No upcoming deadlines</p>
              )}
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="section progress-card">
            <h2>Academic Progress</h2>
            <div className="progress-circle">
              <svg viewBox="0 0 100 100" className="circular-chart">
                <circle className="circle-bg" cx="50" cy="50" r="45"></circle>
                <circle 
                  className="circle" 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  style={{ strokeDasharray: `${(dashboardData.stats.completedAssignments / (dashboardData.stats.completedAssignments + dashboardData.stats.pendingAssignments || 1)) * 100}, 100` }}
                ></circle>
                <text x="50" y="50" className="percentage">
                  {dashboardData.stats.completedAssignments}/{dashboardData.stats.completedAssignments + dashboardData.stats.pendingAssignments || 0}
                </text>
              </svg>
            </div>
            <div className="progress-stats">
              <div className="progress-stat">
                <span>Completed</span>
                <strong>{dashboardData.stats.completedAssignments}</strong>
              </div>
              <div className="progress-stat">
                <span>In Progress</span>
                <strong>{dashboardData.stats.pendingAssignments}</strong>
              </div>
              <div className="progress-stat">
                <span>Total Courses</span>
                <strong>{dashboardData.stats.totalCourses}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;