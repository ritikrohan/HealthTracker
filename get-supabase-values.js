#!/usr/bin/env node

/**
 * Script to help you get your Supabase environment values
 */

console.log('🔍 Getting Supabase Environment Values');
console.log('=====================================\n');

console.log('📋 Follow these steps to get your Supabase values:');
console.log('');
console.log('1. 🌐 Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard');
console.log('');
console.log('2. 🎯 Select your Health Tracker project');
console.log('');
console.log('3. ⚙️  Go to Settings → API');
console.log('');
console.log('4. 📋 Copy these values:');
console.log('');
console.log('   📍 Project URL:');
console.log('   - Copy the "Project URL" value');
console.log('   - Use this for NEXT_PUBLIC_SUPABASE_URL');
console.log('   - Format: https://your-project-id.supabase.co');
console.log('');
console.log('   🔑 API Keys:');
console.log('   - Copy the "anon public" key');
console.log('   - Use this for NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('');
console.log('5. 🚀 Add these to Vercel:');
console.log('   - Go to your Vercel project dashboard');
console.log('   - Settings → Environment Variables');
console.log('   - Add each variable with the values above');
console.log('');
console.log('6. 🔄 Redeploy your project');
console.log('   - Go to Deployments tab');
console.log('   - Click "Redeploy"');
console.log('   - Clear cache and redeploy');
console.log('');
console.log('✅ After these steps, your deployment should work!');
console.log('');
console.log('🎯 Expected Result:');
console.log('- Health Tracker landing page (not default Next.js page)');
console.log('- Working authentication system');
console.log('- No environment variable errors');
