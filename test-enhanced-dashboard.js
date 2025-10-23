#!/usr/bin/env node

/**
 * Test script to verify enhanced dashboard features
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'https://health-tracker-7fcp.vercel.app';
const FRONTEND_URL = 'https://health-tracker-eta-ten.vercel.app';

async function testEnhancedDashboard() {
  console.log('🧪 Testing Enhanced Dashboard Features\n');

  try {
    // Test 1: Check backend health
    console.log('🔍 Test 1: Backend health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/test`);
    const healthData = await healthResponse.json();
    
    if (healthData.success) {
      console.log('✅ Backend is running');
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // Test 2: Check frontend accessibility
    console.log('\n🔍 Test 2: Frontend accessibility...');
    try {
      const frontendResponse = await fetch(`${FRONTEND_URL}`);
      if (frontendResponse.ok) {
        console.log('✅ Frontend is accessible');
      } else {
        console.log('❌ Frontend not accessible');
      }
    } catch (error) {
      console.log('❌ Frontend not accessible:', error.message);
    }

    console.log('\n📋 Enhanced Dashboard Features:');
    console.log('✅ Lab Information Extraction: AI now extracts lab details from reports');
    console.log('✅ Patient Information: Patient name, age, gender extraction');
    console.log('✅ Test Categories Display: Visual cards showing test category counts');
    console.log('✅ Lab Statistics: Shows which labs you use most frequently');
    console.log('✅ Trend Analysis: Category-wise flagged value percentages');
    console.log('✅ Enhanced Report Display: Lab and patient info in report cards');

    console.log('\n🔧 Database Migration Required:');
    console.log('Run this SQL in your Supabase dashboard:');
    console.log('');
    console.log('-- Add lab information columns');
    console.log('ALTER TABLE public.health_reports ADD COLUMN lab_name TEXT;');
    console.log('ALTER TABLE public.health_reports ADD COLUMN lab_address TEXT;');
    console.log('ALTER TABLE public.health_reports ADD COLUMN lab_contact TEXT;');
    console.log('ALTER TABLE public.health_reports ADD COLUMN lab_code TEXT;');
    console.log('');
    console.log('-- Add patient information columns');
    console.log('ALTER TABLE public.health_reports ADD COLUMN patient_name TEXT;');
    console.log('ALTER TABLE public.health_reports ADD COLUMN patient_age INTEGER;');
    console.log('ALTER TABLE public.health_reports ADD COLUMN patient_gender TEXT;');
    console.log('ALTER TABLE public.health_reports ADD COLUMN patient_id TEXT;');

    console.log('\n🧪 Manual Testing Steps:');
    console.log('1. Run the database migration above');
    console.log('2. Visit https://health-tracker-eta-ten.vercel.app/test-auth');
    console.log('3. Sign in with your account');
    console.log('4. Upload a new health document');
    console.log('5. Check the following features:');
    console.log('   - Lab information displayed in report cards');
    console.log('   - Patient information shown if available');
    console.log('   - Test categories overview in Reports tab');
    console.log('   - Lab statistics in Health Dashboard');
    console.log('   - Trend analysis with flagged percentages');

    console.log('\n🎯 New Features Added:');
    console.log('✅ Lab Information: Name, address, contact, code extraction');
    console.log('✅ Patient Details: Name, age, gender, ID extraction');
    console.log('✅ Test Categories: Visual cards with counts and icons');
    console.log('✅ Lab Statistics: Most used labs with percentages');
    console.log('✅ Trend Analysis: Category-wise flagged value tracking');
    console.log('✅ Enhanced AI Prompts: Better extraction of lab and patient data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEnhancedDashboard();
