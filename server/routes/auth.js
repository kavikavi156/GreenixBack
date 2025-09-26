const express = require('express');
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'replace_this_with_a_secure_secret';

// Register (admin or customer)
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, role } = req.body;
    
    console.log('Registration attempt:', { name, email, username, role });
    
    // Validate input
    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({ error: 'Name, email, username, password, and role are required' });
    }
    
    // Check if user already exists (by username or email)
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingUser) {
      console.log('User already exists:', existingUser.username, existingUser.email);
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, username, password: hashedPassword, role });
    await user.save();
    console.log('User registered successfully:', user._id);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username });
    
    // Validate input
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found:', user.username, 'checking password...');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('Password validation failed for user:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Login successful for user:', username);
    const token = jwt.sign({ 
      userId: user._id, 
      role: user.role, 
      name: user.name, 
      email: user.email 
    }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      role: user.role, 
      userId: user._id, 
      name: user.name, 
      email: user.email 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
