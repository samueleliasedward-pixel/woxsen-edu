import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Info, CheckCircle, XCircle, 
  Filter, Download, Search, RefreshCw,
  Calendar, Clock, User, Server, Database,
  ChevronLeft, ChevronRight, MoreVertical
} from 'lucide-react';
import { adminApi } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './SystemLogs.css';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchLogs();
  }, [levelFilter, dateRange, currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        level: levelFilter !== 'all' ? levelFilter : undefined,
        search: searchTerm || undefined
      };
      
      const response = await adminApi.getSystemLogs(params);
      
      let logsData = [];
      let paginationData = { page: 1, limit: 10, total: 0, pages: 1 };
      
      if (response.data?.data?.logs && Array.isArray(response.data.data.logs)) {
        logsData = response.data.data.logs;
        paginationData = response.data.data.pagination || paginationData;
      } else if (Array.isArray(response.data)) {
        logsData = response.data;
      } else if (response.data?.logs && Array.isArray(response.data.logs)) {
        logsData = response.data.logs;
        paginationData = response.data.pagination || paginationData;
      }
      
      setLogs(logsData);
      setPagination(paginationData);
      
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError(err.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level) => {
    switch(level?.toLowerCase()) {
      case 'error': return <XCircle size={16} className="level-icon error" />;
      case 'warn': return <AlertTriangle size={16} className="level-icon warn" />;
      case 'info': return <Info size={16} className="level-icon info" />;
      case 'success': return <CheckCircle size={16} className="level-icon success" />;
      default: return <Info size={16} />;
    }
  };

  const getLevelClass = (level) => {
    return level?.toLowerCase() || 'info';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '');
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.message?.toLowerCase().includes(term) ||
      log.source?.toLowerCase().includes(term) ||
      log.user?.toLowerCase().includes(term)
    );
  });

  if (loading && !logs.length) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading system logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-logs">
      <div className="page-header">
        <div>
          <h1>System Logs</h1>
          <p>Monitor system activity and troubleshoot issues</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="sm" icon={Download}>
            Export Logs
          </Button>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchLogs}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="logs-card">
        <div className="logs-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select 
              className="level-filter"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>

            <select 
              className="date-filter"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <Button variant="outline" size="sm" icon={Filter}>
              Filter
            </Button>
          </div>
        </div>

        {error ? (
          <div className="error-state">
            <XCircle size={48} />
            <h3>Failed to load logs</h3>
            <p>{error}</p>
            <Button variant="primary" onClick={fetchLogs}>
              Try Again
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <Server size={64} />
            <h3>No logs found</h3>
            <p>System logs will appear here as events occur</p>
          </div>
        ) : (
          <>
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Timestamp</th>
                    <th>Source</th>
                    <th>Message</th>
                    <th>User</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={log.id || index} className={`log-row ${getLevelClass(log.level)}`}>
                      <td>
                        <div className="level-cell">
                          {getLevelIcon(log.level)}
                          <span className={`level-badge ${getLevelClass(log.level)}`}>
                            {log.level}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="timestamp-cell">
                          <Clock size={14} />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td>
                        <div className="source-cell">
                          <Database size={14} />
                          {log.source || 'System'}
                        </div>
                      </td>
                      <td className="message-cell">{log.message}</td>
                      <td>
                        <div className="user-cell">
                          <User size={14} />
                          {log.user || 'system'}
                        </div>
                      </td>
                      <td>
                        <button className="details-btn" title="View Details">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage === pagination.pages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default SystemLogs;