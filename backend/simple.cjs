const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  console.log('🔐 Login attempt:', { email, role });
  
  // Mock login - accept any credentials for testing
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: '1',
        name: email === 'admin@woxsen.edu' ? 'Admin User' : 'Rajesh Kumar',
        email: email,
        role: role?.toUpperCase() || 'STUDENT'
      },
      token: 'mock-jwt-token-' + Date.now()
    }
  });
});

// ==================== AI ROUTES ====================

// AI Status endpoint
app.get('/api/ai/status', async (req, res) => {
  try {
    console.log('🔍 Checking Ollama status...');
    const response = await axios.get('http://localhost:11434/api/tags');
    console.log('✅ Ollama is running with models:', response.data.models?.map(m => m.name).join(', '));
    res.json({
      success: true,
      status: 'connected',
      models: response.data.models
    });
  } catch (error) {
    console.log('❌ Ollama is not running');
    res.json({
      success: false,
      status: 'disconnected',
      message: 'Ollama not running. Start with: ollama serve'
    });
  }
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    console.log('\n' + '='.repeat(60));
    console.log('🤖 AI REQUEST RECEIVED');
    console.log('='.repeat(60));
    console.log(`📝 Message: "${message}"`);
    console.log(`🆔 Session: ${sessionId || 'new'}`);
    console.log('='.repeat(60));

    // Check if Ollama is running
    try {
      await axios.get('http://localhost:11434/api/tags');
      console.log('✅ Ollama connection verified');
    } catch (error) {
      console.log('❌ Ollama is not running');
      return res.status(503).json({
        success: false,
        message: 'Ollama is not running. Please start Ollama with: ollama serve'
      });
    }

    // Call Ollama
    console.log('🔄 Sending request to Ollama...');
    const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama2',
      prompt: message,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500
      }
    });

    console.log('✅ Ollama response received');
    console.log('📦 Response structure:', Object.keys(ollamaResponse.data));
    console.log('📝 Response preview:', ollamaResponse.data.response?.substring(0, 100) + '...');
    console.log('🔢 Token count:', ollamaResponse.data.eval_count || 'unknown');

    // Send response back to frontend
    const responseData = {
      success: true,
      data: {
        message: ollamaResponse.data.response || 'No response generated',
        sessionId: sessionId || Date.now().toString(),
        tokens: ollamaResponse.data.eval_count || 0,
        model: 'llama2',
        raw: ollamaResponse.data // Include raw data for debugging
      }
    };

    console.log('📤 Sending response to frontend');
    res.json(responseData);

  } catch (error) {
    console.error('\n❌ AI ERROR:');
    console.error('='.repeat(60));
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.error('='.repeat(60));
    
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

// Get chat history
app.get('/api/ai/history', (req, res) => {
  console.log('📋 Fetching chat history');
  // Mock history for now
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Machine Learning Help',
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Assignment Questions',
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  });
});

// Get specific session
app.get('/api/ai/session/:sessionId', (req, res) => {
  console.log(`📂 Fetching session: ${req.params.sessionId}`);
  res.json({
    success: true,
    data: {
      id: req.params.sessionId,
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi! How can I help you today?',
          timestamp: new Date().toISOString()
        }
      ]
    }
  });
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  console.log('❤️ Health check requested');
  res.json({ 
    success: true, 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      backend: 'running',
      ollama: 'check /api/ai/status'
    }
  });
});

// ==================== ROOT ENDPOINT ====================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Woxsen EDU AI API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      ai: {
        chat: 'POST /api/ai/chat',
        status: 'GET /api/ai/status',
        history: 'GET /api/ai/history',
        session: 'GET /api/ai/session/:sessionId'
      }
    }
  });
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ==================== START SERVER ====================
const server = app.listen(PORT, () => {
  console.log('\n' + '🌟'.repeat(15));
  console.log('🌟 WOXSEN EDU AI BACKEND SERVER 🌟');
  console.log('🌟'.repeat(15) + '\n');
  console.log('📌 Server Information:');
  console.log('   ├─ URL:        http://localhost:' + PORT);
  console.log('   ├─ API Base:   http://localhost:' + PORT + '/api');
  console.log('   ├─ Health:     http://localhost:' + PORT + '/api/health');
  console.log('   ├─ Login:      POST http://localhost:' + PORT + '/api/auth/login');
  console.log('   ├─ AI Status:  GET  http://localhost:' + PORT + '/api/ai/status');
  console.log('   └─ AI Chat:    POST http://localhost:' + PORT + '/api/ai/chat');
  console.log('\n' + '📋 Available Endpoints:');
  console.log('   GET  /');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/ai/status');
  console.log('   POST /api/ai/chat');
  console.log('   GET  /api/ai/history');
  console.log('   GET  /api/ai/session/:id');
  console.log('\n' + '🚀 Server is ready to accept connections!\n');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n📴 Shutting down server...');
  server.close(() => {
    console.log('✅ Server shut down successfully');
    process.exit(0);
  });
});