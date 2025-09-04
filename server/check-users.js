const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/pavithratraders').then(async () => {
  try {
    const users = await User.find({}, 'name email username role');
    console.log('All users in database:');
    console.log('====================');
    users.forEach(user => {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });
    if (users.length === 0) {
      console.log('No users found in database!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
});
