import express from 'express';
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
  res.json({ message: 'Test server working!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Health check passed' });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('✅ TEST SERVER RUNNING!');
  console.log('='.repeat(50));
  console.log('📍 URL: http://localhost:' + PORT);
  console.log('📍 Health: http://localhost:' + PORT + '/api/health');
  console.log('='.repeat(50) + '\n');
});