import express from 'express';
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Health check passed' });
});

const server = app.listen(PORT, () => {
  console.log('✅ Test server running on http://localhost:' + PORT);
  console.log('✅ Health endpoint: http://localhost:' + PORT + '/api/health');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
