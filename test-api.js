const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/products',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('Number of products:', result.products ? result.products.length : 0);
    } catch (error) {
      console.log('Raw response:', data);
      console.error('Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.end();