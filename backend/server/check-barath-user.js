const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Find user 'barath'
    const user = await User.findOne({ username: 'barath' });
    
    if (user) {
      console.log('✅ User "barath" found:');
      console.log('- Username:', user.username);
      console.log('- Role:', user.role);
      console.log('- ID:', user._id);
    } else {
      console.log('❌ User "barath" not found');
      console.log('Creating user "barath" with password "password123"...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const newUser = new User({
        username: 'barath',
        password: hashedPassword,
        role: 'customer',
        firstName: 'Barath',
        lastName: 'Customer',
        email: 'barath@test.com'
      });
      
      await newUser.save();
      console.log('✅ User "barath" created successfully!');
    }
    
    // List all users
    const allUsers = await User.find({});
    console.log(`\n📋 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkUsers();