// Simple test server
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  console.log('GET request to /');
  res.json({ message: 'Simple server is running' });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Registration request:', req.body);
  res.json({ message: 'Registration endpoint working' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  res.json({ 
    message: 'Login endpoint working',
    token: 'test-token',
    role: req.body.username === 'admin' ? 'admin' : 'customer',
    userId: '123',
    name: 'Test User',
    email: 'test@example.com'
  });
});

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`);
});
