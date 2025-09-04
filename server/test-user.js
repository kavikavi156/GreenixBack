const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const testUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    await testUser.save();
    console.log('Test user created successfully:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test user:', error);
    mongoose.connection.close();
  }
}

createTestUser();
