// Test script for admin endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api/admin';

async function testAdminEndpoints() {
  try {
    console.log('Testing Admin Endpoints...\n');
    
    // Test 1: Get admin list
    console.log('1. Testing GET /admin-list');
    try {
      const response = await fetch(`${BASE_URL}/admin-list`);
      const admins = await response.json();
      console.log('✅ Admin list fetched successfully');
      console.log(`   Found ${admins.length} admins\n`);
    } catch (error) {
      console.log('❌ Admin list fetch failed:', error.message);
    }

    // Test 2: Create new admin
    console.log('2. Testing POST /create-admin');
    try {
      const newAdmin = {
        name: 'Test Administrator',
        email: 'testadmin@pavithratraders.com',
        password: 'admin123',
        role: 'admin'
      };
      
      const response = await fetch(`${BASE_URL}/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      
      const result = await response.json();
      if (response.ok) {
        console.log('✅ Admin created successfully');
        console.log(`   Admin ID: ${result.admin._id}\n`);
        return result.admin._id;
      } else {
        console.log('❌ Admin creation failed:', result.error);
      }
    } catch (error) {
      console.log('❌ Admin creation failed:', error.message);
    }

    // Test 3: Get updated admin list
    console.log('3. Testing GET /admin-list (after creation)');
    try {
      const response = await fetch(`${BASE_URL}/admin-list`);
      const admins = await response.json();
      console.log('✅ Updated admin list fetched successfully');
      console.log(`   Now found ${admins.length} admins\n`);
    } catch (error) {
      console.log('❌ Updated admin list fetch failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run tests
testAdminEndpoints();