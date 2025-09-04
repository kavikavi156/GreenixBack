// Simple test script to verify cart functionality
const testLogin = async () => {
  try {
    // Test login with existing user
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'carttest',
        password: 'carttest123'
      })
    });

    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful!');
    console.log('Token:', loginData.token);
    
    // Decode the token to get user ID
    const tokenPayload = JSON.parse(atob(loginData.token.split('.')[1]));
    console.log('User ID:', tokenPayload.userId);
    
    // Test fetching cart
    const cartResponse = await fetch(`http://localhost:3001/api/customer/cart/${tokenPayload.userId}`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const cartData = await cartResponse.json();
    console.log('Cart data:', cartData);
    
    // Get some products to test adding to cart
    const productsResponse = await fetch('http://localhost:3001/api/products');
    const productsData = await productsResponse.json();
    console.log('Available products:', productsData.products?.length || 0);
    
    if (productsData.products && productsData.products.length > 0) {
      const firstProduct = productsData.products[0];
      console.log('Testing add to cart with product:', firstProduct.name);
      
      // Test adding to cart
      const addToCartResponse = await fetch(`http://localhost:3001/api/customer/cart/${tokenPayload.userId}/${firstProduct._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({ quantity: 1 })
      });
      
      const addToCartData = await addToCartResponse.json();
      console.log('Add to cart result:', addToCartData);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
testLogin();
