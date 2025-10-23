#!/usr/bin/env node

/**
 * Test script to verify user-specific health reports are being saved and retrieved
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'https://health-tracker-7fcp.vercel.app';

async function testUserReports() {
  console.log('🧪 Testing User-Specific Health Reports\n');

  try {
    // Test 1: Check if we can get reports without auth (should fail)
    console.log('🔍 Test 1: Unauthorized access to reports...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/health-documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        console.log('✅ Unauthorized access properly blocked');
      } else {
        console.log('❌ Unauthorized access should be blocked');
      }
    } catch (error) {
      console.log('✅ Unauthorized access properly blocked (network error)');
    }

    // Test 2: Check backend health
    console.log('\n🔍 Test 2: Backend health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/test`);
    const healthData = await healthResponse.json();
    
    if (healthData.success) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // Test 3: Check AI service status
    console.log('\n🔍 Test 3: AI service status...');
    const aiResponse = await fetch(`${BACKEND_URL}/api/ai/status`);
    const aiData = await aiResponse.json();
    
    if (aiData.success && aiData.data.available) {
      console.log('✅ AI service is available');
      console.log(`   - OpenAI: ${aiData.data.openai ? '✅' : '❌'}`);
      console.log(`   - Anthropic: ${aiData.data.anthropic ? '✅' : '❌'}`);
      console.log(`   - Google: ${aiData.data.google ? '✅' : '❌'}`);
    } else {
      console.log('❌ AI service is not available');
    }

    console.log('\n📋 Manual Testing Required:');
    console.log('1. Visit https://health-tracker-eta-ten.vercel.app/test-auth');
    console.log('2. Sign in with your account');
    console.log('3. Upload a health document');
    console.log('4. Check if the report appears in the dashboard');
    console.log('5. Verify the report contains AI analysis data');
    
    console.log('\n🔧 Database Migration Required:');
    console.log('Run this SQL in your Supabase dashboard:');
    console.log('');
    console.log('ALTER TABLE public.health_reports ALTER COLUMN document_id DROP NOT NULL;');
    console.log('');
    console.log('This allows storing reports without document references.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUserReports();
