const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password, role } = req.body;
  
  // Always return success for testing
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: '1',
        name: email === 'admin@woxsen.edu' ? 'Admin User' : 'Rajesh Kumar',
        email: email,
        role: role ? role.toUpperCase() : 'STUDENT'
      },
      token: 'test-token-' + Date.now()
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'ok', 
    message: 'Server is running' 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Woxsen EDU AI API Server',
    endpoints: {
      login: 'POST /api/auth/login',
      health: 'GET /api/health'
    }
  });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`✅ SERVER RUNNING SUCCESSFULLY!`);
  console.log('='.repeat(50));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('='.repeat(50) + '\n');
});