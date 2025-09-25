const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User.js');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pavithratraders');
    console.log('Connected to MongoDB');
    
    // Remove existing admin if any
    await User.deleteOne({ username: 'admin' });
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Administrator',
      email: 'admin@pavithra.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@pavithra.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('🔒 Role: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();