const axios = require('axios');

// Base URL for API requests
const API_URL = 'http://localhost:5000';

// Test the root endpoint
async function testRootEndpoint() {
  try {
    const response = await axios.get(API_URL);
    console.log('Root endpoint test:', response.data);
    return true;
  } catch (error) {
    console.error('Root endpoint test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Running API tests...');
  
  // Test root endpoint
  const rootTest = await testRootEndpoint();
  
  if (rootTest) {
    console.log('\n✅ All tests passed! Server is running correctly.');
  } else {
    console.log('\n❌ Some tests failed. Check server logs for details.');
  }
}

// Run the tests
runTests(); 