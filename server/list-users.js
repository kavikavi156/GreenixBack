const mongoose = require('mongoose');
const User = require('./models/User.js');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function listUsers() {
  try {
    const users = await User.find({}, 'name email username role');
    console.log('Existing users in database:');
    console.log('=================================');
    users.forEach(user => {
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error listing users:', error);
    mongoose.connection.close();
  }
}

listUsers();
