// Test script to verify backend integration
const fetch = require('node-fetch');

const BACKEND_URL = 'https://health-tracker-7fcp.vercel.app';
const FRONTEND_URL = 'https://health-tracker-eta-ten.vercel.app';

async function testBackendHealth() {
  try {
    console.log('🔍 Testing backend health...');
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('✅ Backend health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function testBackendAPI() {
  try {
    console.log('🔍 Testing backend API status...');
    const response = await fetch(`${BACKEND_URL}/api/status`);
    const data = await response.json();
    console.log('✅ Backend API status:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend API status failed:', error.message);
    return false;
  }
}

async function testAIService() {
  try {
    console.log('🔍 Testing AI service status...');
    const response = await fetch(`${BACKEND_URL}/api/ai/status`);
    const data = await response.json();
    console.log('✅ AI service status:', data);
    return true;
  } catch (error) {
    console.error('❌ AI service status failed:', error.message);
    return false;
  }
}

async function testFrontend() {
  try {
    console.log('🔍 Testing frontend...');
    const response = await fetch(`${FRONTEND_URL}`);
    if (response.ok) {
      console.log('✅ Frontend is running');
      return true;
    } else {
      console.log('⚠️ Frontend returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Health Tracker Integration Tests\n');
  
  const results = {
    backendHealth: await testBackendHealth(),
    backendAPI: await testBackendAPI(),
    aiService: await testAIService(),
    frontend: await testFrontend()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Backend integration is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Visit https://health-tracker-eta-ten.vercel.app/test-auth to test authentication');
    console.log('2. Upload a document to test AI analysis');
    console.log('3. Check browser network tab to see API calls going to port 3001');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the backend server is running on port 3001');
    console.log('Run: cd healthTracker-backend && npm run dev');
  }
}

runTests().catch(console.error);
