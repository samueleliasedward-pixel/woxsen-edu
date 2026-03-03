import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { Send, MessageSquare, Users, Clock, CheckCheck, HelpCircle, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './QueryPortal.css';

const QueryPortal = () => {
  const { user } = useAuth();
  const { socket, sendQuery, replyToQuery, onlineUsers } = useSocket();
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [showNewQueryModal, setShowNewQueryModal] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchQueries();
    if (user?.role === 'STUDENT') {
      fetchFaculty();
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedQuery) {
      fetchMessages(selectedQuery);
    }
  }, [selectedQuery]);

  useEffect(() => {
    if (socket) {
      socket.on('new-query', (query) => {
        setQueries(prev => [query, ...prev]);
      });

      socket.on('query-reply', (reply) => {
        if (selectedQuery === reply.conversationId) {
          setMessages(prev => [...prev, reply]);
        }
        setQueries(prev => prev.map(q => 
          q.id === reply.parentMessageId 
            ? { ...q, replies: [...(q.replies || []), reply] }
            : q
        ));
      });

      return () => {
        socket.off('new-query');
        socket.off('query-reply');
      };
    }
  }, [socket, selectedQuery]);

  const fetchQueries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const queryConversations = data.data.filter(c => c.type === 'query');
        setQueries(queryConversations);
      }
    } catch (error) {
      console.error('Failed to fetch queries:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/faculty', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFacultyList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/student/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleSubmitQuery = (e) => {
    e.preventDefault();
    if (!newQuery.trim() || !selectedFaculty) return;

    sendQuery({
      content: newQuery,
      facultyId: selectedFaculty,
      courseId: selectedCourse || null
    });

    setNewQuery('');
    setSelectedFaculty('');
    setSelectedCourse('');
    setShowNewQueryModal(false);
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuery) return;

    replyToQuery({
      content: replyText,
      queryId: selectedQuery,
      conversationId: selectedQuery
    });

    setReplyText('');
  };

  const getOtherParticipant = (conversation) => {
    return conversation?.participants?.find(p => p.userId !== user?.id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.includes(userId);
  };

  return (
    <div className="query-portal-page">
      <div className="portal-header">
        <div>
          <h1>Query Portal</h1>
          <p>
            {user?.role === 'STUDENT' && 'Ask questions to your faculty and get real-time answers'}
            {user?.role === 'FACULTY' && 'Answer questions from your students'}
            {user?.role === 'ADMIN' && 'Monitor all student-faculty communications'}
          </p>
        </div>
        {user?.role === 'STUDENT' && (
          <button className="new-query-btn" onClick={() => setShowNewQueryModal(true)}>
            <HelpCircle size={18} />
            New Query
          </button>
        )}
      </div>

      <div className="portal-container">
        {/* Left Sidebar - Queries List */}
        <Card className="queries-sidebar">
          <div className="sidebar-header">
            <h3>
              {user?.role === 'STUDENT' && 'My Queries'}
              {user?.role === 'FACULTY' && 'Student Queries'}
              {user?.role === 'ADMIN' && 'All Queries'}
            </h3>
            <span className="online-badge">
              <Users size={14} />
              {onlineUsers?.length || 0} online
            </span>
          </div>

          <div className="queries-list">
            {queries.length === 0 ? (
              <div className="no-queries">
                <MessageSquare size={48} />
                <p>
                  {user?.role === 'STUDENT' && 'No queries yet. Start by asking a question!'}
                  {user?.role === 'FACULTY' && 'No student queries yet'}
                  {user?.role === 'ADMIN' && 'No queries to display'}
                </p>
              </div>
            ) : (
              queries.map(query => {
                const otherParticipant = getOtherParticipant(query);
                const lastMessage = query.messages?.[0];
                const isOnline = isUserOnline(otherParticipant?.userId);
                
                return (
                  <div
                    key={query.id}
                    className={`query-item ${selectedQuery === query.id ? 'active' : ''}`}
                    onClick={() => setSelectedQuery(query.id)}
                  >
                    <div className="query-header">
                      <span className="query-faculty">
                        {otherParticipant?.user?.name || 'Unknown'}
                      </span>
                      <span className="query-time">
                        {new Date(query.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="query-content">
                      {lastMessage?.content?.substring(0, 60)}...
                    </div>
                    <div className="query-footer">
                      <span className="reply-count">
                        {query.messages?.length || 0} replies
                      </span>
                      {isOnline && <span className="online-dot"></span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Side - Chat Area */}
        <Card className="chat-area">
          {selectedQuery ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {getOtherParticipant(queries.find(q => q.id === selectedQuery))?.user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="chat-details">
                    <h3>
                      {getOtherParticipant(queries.find(q => q.id === selectedQuery))?.user?.name || 'Loading...'}
                    </h3>
                    <p>
                      {isUserOnline(getOtherParticipant(queries.find(q => q.id === selectedQuery))?.userId) 
                        ? 'Online' 
                        : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message ${msg.senderId === user?.id ? 'own' : 'other'}`}
                  >
                    <div className="message-sender">{msg.sender?.name}</div>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-footer">
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                      {msg.senderId === user?.id && (
                        <span className="message-status">
                          <CheckCheck size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitReply} className="reply-form">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={user?.role === 'FACULTY' ? 'Type your answer...' : 'Type your reply...'}
                />
                <button type="submit" disabled={!replyText.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <MessageSquare size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          )}
        </Card>
      </div>

      {/* New Query Modal */}
      {showNewQueryModal && (
        <div className="modal-overlay" onClick={() => setShowNewQueryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ask a Question</h2>
              <button className="close-btn" onClick={() => setShowNewQueryModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitQuery}>
              <div className="form-group">
                <label>Select Faculty</label>
                <select 
                  value={selectedFaculty} 
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  required
                >
                  <option value="">Choose faculty...</option>
                  {facultyList.map(faculty => (
                    <option key={faculty.id} value={faculty.userId}>
                      {faculty.name} - {faculty.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Related Course (Optional)</label>
                <select 
                  value={selectedCourse} 
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">General question</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Your Question</label>
                <textarea
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  placeholder="Type your question here..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <Button type="button" variant="outline" onClick={() => setShowNewQueryModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold">
                  Submit Query
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