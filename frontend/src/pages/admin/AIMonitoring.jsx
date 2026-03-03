import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Clock, AlertTriangle, Download,
  Filter, RefreshCw, TrendingUp, TrendingDown,
  BarChart2, PieChart, Calendar, Eye, EyeOff,
  MessageSquare, ThumbsUp, ThumbsDown, Zap
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './AIMonitoring.css';

const AIMonitoring = () => {
  const [monitoringData, setMonitoringData] = useState({
    totalQueries: 0,
    uniqueUsers: 0,
    avgResponseTime: '0s',
    flaggedContent: 0,
    todayQueries: 0,
    weekQueries: 0,
    monthQueries: 0,
    topQueries: [],
    usageByHour: [],
    flaggedMessages: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchMonitoringData();
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        timeframe: timeRange
      };
      
      const response = await adminApi.getAIMonitoring(params);
      
      if (response.data?.success && response.data?.data) {
        setMonitoringData({
          totalQueries: response.data.data.totalQueries || 0,
          uniqueUsers: response.data.data.uniqueUsers || 0,
          avgResponseTime: response.data.data.avgResponseTime || '0s',
          flaggedContent: response.data.data.flaggedContent || 0,
          todayQueries: response.data.data.today || 0,
          weekQueries: response.data.data.week || 0,
          monthQueries: response.data.data.month || 0,
          topQueries: response.data.data.topQueries || [],
          usageByHour: response.data.data.usageByHour || [],
          flaggedMessages: response.data.data.flaggedMessages || []
        });
      }
      
    } catch (err) {
      console.error('Failed to fetch AI monitoring data:', err);
      setError(err.response?.data?.message || 'Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Ollama is running with ${data.models.length} models:\n${data.models.map(m => m.name).join('\n')}`);
      } else {
        alert('❌ Ollama is not responding');
      }
    } catch (err) {
      alert('❌ Ollama is not running. Please start Ollama first.');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading AI monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-monitoring">
      <div className="page-header">
        <div>
          <h1>AI Monitoring</h1>
          <p>Monitor AI assistant usage, queries, and performance</p>
        </div>
        <div className="header-actions">
          <select 
            className="time-range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" size="sm" icon={Download}>
            Export
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchMonitoringData}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon total">
            <MessageSquare size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Queries</span>
            <span className="stat-value">{monitoringData.totalQueries}</span>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              {monitoringData.totalQueries > 0 ? 'Active' : 'No data'}
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Unique Users</span>
            <span className="stat-value">{monitoringData.uniqueUsers}</span>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              {monitoringData.uniqueUsers > 0 ? 'Active' : 'No data'}
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon response">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg Response</span>
            <span className="stat-value">{monitoringData.avgResponseTime}</span>
            <span className="stat-trend neutral">
              {monitoringData.avgResponseTime !== '0s' ? 'Normal' : 'No data'}
            </span>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon flagged">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Flagged Content</span>
            <span className="stat-value">{monitoringData.flaggedContent}</span>
            <span className="stat-trend neutral">
              {monitoringData.flaggedContent > 0 ? 'Review needed' : 'Clean'}
            </span>
          </div>
        </Card>
      </div>

      <div className="monitoring-tabs">
        <button 
          className={`tab-btn ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          <BarChart2 size={16} />
          Overview
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'live' ? 'active' : ''}`}
          onClick={() => setSelectedTab('live')}
        >
          <Zap size={16} />
          Live Queries
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'flagged' ? 'active' : ''}`}
          onClick={() => setSelectedTab('flagged')}
        >
          <AlertTriangle size={16} />
          Flagged Content
        </button>
        <button 
          className={`tab-btn ${selectedTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setSelectedTab('analytics')}
        >
          <PieChart size={16} />
          Analytics
        </button>
      </div>

      {selectedTab === 'overview' && (
        <div className="overview-grid">
          <Card className="usage-chart-card">
            <div className="card-header">
              <h3>Usage by Hour</h3>
              <select className="chart-select" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="chart-container">
              {monitoringData.usageByHour.length > 0 ? (
                <div className="bar-chart">
                  {monitoringData.usageByHour.map((hour, i) => (
                    <div key={i} className="bar-wrapper">
                      <div 
                        className="bar" 
                        style={{ height: `${(hour.count / 60) * 100}%` }}
                      >
                        <span className="bar-value">{hour.count}</span>
                      </div>
                      <span className="bar-label">{hour.hour}:00</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message">
                  <Activity size={48} />
                  <p>No usage data available</p>
                  <p className="sub-text">Make some AI queries to see data here</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="top-queries-card">
            <div className="card-header">
              <h3>Top Queries</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="queries-list">
              {monitoringData.topQueries.length > 0 ? (
                monitoringData.topQueries.map((query, index) => (
                  <div key={index} className="query-item">
                    <span className="query-rank">#{index + 1}</span>
                    <span className="query-text">{query.query}</span>
                    <span className="query-count">{query.count}</span>
                    <span className={`query-trend ${query.trend?.startsWith('+') ? 'positive' : 'negative'}`}>
                      {query.trend?.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {query.trend}
                    </span>
                  </div>
                ))
              ) : (
                <div className="no-data-message">
                  <MessageSquare size={48} />
                  <p>No query data available</p>
                  <p className="sub-text">Start using the AI assistant to see top queries</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {selectedTab === 'live' && (
        <Card className="live-queries-card">
          <div className="card-header">
            <h3>Live Queries</h3>
            <div className="live-indicator">
              <span className="live-dot"></span>
              Listening for queries...
            </div>
          </div>
          <div className="live-queries-list">
            <div className="no-data-message">
              <Zap size={48} />
              <p>No live queries at the moment</p>
              <p className="sub-text">Queries will appear here in real-time</p>
            </div>
          </div>
        </Card>
      )}

      {selectedTab === 'flagged' && (
        <Card className="flagged-content-card">
          <div className="card-header">
            <h3>Flagged Content</h3>
            <Button variant="outline" size="sm">Review All</Button>
          </div>
          <div className="flagged-list">
            {monitoringData.flaggedMessages.length > 0 ? (
              monitoringData.flaggedMessages.map(msg => (
                <div key={msg.id} className="flagged-item">
                  <AlertTriangle size={16} className="flagged-icon" />
                  <div className="flagged-content">
                    <div className="flagged-header">
                      <span className="flagged-user">{msg.user}</span>
                      <span className="flagged-time">{msg.time}</span>
                    </div>
                    <p className="flagged-message">{msg.content}</p>
                  </div>
                  <div className="flagged-actions">
                    <button className="action-btn view">View</button>
                    <button className="action-btn dismiss">Dismiss</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                <Eye size={48} />
                <p>No flagged content</p>
                <p className="sub-text">All messages are clean</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {selectedTab === 'analytics' && (
        <div className="analytics-grid">
          <Card className="analytics-card">
            <h3>Query Distribution</h3>
            <div className="no-data-message">
              <PieChart size={48} />
              <p>No analytics data available</p>
              <p className="sub-text">More data will appear as you use the AI assistant</p>
            </div>
          </Card>
          <Card className="analytics-card">
            <h3>Response Times</h3>
            <div className="no-data-message">
              <Clock size={48} />
              <p>No analytics data available</p>
              <p className="sub-text">Performance metrics will show here over time</p>
            </div>
          </Card>
        </div>
      )}

      <Button 
        variant="outline" 
        size="sm" 
        onClick={checkOllamaStatus}
        style={{ marginTop: '1rem' }}
      >
        Check Ollama Status
      </Button>
    </div>
  );
};

export default AIMonitoring;