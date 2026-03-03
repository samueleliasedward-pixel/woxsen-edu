import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { Send, ArrowLeft, CheckCheck, Clock, User, Bot } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './QueryDetail.css';

const QueryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, replyToQuery, onlineUsers } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversation();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('query-reply', (reply) => {
        if (reply.conversationId === id) {
          setMessages(prev => [...prev, reply]);
        }
      });

      return () => {
        socket.off('query-reply');
      };
    }
  }, [socket, id]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConversation(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${id}/messages`, {
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    replyToQuery({
      content: replyText,
      queryId: id,
      conversationId: id
    });

    setReplyText('');
  };

  const getOtherParticipant = () => {
    const otherRole = user?.role === 'STUDENT' ? 'FACULTY' : 'STUDENT';
    return conversation?.participants?.find(p => p.role === otherRole);
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.includes(userId);
  };

  if (loading) {
    return (
      <div className="query-detail-page loading">
        <div className="loader"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="query-detail-page">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/queries')}>
          <ArrowLeft size={18} />
          Back to Queries
        </button>
        <div className="participant-info">
          <div className="participant-avatar">
            {otherParticipant?.user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2>{otherParticipant?.user?.name || 'Unknown User'}</h2>
            <p className="participant-status">
              {isUserOnline(otherParticipant?.userId) ? (
                <>
                  <span className="status-dot online"></span>
                  Online
                </>
              ) : (
                <>
                  <span className="status-dot offline"></span>
                  Offline
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <Card className="messages-card">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.senderId === user?.id ? 'own' : 'other'}`}
              >
                <div className="message-sender">
                  {msg.senderId === user?.id ? 'You' : msg.sender?.name}
                </div>
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
            ))
          )}
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
      </Card>
    </div>
  );
};

export default QueryDetail;