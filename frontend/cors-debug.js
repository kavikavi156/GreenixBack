// CORS Debug Test - Run this in browser console on https://greenixx.netlify.app
console.log('🧪 Testing CORS from Netlify to Render...');

async function testAPI() {
  const baseURL = 'https://greenix-3.onrender.com';
  
  console.log('Testing endpoints:');
  
  // Test 1: Health Check
  try {
    console.log('\n1️⃣ Testing health check...');
    const healthResponse = await fetch(`${baseURL}/health`);
    console.log('✅ Health Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('📊 Health Data:', healthData);
    } else {
      console.log('❌ Health failed:', await healthResponse.text());
    }
  } catch (error) {
    console.log('❌ Health error:', error.message);
  }
  
  // Test 2: Products API
  try {
    console.log('\n2️⃣ Testing products API...');
    const productsResponse = await fetch(`${baseURL}/api/products`);
    console.log('📦 Products Status:', productsResponse.status);
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('✅ Products loaded:', Array.isArray(products) ? products.length : 'Not array');
    } else {
      console.log('❌ Products failed:', await productsResponse.text());
    }
  } catch (error) {
    console.log('❌ Products error:', error.message);
    if (error.message.includes('CORS')) {
      console.log('🚨 CORS Issue Detected!');
    }
  }
  
  // Test 3: Root endpoint
  try {
    console.log('\n3️⃣ Testing root endpoint...');
    const rootResponse = await fetch(`${baseURL}/`);
    console.log('🏠 Root Status:', rootResponse.status);
    
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('✅ Root data:', rootData);
    }
  } catch (error) {
    console.log('❌ Root error:', error.message);
  }
}

testAPI();