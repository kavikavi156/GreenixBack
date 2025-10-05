const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.js');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB Atlas');
  const admins = await User.find({role: 'admin'}, 'name email username _id role');
  console.log('Admin users in database:', JSON.stringify(admins, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});