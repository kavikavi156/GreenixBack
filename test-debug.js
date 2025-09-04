// Test script to check debug endpoints
async function testDebugEndpoints() {
  try {
    console.log('Testing debug endpoints...');
    
    // Test list all users
    console.log('\n1. Checking all users in database:');
    const usersResponse = await fetch('http://localhost:3001/api/customer/debug/users');
    const usersData = await usersResponse.json();
    console.log('Users:', JSON.stringify(usersData, null, 2));
    
    // If we have users, test checking a specific user
    if (usersData.users && usersData.users.length > 0) {
      const firstUserId = usersData.users[0].id;
      console.log(`\n2. Checking specific user (${firstUserId}):`);
      
      const userResponse = await fetch(`http://localhost:3001/api/customer/debug/user/${firstUserId}`);
      const userData = await userResponse.json();
      console.log('User check:', JSON.stringify(userData, null, 2));
    }
    
    // Test with a fake user ID
    console.log('\n3. Testing with fake user ID:');
    const fakeResponse = await fetch('http://localhost:3001/api/customer/debug/user/507f1f77bcf86cd799439011');
    const fakeData = await fakeResponse.json();
    console.log('Fake user check:', JSON.stringify(fakeData, null, 2));
    
  } catch (error) {
    console.error('Error testing debug endpoints:', error);
  }
}

testDebugEndpoints();
