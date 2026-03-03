import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Plus, Search, Filter,
  User, Clock, CheckCircle, AlertCircle,
  Paperclip, Image, Smile, MoreVertical
} from 'lucide-react';
import { queryApi, studentApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './QueryPortal.css';

const QueryPortal = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewQueryModal, setShowNewQueryModal] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  
  // New query form
  const [newQueryData, setNewQueryData] = useState({
    title: '',
    facultyId: '',
    courseId: '',
    question: ''
  });

  useEffect(() => {
    fetchQueries();
    fetchFaculty();
    fetchMyCourses();
  }, []);

  useEffect(() => {
    if (selectedQuery) {
      fetchMessages(selectedQuery.id);
    }
  }, [selectedQuery]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await queryApi.getMyQueries();
      
      let queriesData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        queriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        queriesData = response.data;
      } else if (response.data?.queries && Array.isArray(response.data.queries)) {
        queriesData = response.data.queries;
      }
      
      setQueries(queriesData);
      
      if (queriesData.length > 0 && !selectedQuery) {
        setSelectedQuery(queriesData[0]);
      }
      
    } catch (err) {
      console.error('Error fetching queries:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (queryId) => {
    try {
      const response = await queryApi.getQuery(queryId);
      
      let messagesData = [];
      if (response.data?.data?.messages) {
        messagesData = response.data.data.messages;
      } else if (response.data?.messages) {
        messagesData = response.data.messages;
      }
      
      setMessages(messagesData);
      
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users/faculty', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setFacultyList(data.data);
      }
    } catch (err) {
      console.error('Failed to load faculty:', err);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const response = await studentApi.getCourses();
      if (response.data?.data) {
        setCourseList(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery) return;
    
    try {
      // Optimistically add message to UI
      const tempMessage = {
        id: 'temp-' + Date.now(),
        content: newMessage,
        sender: user?.name || 'You',
        timestamp: new Date().toISOString(),
        isUser: true
      };
      
      setMessages([...messages, tempMessage]);
      setNewMessage('');
      
      // Send to API
      await queryApi.respondToQuery(selectedQuery.id, {
        message: newMessage
      });
      
      // Refresh messages
      fetchMessages(selectedQuery.id);
      
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    }
  };

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    try {
      const response = await queryApi.createQuery({
        title: newQueryData.title,
        facultyId: newQueryData.facultyId,
        courseId: newQueryData.courseId || undefined,
        question: newQueryData.question
      });
      
      setShowNewQueryModal(false);
      setNewQueryData({
        title: '',
        facultyId: '',
        courseId: '',
        question: ''
      });
      fetchQueries();
      
    } catch (err) {
      console.error('Failed to create query:', err);
      alert('Failed to create query');
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return <CheckCircle className="status-icon resolved" />;
      case 'pending': return <Clock className="status-icon pending" />;
      case 'urgent': return <AlertCircle className="status-icon urgent" />;
      default: return <MessageSquare className="status-icon default" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="loader-spinner"></div>
          <p>Loading queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="query-portal">
      <div className="page-header">
        <div>
          <h1>Query Portal</h1>
          <p>Ask questions to your faculty and get real-time answers</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <MessageSquare size={18} />
            <span>{queries.length} Total</span>
          </div>
          <div className="stat-badge">
            <Clock size={18} />
            <span>{queries.filter(q => q.status?.toLowerCase() === 'pending').length} Pending</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={fetchQueries} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="query-container">
        {/* Sidebar */}
        <Card className="queries-sidebar">
          <div className="sidebar-header">
            <h3>My Conversations</h3>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowNewQueryModal(true)}>
              New
            </Button>
          </div>
          
          <div className="search-box sidebar-search">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search conversations..." />
          </div>

          <div className="queries-list">
            {queries.length === 0 ? (
              <div className="empty-queries">
                <MessageSquare size={48} />
                <h4>No conversations yet</h4>
                <p>Start by asking a question to your faculty</p>
                <Button variant="primary" size="sm" onClick={() => setShowNewQueryModal(true)}>
                  Ask a Question
                </Button>
              </div>
            ) : (
              queries.map(query => (
                <div
                  key={query.id}
                  className={`query-item ${selectedQuery?.id === query.id ? 'active' : ''}`}
                  onClick={() => setSelectedQuery(query)}
                >
                  <div className="query-avatar">
                    {getStatusIcon(query.status)}
                  </div>
                  <div className="query-info">
                    <div className="query-header">
                      <h4>{query.title}</h4>
                      <span className="query-time">{formatTime(query.updatedAt || query.timestamp)}</span>
                    </div>
                    <p className="query-preview">
                      {query.faculty} • {query.course || 'General'}
                    </p>
                    <p className="query-last-message">{query.lastMessage || 'No messages yet'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="chat-area">
          {!selectedQuery ? (
            <div className="no-conversation">
              <MessageSquare size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-info">
                  <h3>{selectedQuery.title}</h3>
                  <div className="chat-meta">
                    <span className="chat-faculty">
                      <User size={14} />
                      {selectedQuery.faculty}
                    </span>
                    <span className="chat-course">
                      {selectedQuery.course}
                    </span>
                    <span className={`chat-status ${selectedQuery.status?.toLowerCase()}`}>
                      {selectedQuery.status}
                    </span>
                  </div>
                </div>
                <button className="more-btn">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <MessageSquare size={48} />
                    <h4>No messages yet</h4>
                    <p>Start the conversation by sending a message below</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwn = message.sender === user?.name || message.sender === user?.email;
                    return (
                      <div
                        key={message.id || index}
                        className={`message ${isOwn ? 'own' : 'other'}`}
                      >
                        <div className="message-sender">{message.sender}</div>
                        <div className="message-content">{message.content}</div>
                        <div className="message-time">{formatTime(message.timestamp)}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="message-input-container">
                <div className="message-attachments">
                  <button className="attach-btn" title="Attach file">
                    <Paperclip size={18} />
                  </button>
                  <button className="attach-btn" title="Add image">
                    <Image size={18} />
                  </button>
                  <button className="attach-btn" title="Add emoji">
                    <Smile size={18} />
                  </button>
                </div>
                <div className="message-input-wrapper">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* New Query Modal */}
      {showNewQueryModal && (
        <div className="modal-overlay" onClick={() => setShowNewQueryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ask a Question</h2>
              <button className="close-btn" onClick={() => setShowNewQueryModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateQuery}>
              <div className="form-group">
                <label>Question Title</label>
                <input
                  type="text"
                  value={newQueryData.title}
                  onChange={(e) => setNewQueryData({...newQueryData, title: e.target.value})}
                  placeholder="e.g., Help with assignment, Concept clarification, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Faculty</label>
                <select
                  value={newQueryData.facultyId}
                  onChange={(e) => setNewQueryData({...newQueryData, facultyId: e.target.value})}
                  required
                >
                  <option value="">Choose faculty...</option>
                  {facultyList.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} - {faculty.department} ({faculty.designation})
                    </option>
                  ))}
                </select>
                {facultyList.length === 0 && (
                  <p className="form-hint">Loading faculty...</p>
                )}
              </div>

              <div className="form-group">
                <label>Related Course (Optional)</label>
                <select
                  value={newQueryData.courseId}
                  onChange={(e) => setNewQueryData({...newQueryData, courseId: e.target.value})}
                >
                  <option value="">General question (not course specific)</option>
                  {courseList.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Your Question</label>
                <textarea
                  value={newQueryData.question}
                  onChange={(e) => setNewQueryData({...newQueryData, question: e.target.value})}
                  placeholder="Type your question in detail here..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-footer">
                <Button type="button" variant="outline" onClick={() => setShowNewQueryModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryPortal;