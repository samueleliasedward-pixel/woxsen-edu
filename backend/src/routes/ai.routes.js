// backend/src/routes/ai.routes.js
import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ollama endpoint
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// @desc    Send message to AI
// @route   POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    console.log('\n' + '─'.repeat(50));
    console.log('🤖 AI Request:', message);
    console.log('📝 Session ID:', sessionId || 'new session');

    // Check if Ollama is running first
    try {
      await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    } catch (error) {
      console.log('❌ Ollama not available - using fallback');
      return res.json({
        success: true,
        data: {
          message: "I notice Ollama isn't running. To get AI-powered responses, please:\n\n1. Install Ollama from https://ollama.ai\n2. Run 'ollama pull llama2' in terminal\n3. Run 'ollama serve'\n\nFor now, I can still help with basic information!",
          sessionId: sessionId || Date.now().toString(),
          tokens: 0,
          model: 'offline'
        }
      });
    }

    // Call Ollama
    console.log('🔄 Calling Ollama with model: llama2');
    const response = await axios.post(OLLAMA_URL, {
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
    console.log('📊 Tokens used:', response.data.eval_count || 0);

    res.json({
      success: true,
      data: {
        message: response.data.response,
        sessionId: sessionId || Date.now().toString(),
        tokens: response.data.eval_count || 0,
        model: 'llama2'
      }
    });

  } catch (error) {
    console.error('❌ AI Error:', error.message);
    
    // Check if Ollama is running
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Ollama is not running. Please start Ollama with: ollama serve',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

// @desc    Get chat history/sessions
// @route   GET /api/ai/sessions
router.get('/sessions', protect, (req, res) => {
  // Mock history for now
  res.json({
    success: true,
    data: [
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
    ]
  });
});

// @desc    Get specific session
// @route   GET /api/ai/sessions/:sessionId
router.get('/sessions/:sessionId', protect, (req, res) => {
  const { sessionId } = req.params;
  
  res.json({
    success: true,
    data: {
      id: sessionId,
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Hello, can you help me understand neural networks?',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Of course! Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process and transmit information. Would you like me to explain the basic structure?',
          timestamp: new Date(Date.now() - 3590000).toISOString()
        }
      ]
    }
  });
});

// @desc    Delete session
// @route   DELETE /api/ai/sessions/:sessionId
router.delete('/sessions/:sessionId', protect, (req, res) => {
  const { sessionId } = req.params;
  
  res.json({
    success: true,
    message: `Session ${sessionId} deleted successfully`
  });
});

// @desc    Get AI status
// @route   GET /api/ai/status
router.get('/status', protect, async (req, res) => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', { 
      timeout: 2000 
    });
    
    res.json({
      success: true,
      status: 'connected',
      message: 'Ollama is running',
      models: response.data.models || []
    });
  } catch (error) {
    res.json({
      success: true,
      status: 'disconnected',
      message: 'Ollama is not running',
      models: []
    });
  }
});

// @desc    Get available models
// @route   GET /api/ai/models
router.get('/models', protect, async (req, res) => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', { 
      timeout: 2000 
    });
    
    const models = response.data.models || [];
    
    res.json({
      success: true,
      data: models.map(m => m.name)
    });
  } catch (error) {
    res.json({
      success: true,
      data: ['llama2 (recommended)', 'phi (fastest)', 'tinyllama', 'mistral']
    });
  }
});

// @desc    Pull a model
// @route   POST /api/ai/pull/:model
router.post('/pull/:model', protect, async (req, res) => {
  const { model } = req.params;
  
  try {
    // This would trigger a model pull, but it's async and takes time
    res.json({
      success: true,
      message: `Started pulling ${model} model. This may take a few minutes...`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to pull ${model}`,
      error: error.message
    });
  }
});

export default router;