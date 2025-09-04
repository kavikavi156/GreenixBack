const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pavithratraders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestCustomer() {
  try {
    // Check if customer already exists
    const existingCustomer = await User.findOne({ username: 'customer' });
    if (existingCustomer) {
      console.log('Test customer already exists');
      console.log('Customer ID:', existingCustomer._id);
      console.log('Username: customer');
      console.log('Email:', existingCustomer.email);
      mongoose.connection.close();
      return;
    }

    // Create test customer
    const hashedPassword = await bcrypt.hash('customer123', 10);
    const testCustomer = new User({
      name: 'Test Customer',
      email: 'customer@test.com',
      username: 'customer',
      password: hashedPassword,
      role: 'customer'
    });

    await testCustomer.save();
    console.log('Test customer created successfully:');
    console.log('Customer ID:', testCustomer._id);
    console.log('Username: customer');
    console.log('Password: customer123');
    console.log('Email: customer@test.com');
    console.log('Role: customer');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test customer:', error);
    mongoose.connection.close();
  }
}

createTestCustomer();
