// K:\woxsen-edu\frontend\src\pages\admin\AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Calendar, Clock, TrendingUp, 
  Activity, Download, Filter, Settings,
  AlertCircle, CheckCircle, XCircle, UserPlus,
  FileText, Bell, PieChart, DollarSign,
  TrendingUp as TrendUp, TrendingDown,
  MoreVertical, Eye
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      totalFaculty: 0,
      totalCourses: 0,
      activeCourses: 0,
      upcomingExams: 0,
      pendingAssignments: 0,
      totalRevenue: '₹0',
      avgAttendance: '0%',
      newStudents: 0,
      newFaculty: 0
    },
    recentActivities: [],
    aiUsage: {
      today: 0,
      week: 0,
      month: 0,
      topQueries: []
    },
    upcomingEvents: [],
    performanceMetrics: {
      avgGrade: '0%',
      passRate: '0%',
      satisfaction: '0%'
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [chartData] = useState([65, 45, 75, 55, 85, 70, 90]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getDashboard();

      // Try to extract data from all possible locations
      const stats = response.data?.data?.stats || 
                    response.data?.stats || 
                    response?.data || 
                    {};
      
      setDashboardData({
        stats: {
          totalStudents: stats.totalStudents || 0,
          totalFaculty: stats.totalFaculty || 0,
          totalCourses: stats.totalCourses || 0,
          activeCourses: stats.activeCourses || 0,
          upcomingExams: stats.upcomingExams || 0,
          pendingAssignments: stats.pendingAssignments || 0,
          totalRevenue: stats.totalRevenue || '₹0',
          avgAttendance: stats.avgAttendance || '0%',
          newStudents: stats.newStudents || 0,
          newFaculty: stats.newFaculty || 0
        },
        recentActivities: response.data?.data?.recentActivities || response.data?.recentActivities || [],
        aiUsage: {
          today: response.data?.data?.aiUsage?.today || response.data?.aiUsage?.today || 0,
          week: response.data?.data?.aiUsage?.week || response.data?.aiUsage?.week || 0,
          month: response.data?.data?.aiUsage?.month || response.data?.aiUsage?.month || 0,
          topQueries: response.data?.data?.aiUsage?.topQueries || response.data?.aiUsage?.topQueries || []
        },
        upcomingEvents: response.data?.data?.upcomingEvents || response.data?.upcomingEvents || [],
        performanceMetrics: {
          avgGrade: response.data?.data?.performanceMetrics?.avgGrade || response.data?.performanceMetrics?.avgGrade || '0%',
          passRate: response.data?.data?.performanceMetrics?.passRate || response.data?.performanceMetrics?.passRate || '0%',
          satisfaction: response.data?.data?.performanceMetrics?.satisfaction || response.data?.performanceMetrics?.satisfaction || '0%'
        }
      });
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
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
      <div className="dashboard-loading">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading dashboard...</p>
          <span className="loader-subtext">Fetching your data</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={64} className="error-icon" />
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <div className="error-actions">
          <Button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/login'}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  const { stats, recentActivities, aiUsage, upcomingEvents, performanceMetrics } = dashboardData;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="title-section">
            <h1>Admin Dashboard</h1>
            <span className="badge">Admin</span>
          </div>
          <p className="greeting">
            {getGreeting()}, Administrator
            <span className="date-badge">{getCurrentDate()}</span>
          </p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download} onClick={() => console.log('Export report')}>
            Export
          </Button>
          <Button variant="outline" size="sm" icon={Filter} onClick={() => console.log('Filter')}>
            Filter
          </Button>
          <Button variant="outline" size="sm" icon={Settings} onClick={() => console.log('Settings')}>
            Settings
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon student">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Students</span>
            <p className="stat-number">{formatNumber(stats.totalStudents)}</p>
            <div className="stat-footer">
              <span className="stat-change positive">
                <TrendUp size={14} />
                +{stats.newStudents} this month
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon faculty">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Faculty Members</span>
            <p className="stat-number">{formatNumber(stats.totalFaculty)}</p>
            <div className="stat-footer">
              <span className="stat-change positive">
                <TrendUp size={14} />
                +{stats.newFaculty} new
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon courses">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Courses</span>
            <p className="stat-number">{formatNumber(stats.activeCourses)}</p>
            <div className="stat-footer">
              <span className="stat-change">
                Total: {formatNumber(stats.totalCourses)}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon exams">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Upcoming Exams</span>
            <p className="stat-number">{formatNumber(stats.upcomingExams)}</p>
            <div className="stat-footer">
              <span className="stat-change warning">
                <Clock size={14} />
                Next: Tomorrow
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon assignments">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Assignments</span>
            <p className="stat-number">{formatNumber(stats.pendingAssignments)}</p>
            <div className="stat-footer">
              <span className="stat-change warning">
                <AlertCircle size={14} />
                Need grading
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Revenue (MTD)</span>
            <p className="stat-number">{stats.totalRevenue}</p>
            <div className="stat-footer">
              <span className="stat-change positive">
                <TrendUp size={14} />
                +12% vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-row">
        <div className="metric-item">
          <div className="metric-icon grade">
            <PieChart size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Average Grade</span>
            <span className="metric-value">{performanceMetrics.avgGrade}</span>
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-icon pass">
            <CheckCircle size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Pass Rate</span>
            <span className="metric-value">{performanceMetrics.passRate}</span>
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-icon attendance">
            <Activity size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Attendance</span>
            <span className="metric-value">{stats.avgAttendance}</span>
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-icon satisfaction">
            <Users size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Satisfaction</span>
            <span className="metric-value">{performanceMetrics.satisfaction}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="grid-left">
          <Card className="chart-card">
            <div className="card-header">
              <h2>AI Usage Analytics</h2>
              <select 
                className="chart-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="semester">This Semester</option>
              </select>
            </div>
            
            <div className="usage-stats">
              <div className="usage-stat">
                <span className="stat-label">Today</span>
                <span className="stat-value">{formatNumber(aiUsage.today)}</span>
                <span className="trend positive">+23%</span>
              </div>
              <div className="usage-stat">
                <span className="stat-label">This Week</span>
                <span className="stat-value">{formatNumber(aiUsage.week)}</span>
                <span className="trend positive">+12%</span>
              </div>
              <div className="usage-stat">
                <span className="stat-label">This Month</span>
                <span className="stat-value">{formatNumber(aiUsage.month)}</span>
                <span className="trend">+8%</span>
              </div>
            </div>

            <div className="chart-container">
              <div className="bar-chart">
                {chartData.map((height, i) => (
                  <div key={i} className="bar-wrapper">
                    <div className="bar" style={{ height: `${height}%` }}>
                      <span className="bar-tooltip">{height} queries</span>
                    </div>
                    <span className="bar-label">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="activity-card">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            <div className="activity-list">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="activity-item">
                    <div className={`activity-icon ${activity.type || 'info'}`}>
                      {activity.type === 'success' && <CheckCircle size={16} />}
                      {activity.type === 'warning' && <AlertCircle size={16} />}
                      {activity.type === 'error' && <XCircle size={16} />}
                      {(!activity.type || activity.type === 'info') && <Activity size={16} />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-user">{activity.user || 'System'}</span>
                        <span className="activity-time">{activity.time || 'Just now'}</span>
                      </div>
                      <p className="activity-description">
                        {activity.description || activity.action || 'No description'}
                      </p>
                    </div>
                    <button className="activity-menu">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Activity size={48} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid-right">
          <Card className="events-card">
            <div className="card-header">
              <h2>Upcoming Events</h2>
              <Button variant="outline" size="sm">Calendar</Button>
            </div>
            
            <div className="events-list">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, index) => (
                  <div key={event.id || index} className={`event-item ${event.status || 'upcoming'}`}>
                    <div className="event-date">
                      <span className="event-day">
                        {event.day || (event.date ? new Date(event.date).getDate() : '15')}
                      </span>
                      <span className="event-month">
                        {event.month || (event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : 'Mar')}
                      </span>
                    </div>
                    <div className="event-info">
                      <h3>{event.title || 'No Title'}</h3>
                      <p>
                        <Clock size={12} />
                        {event.time || '10:00 AM'} • {event.students || 0} students
                      </p>
                    </div>
                    <span className={`event-badge ${event.status || 'upcoming'}`}>
                      {event.status || 'Upcoming'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="queries-card">
            <div className="card-header">
              <h2>Top AI Queries</h2>
              <Button variant="outline" size="sm">Details</Button>
            </div>
            
            <div className="queries-list">
              {aiUsage.topQueries && aiUsage.topQueries.length > 0 ? (
                aiUsage.topQueries.map((query, index) => (
                  <div key={index} className="query-item">
                    <span className="query-rank">#{index + 1}</span>
                    <span className="query-text">{query.text || query.query || 'Query'}</span>
                    <span className="query-count">{query.count || 0}</span>
                    <span className={`query-trend ${(query.trend || 0) > 0 ? 'positive' : 'negative'}`}>
                      {(query.trend || 0) > 0 ? <TrendUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(query.trend || 0)}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>No query data available</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="quick-actions-card">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => console.log('Add student')}>
                <UserPlus size={20} />
                <span>Add Student</span>
              </button>
              <button className="action-btn" onClick={() => console.log('New course')}>
                <BookOpen size={20} />
                <span>New Course</span>
              </button>
              <button className="action-btn" onClick={() => console.log('Schedule exam')}>
                <Calendar size={20} />
                <span>Schedule Exam</span>
              </button>
              <button className="action-btn" onClick={() => console.log('Generate report')}>
                <FileText size={20} />
                <span>Reports</span>
              </button>
              <button className="action-btn" onClick={() => console.log('Send notification')}>
                <Bell size={20} />
                <span>Notify All</span>
              </button>
              <button className="action-btn" onClick={() => console.log('Manage users')}>
                <Users size={20} />
                <span>Manage Users</span>
              </button>
              <button className="action-btn" onClick={() => console.log('View analytics')}>
                <Eye size={20} />
                <span>Analytics</span>
              </button>
              <button className="action-btn" onClick={() => console.log('Settings')}>
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;