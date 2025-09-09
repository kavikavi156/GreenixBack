import axios from 'axios';

async function testRevenueAPI() {
  try {
    console.log('Testing monthly revenue API...');
    
    const response = await axios.get('http://localhost:3001/api/admin/revenue/monthly?year=2025', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
      console.error('Code:', error.code);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Add a simple connectivity test first
async function testBasicConnection() {
  try {
    console.log('Testing basic server connection...');
    const response = await axios.get('http://localhost:3001/api', {
      timeout: 5000
    });
    console.log('✅ Basic connection successful');
    return true;
  } catch (error) {
    console.error('❌ Basic connection failed:', error.message);
    return false;
  }
}

async function runTests() {
  const basicOk = await testBasicConnection();
  if (basicOk) {
    await testRevenueAPI();
  }
}

runTests();
