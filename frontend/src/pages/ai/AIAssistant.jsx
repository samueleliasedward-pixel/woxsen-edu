// src/pages/ai/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Paperclip, Clock, Calendar, FileText, 
  MoreVertical, Plus, Search, Menu, X, Zap,
  User, Copy, Check, Sparkles, MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../hooks/useAuth';
import './AIAssistant.css';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    checkBackendConnection();
    loadSessions();
    loadInitialMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        setBackendStatus('connected');
        console.log('✅ Backend connected');
      } else {
        setBackendStatus('disconnected');
        console.log('❌ Backend disconnected');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('disconnected');
    }
  };

  const loadInitialMessages = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi ${user?.name || 'there'}! I'm your AI Academic Assistant powered by Ollama. I can help you with:
- 📚 Course materials and explanations
- 📝 Assignment guidance
- 📅 Schedule and deadline information
- 🔍 Research assistance
- 💡 Study tips and resources

How can I help you today?`,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const loadSessions = async () => {
    try {
      // Try to fetch from backend first
      try {
        const response = await fetch('http://localhost:3001/api/ai/sessions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setSessions(data.data);
            return;
          }
        }
      } catch (error) {
        console.log('Using mock sessions data');
      }

      // Fallback mock data
      setSessions([
        {
          id: '1',
          title: 'Machine Learning Help',
          updatedAt: new Date().toISOString(),
          preview: 'Questions about neural networks...'
        },
        {
          id: '2',
          title: 'Assignment Questions',
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          preview: 'Help with cloud computing lab...'
        },
        {
          id: '3',
          title: 'Exam Preparation',
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          preview: 'Study tips for blockchain...'
        }
      ]);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setLoading(true);
      // Try to fetch from backend
      try {
        const response = await fetch(`http://localhost:3001/api/ai/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.messages) {
            setMessages(data.data.messages);
            setCurrentSession(sessionId);
            return;
          }
        }
      } catch (error) {
        console.log('Using mock session data');
      }

      // Mock session data
      setCurrentSession(sessionId);
      setMessages([
        {
          id: '1',
          role: 'user',
          content: 'Can you help me understand neural networks?',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Of course! Neural networks are computing systems inspired by biological neural networks...',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== UPDATED HANDLESENDMESSAGE FUNCTION =====
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      console.log('Sending to backend:', currentInput);
      
      // Call your backend API which connects to Ollama
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: currentSession
        })
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (data.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString(),
          model: data.data.model || 'llama2',
          tokens: data.data.tokens || 0
        };
        setMessages(prev => [...prev, assistantMessage]);

        // If this is a new session, update the sessions list
        if (!currentSession) {
          setCurrentSession(data.data.sessionId || Date.now().toString());
          loadSessions();
        }
      } else {
        throw new Error(data.message || 'Failed to get response');
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting to Ollama. Please make sure Ollama is running on your backend.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }))]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const suggestions = [
    "What is machine learning?",
    "Show my deadlines",
    "Help with assignment",
    "Explain neural networks"
  ];

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return '#10b981';
      case 'checking': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return 'Connected';
      case 'checking': return 'Checking...';
      default: return 'Disconnected';
    }
  };

  const sessionsList = Array.isArray(sessions) ? sessions : [];

  const startNewChat = () => {
    setCurrentSession(null);
    loadInitialMessages();
  };

  return (
    <div className="ai-assistant">
      <div className="ai-container">
        {/* History Sidebar */}
        <div className={`history-sidebar ${showHistory ? 'show' : ''}`}>
          <div className="sidebar-header">
            <h3>Chat History</h3>
            <button className="new-chat-btn" onClick={startNewChat}>
              <Plus size={20} />
            </button>
          </div>

          <div className="history-search">
            <Search size={16} />
            <input type="text" placeholder="Search chats..." />
          </div>

          <div className="history-list">
            {sessionsList.length > 0 ? (
              sessionsList.map(session => (
                <div 
                  key={session.id} 
                  className={`history-item ${currentSession === session.id ? 'active' : ''}`}
                  onClick={() => loadSession(session.id)}
                >
                  <div className="history-icon">
                    <MessageSquare size={16} />
                  </div>
                  <div className="history-info">
                    <h4>{session.title || 'Untitled Chat'}</h4>
                    <p>{session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : 'Recent'}</p>
                    {session.preview && <span className="history-preview">{session.preview}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-history">
                <MessageSquare size={32} />
                <p>No chat history yet</p>
                <button onClick={startNewChat} className="start-chat-btn">
                  Start a new chat
                </button>
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <div className="backend-status">
              <span className={`status-dot ${backendStatus}`} style={{ backgroundColor: getStatusColor() }}></span>
              <span>Ollama {getStatusText()}</span>
            </div>
            <button className="reconnect-btn" onClick={checkBackendConnection}>
              <Zap size={14} />
              Reconnect
            </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="chat-header">
            <button 
              className="menu-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="chat-title">
              <div className="chat-icon">
                <Sparkles size={24} />
              </div>
              <div>
                <h2>AI Academic Assistant</h2>
                <p className="chat-status">
                  <span className={`status-dot ${backendStatus}`} style={{ backgroundColor: getStatusColor() }}></span>
                  {backendStatus === 'connected' ? 'Ollama Ready' : 'Ollama ' + getStatusText()}
                </p>
              </div>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'} ${message.isError ? 'error-message' : ''}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                      {message.model && <span className="message-model">• {message.model}</span>}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {message.tokens > 0 && <span className="message-tokens">• {message.tokens} tokens</span>}
                    </span>
                  </div>
                  <div className="message-body">
                    {message.content ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      <em>No response content</em>
                    )}
                  </div>
                  {message.role === 'assistant' && !message.isError && message.content && (
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message ai-message">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-chip">
                    <FileText size={14} />
                    <span>{file.name}</span>
                    <button onClick={() => removeFile(index)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="suggestions-row">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => {
                    setInputValue(suggestion);
                    handleSendMessage();
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your courses, assignments, or schedule..."
                className="chat-input"
                rows="1"
              />
              <div className="input-actions">
                <button 
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  style={{ display: 'none' }}
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || loading}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;