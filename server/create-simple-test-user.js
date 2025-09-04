const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/pavithratraders').then(async () => {
  try {
    // Create a simple test user with known credentials
    const username = 'test';
    const password = 'test123';
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Username: test');
      console.log('Password: test123');
      console.log('Role:', existingUser.role);
      mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const testUser = new User({
      name: 'Test User',
      email: 'test@pavithra.com',
      username: username,
      password: hashedPassword,
      role: 'customer'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Username: test');
    console.log('Password: test123');
    console.log('Role: customer');
    console.log('');
    console.log('You can now login with these credentials!');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
});
