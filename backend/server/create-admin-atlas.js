const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./models/User.js');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB Atlas');
  
  // Check if admin already exists
  const existingAdmin = await User.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('Admin user already exists:', {
      id: existingAdmin._id,
      username: existingAdmin.username,
      email: existingAdmin.email,
      name: existingAdmin.name
    });
    process.exit(0);
  }
  
  // Create admin user with env credentials
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  const admin = new User({
    name: process.env.DEFAULT_ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });
  
  await admin.save();
  
  console.log('✅ Admin user created successfully!');
  console.log('📧 Email:', process.env.ADMIN_EMAIL);
  console.log('👤 Username: admin');
  console.log('🔑 Password:', process.env.ADMIN_PASSWORD);
  console.log('🔒 Role: admin');
  console.log('📍 User ID:', admin._id);
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});