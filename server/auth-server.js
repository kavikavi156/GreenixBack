// Minimal server for testing auth functionality
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Routes
console.log('Loading auth routes...');
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  console.log('GET request to /');
  res.json({ message: 'Auth server is running' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server startup error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
