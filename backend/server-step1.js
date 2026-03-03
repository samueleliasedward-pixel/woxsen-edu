import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Import routes one by one to find the problematic one
import authRoutes from './src/routes/auth.routes.js';

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Health check passed' });
});

const server = app.listen(PORT, () => {
  console.log('✅ Server running on http://localhost:' + PORT);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});
