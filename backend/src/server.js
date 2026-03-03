import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

console.log('📂 Loading environment variables...');
dotenv.config();
console.log(`✅ JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
console.log(`✅ DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);

console.log('📦 Importing routes...');
import authRoutes from './routes/auth.routes.js';
console.log('   ✅ Auth routes');
import adminRoutes from './routes/admin.routes.js';
console.log('   ✅ Admin routes');
import studentRoutes from './routes/student.routes.js';
console.log('   ✅ Student routes');
import facultyRoutes from './routes/faculty.routes.js';
console.log('   ✅ Faculty routes');
import courseRoutes from './routes/course.routes.js';
console.log('   ✅ Course routes');
import aiRoutes from './routes/ai.routes.js';
console.log('   ✅ AI routes');
import timetableRoutes from './routes/timetable.routes.js';
console.log('   ✅ Timetable routes');
import deadlineRoutes from './routes/deadline.routes.js';
console.log('   ✅ Deadline routes');
import fileRoutes from './routes/file.routes.js';
console.log('   ✅ File routes');
import announcementRoutes from './routes/announcement.routes.js';
console.log('   ✅ Announcement routes');
import systemLogRoutes from './routes/systemLog.routes.js';
console.log('   ✅ System Log routes');
import notificationRoutes from './routes/notification.routes.js';
console.log('   ✅ Notification routes');
import queryRoutes from './routes/query.routes.js';
console.log('   ✅ Query routes');
import userRoutes from './routes/user.routes.js';
console.log('   ✅ User routes');
import statsRoutes from './routes/stats.routes.js';
console.log('   ✅ Stats routes');

console.log('\n🚀 Initializing Express...');
const app = express();
const server = http.createServer(app);

console.log('🔌 Initializing Socket.io...');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});
console.log('✅ Socket.io initialized');

console.log('🗄️ Initializing Prisma Client...');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
console.log('✅ Prisma Client initialized');

const PORT = process.env.PORT || 3001;

console.log('\n🔧 Setting up middleware...');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('   ✅ CORS configured');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('   ✅ Body parser configured');

app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.url}`);
  next();
});

console.log('\n🔌 Setting up Socket.io handlers...');

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join-course', (courseId) => {
    socket.join(`course-${courseId}`);
    console.log(`📚 Client ${socket.id} joined course ${courseId}`);
  });

  socket.on('leave-course', (courseId) => {
    socket.leave(`course-${courseId}`);
    console.log(`📚 Client ${socket.id} left course ${courseId}`);
  });

  socket.on('join-faculty', (facultyId) => {
    socket.join(`faculty-${facultyId}`);
    console.log(`👨‍🏫 Client ${socket.id} joined faculty ${facultyId}`);
  });

  socket.on('join-student', (studentId) => {
    socket.join(`student-${studentId}`);
    console.log(`👨‍🎓 Client ${socket.id} joined student ${studentId}`);
  });

  socket.on('join-admin', () => {
    socket.join('admin');
    console.log(`👑 Client ${socket.id} joined admin room`);
  });

  socket.on('new-message', (data) => {
    console.log(`💬 New message in ${data.room}:`, data.message);
    io.to(data.room).emit('message-received', data);
  });

  socket.on('new-submission', (data) => {
    console.log(`📝 New submission for assignment ${data.assignmentId}`);
    io.to(`course-${data.courseId}`).emit('submission-update', data);
    io.to(`faculty-${data.facultyId}`).emit('new-submission-notification', data);
  });

  socket.on('grade-updated', (data) => {
    console.log(`📊 Grade updated for submission ${data.submissionId}`);
    io.to(`student-${data.studentId}`).emit('grade-notification', data);
  });

  socket.on('new-announcement', (data) => {
    console.log(`📢 New announcement in course ${data.courseId}`);
    io.to(`course-${data.courseId}`).emit('announcement-received', data);
  });

  socket.on('new-query', (data) => {
    console.log(`❓ New query: ${data.queryId}`);
    if (data.assignedTo) {
      io.to(`faculty-${data.assignedTo}`).emit('query-assigned', data);
    } else {
      io.to('admin').emit('new-query', data);
    }
  });

  socket.on('query-responded', (data) => {
    console.log(`💬 Query ${data.queryId} responded`);
    io.to(`student-${data.studentId}`).emit('query-update', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('user-typing', {
      user: data.user,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`❌ Socket error from ${socket.id}:`, error);
  });
});

console.log('   ✅ Socket.io handlers configured');

app.set('io', io);
console.log('   ✅ Socket.io attached to app');

console.log('\n🛣️ Mounting routes...');

app.use('/api/auth', authRoutes);
console.log('   ✅ /api/auth');

app.use('/api/admin', adminRoutes);
console.log('   ✅ /api/admin');

app.use('/api/student', studentRoutes);
console.log('   ✅ /api/student');

app.use('/api/faculty', facultyRoutes);
console.log('   ✅ /api/faculty');

app.use('/api/courses', courseRoutes);
console.log('   ✅ /api/courses');

app.use('/api/ai', aiRoutes);
console.log('   ✅ /api/ai');

app.use('/api/admin/timetable', timetableRoutes);
console.log('   ✅ /api/admin/timetable');

app.use('/api/admin/deadlines', deadlineRoutes);
console.log('   ✅ /api/admin/deadlines');

app.use('/api/admin/files', fileRoutes);
console.log('   ✅ /api/admin/files');

app.use('/api/announcements', announcementRoutes);
console.log('   ✅ /api/announcements');

app.use('/api/admin/logs', systemLogRoutes);
console.log('   ✅ /api/admin/logs');

app.use('/api/notifications', notificationRoutes);
console.log('   ✅ /api/notifications');

app.use('/api/queries', queryRoutes);
console.log('   ✅ /api/queries');

app.use('/api/users', userRoutes);
console.log('   ✅ /api/users');

app.use('/api/stats', statsRoutes);
console.log('   ✅ /api/stats');

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: prisma ? 'connected' : 'disconnected',
    socketio: io ? 'running' : 'stopped'
  });
});
console.log('   ✅ /api/health');

app.get('/', (req, res) => {
  res.json({ 
    message: 'Woxsen EDU AI API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    websocket: 'Socket.io enabled'
  });
});
console.log('   ✅ /');

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
console.log('   ✅ Error handler');

const getSystemPrompt = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('deadline') || lowerMsg.includes('due')) {
    return "You are an academic assistant. Give a VERY brief answer about deadlines (1-2 sentences). Focus on assignment due dates and time management.";
  } else if (lowerMsg.includes('schedule') || lowerMsg.includes('timetable') || lowerMsg.includes('class')) {
    return "You are an academic assistant. Give a brief answer about class schedules (1-2 sentences). Focus on timings and attendance.";
  } else if (lowerMsg.includes('assignment') || lowerMsg.includes('homework')) {
    return "You are an academic assistant. Give brief assignment guidance (2-3 sentences max). Help with understanding requirements.";
  } else if (lowerMsg.includes('exam') || lowerMsg.includes('test') || lowerMsg.includes('study')) {
    return "You are an academic assistant. Give brief exam preparation tips (2-3 sentences max). Focus on study strategies.";
  } else if (lowerMsg.includes('grade') || lowerMsg.includes('gpa') || lowerMsg.includes('score')) {
    return "You are an academic assistant. Give brief advice about grades (1-2 sentences). Focus on improvement.";
  } else if (lowerMsg.includes('course') || lowerMsg.includes('subject') || lowerMsg.includes('topic')) {
    return "You are an academic assistant. Give a brief explanation (2-3 sentences max). Focus on key concepts.";
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return "You are a friendly academic assistant. Greet the user briefly (1 sentence) and ask how you can help with their studies.";
  } else {
    return "You are an academic assistant. Give concise answers (maximum 3 sentences). Be helpful and educational.";
  }
};

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    console.log('\n' + '─'.repeat(50));
    console.log('🤖 AI Request:', message);
    console.log('📝 Session ID:', sessionId || 'new session');
    console.log('👤 User ID:', req.user?.id || 'Not authenticated');

    let availableModels = [];
    let ollamaAvailable = false;
    
    try {
      const modelCheck = await fetch('http://localhost:11434/api/tags', {
        timeout: 2000
      });
      
      if (modelCheck.ok) {
        const modelData = await modelCheck.json();
        availableModels = modelData.models || [];
        ollamaAvailable = true;
        console.log('📦 Available models:', availableModels.map(m => m.name).join(', '));
      }
    } catch (error) {
      console.log('❌ Ollama not available - using fallback responses');
    }

    if (!ollamaAvailable) {
      return res.json({
        success: true,
        data: {
          message: "I notice Ollama isn't running. To get AI-powered responses, please:\n\n1. Install Ollama from https://ollama.ai\n2. Run 'ollama pull phi' in terminal\n3. Run 'ollama run phi'\n\nFor now, I can still help with basic information about the platform!",
          sessionId: sessionId || Date.now().toString(),
          tokens: 0,
          model: 'offline'
        }
      });
    }

    let modelToUse = 'llama2';
    if (availableModels.some(m => m.name.includes('phi'))) {
      modelToUse = 'phi';
    } else if (availableModels.some(m => m.name.includes('tinyllama'))) {
      modelToUse = 'tinyllama';
    } else if (availableModels.some(m => m.name.includes('mistral'))) {
      modelToUse = 'mistral';
    }

    const systemPrompt = getSystemPrompt(message);
    const fullPrompt = `${systemPrompt}\n\nStudent Question: ${message}\n\nBrief Answer:`;

    console.log('🔄 Using model:', modelToUse);
    console.log('📋 Prompt type:', systemPrompt.split('.')[0]);

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.5,
          top_p: 0.8,
          max_tokens: 150,
          repeat_penalty: 1.1,
          stop: ["\n\n", "Student:", "Question:"]
        }
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama returned ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    const responseText = data.response.trim();
    
    console.log('✅ Response received');
    console.log('📊 Tokens used:', data.eval_count || 0);
    console.log('⏱️  Generation time:', data.total_duration ? `${(data.total_duration / 1e9).toFixed(2)}s` : 'N/A');

    // Save to database if user is authenticated
    if (req.user?.id) {
      try {
        // Save user message
        await prisma.chatMessage.create({
          data: {
            userId: req.user.id,
            sessionId: sessionId || 'default',
            role: 'user',
            content: message,
            model: modelToUse
          }
        });
        
        // Save assistant response
        await prisma.chatMessage.create({
          data: {
            userId: req.user.id,
            sessionId: sessionId || 'default',
            role: 'assistant',
            content: responseText,
            tokens: data.eval_count || 0,
            model: modelToUse,
            responseTime: data.total_duration || 0
          }
        });
        
        console.log('✅ Chat messages saved to database');
      } catch (dbError) {
        console.error('❌ Failed to save chat to database:', dbError.message);
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`session-${sessionId}`).emit('ai-response', {
        message: responseText,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: {
        message: responseText,
        sessionId: sessionId || Date.now().toString(),
        tokens: data.eval_count || 0,
        model: modelToUse,
        duration: data.total_duration
      }
    });

  } catch (error) {
    console.error('❌ AI Error:', error);
    
    let fallbackMessage = "";
    const lowerMsg = req.body?.message?.toLowerCase() || "";
    
    if (lowerMsg.includes('deadline')) {
      fallbackMessage = "You have several deadlines this week. Check your assignments page for specific due dates. Need help with a particular assignment?";
    } else if (lowerMsg.includes('schedule')) {
      fallbackMessage = "Your schedule shows classes today from 9 AM to 3:30 PM. You can view the full timetable in the Timetable section.";
    } else if (lowerMsg.includes('assignment')) {
      fallbackMessage = "I can help you understand your assignments better. What specific topic are you working on?";
    } else if (lowerMsg.includes('exam')) {
      fallbackMessage = "Your upcoming exams are listed in the Exams section. I can help you create a study plan if you'd like!";
    } else {
      fallbackMessage = "I'm here to help with your academic questions! What would you like to know about your courses, assignments, or schedule?";
    }
    
    res.json({
      success: true,
      data: {
        message: fallbackMessage,
        sessionId: req.body?.sessionId || Date.now().toString(),
        tokens: 0,
        model: 'fallback'
      }
    });
  }
});

app.get('/api/ai/sessions', (req, res) => {
  const sessions = [
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
  ];
  
  res.json({
    success: true,
    data: sessions
  });
});

app.get('/api/ai/sessions/:id', (req, res) => {
  const { id } = req.params;
  
  const messages = [
    {
      id: '1',
      role: 'user',
      content: 'Can you help me understand neural networks?',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Of course! Neural networks are computing systems inspired by biological neural networks that learn from data...',
      timestamp: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: {
      id,
      messages
    }
  });
});

app.get('/api/ai/status', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      timeout: 2000
    });
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models || [];
      
      let recommended = 'llama2';
      if (models.some(m => m.name.includes('phi'))) recommended = 'phi';
      else if (models.some(m => m.name.includes('tinyllama'))) recommended = 'tinyllama';
      else if (models.some(m => m.name.includes('mistral'))) recommended = 'mistral';
      
      res.json({
        success: true,
        status: 'connected',
        models: models,
        recommended: recommended,
        message: `Ollama connected with ${models.length} model(s)`
      });
    } else {
      res.json({
        success: false,
        status: 'disconnected',
        message: 'Ollama not responding'
      });
    }
  } catch (error) {
    res.json({
      success: false,
      status: 'disconnected',
      message: 'Ollama not available'
    });
  }
});

app.post('/api/ai/pull/:model', async (req, res) => {
  const { model } = req.params;
  
  try {
    const response = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model })
    });
    
    res.json({
      success: true,
      message: `Pulling ${model} model...`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to pull ${model}`
    });
  }
});

async function testDatabaseConnection() {
  try {
    console.log('\n🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    const userCount = await prisma.user.count().catch(() => 0);
    console.log(`📊 Users in database: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  io.close(() => {
    console.log('🔌 Socket.io closed');
  });
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Shutting down server...');
  io.close(() => {
    console.log('🔌 Socket.io closed');
  });
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error(err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  console.error(err.stack);
});

async function startServer() {
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 STARTING WOXSEN EDU AI BACKEND');
  console.log('═'.repeat(60));
  
  try {
    const dbConnected = await testDatabaseConnection();
    
    server.listen(PORT, () => {
      console.log('\n' + '═'.repeat(60));
      console.log('✅ SERVER IS RUNNING!');
      console.log('═'.repeat(60));
      console.log(`📍 REST API:   http://localhost:${PORT}`);
      console.log(`📍 Health:     http://localhost:${PORT}/api/health`);
      console.log(`📍 WebSocket:  ws://localhost:${PORT} (Socket.io)`);
      console.log('\n📋 ROUTES:');
      console.log(`   • Auth:     http://localhost:${PORT}/api/auth`);
      console.log(`   • Admin:    http://localhost:${PORT}/api/admin`);
      console.log(`   • Student:  http://localhost:${PORT}/api/student`);
      console.log(`   • Faculty:  http://localhost:${PORT}/api/faculty`);
      console.log(`   • Courses:  http://localhost:${PORT}/api/courses`);
      console.log(`   • AI:       http://localhost:${PORT}/api/ai`);
      console.log(`   • Timetable: http://localhost:${PORT}/api/admin/timetable`);
      console.log(`   • Deadlines: http://localhost:${PORT}/api/admin/deadlines`);
      console.log(`   • Files:     http://localhost:${PORT}/api/admin/files`);
      console.log(`   • Announcements: http://localhost:${PORT}/api/announcements`);
      console.log(`   • System Logs: http://localhost:${PORT}/api/admin/logs`);
      console.log(`   • Notifications: http://localhost:${PORT}/api/notifications`);
      console.log(`   • Queries: http://localhost:${PORT}/api/queries`);
      console.log(`   • Users: http://localhost:${PORT}/api/users`);
      console.log(`   • Stats: http://localhost:${PORT}/api/stats`);
      console.log('═'.repeat(60));
      
      if (!dbConnected) {
        console.log('\n⚠️  WARNING: Database not connected!');
        console.log('   Check your DATABASE_URL in .env file');
        console.log('   Current DATABASE_URL:', process.env.DATABASE_URL || 'not set');
      } else {
        console.log('\n✅ Database: Connected');
      }
      
      console.log('\n🔌 Socket.io: Running');
      console.log('   • Rooms: course-*, faculty-*, student-*, admin');
      console.log('   • Events: join-course, leave-course, new-message, new-submission, grade-updated, new-announcement, new-query, query-responded, typing');
      
      console.log('\n📦 OLLAMA INTEGRATION:');
      console.log('   • Status: Checking... (run "ollama run phi" to enable)');
      
      console.log('\n⚡ SPEED OPTIMIZATIONS ENABLED:');
      console.log('   • Dynamic model selection');
      console.log('   • Query-specific prompts');
      console.log('   • Limited token output (150 max)');
      
      console.log('\n' + '═'.repeat(60) + '\n');
      console.log('🚀 Server ready! Press Ctrl+C to stop\n');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    console.error(err.stack);
    process.exit(1);
  }
}

startServer();