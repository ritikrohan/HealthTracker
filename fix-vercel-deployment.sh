#!/bin/bash

echo "🔧 Fixing Vercel Deployment Issues for Health Tracker"
echo "=================================================="

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build the project locally to check for errors
echo "🏗️  Building project locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi

# 3. Check for common issues
echo "🔍 Checking for common deployment issues..."

# Check if all required files exist
if [ ! -f "src/app/page.tsx" ]; then
    echo "❌ Missing src/app/page.tsx"
    exit 1
fi

if [ ! -f "src/app/layout.tsx" ]; then
    echo "❌ Missing src/app/layout.tsx"
    exit 1
fi

if [ ! -f "tailwind.config.js" ]; then
    echo "❌ Missing tailwind.config.js"
    exit 1
fi

echo "✅ All required files present"

# 4. Create deployment checklist
echo "📋 Deployment Checklist:"
echo "1. ✅ Dependencies installed"
echo "2. ✅ Build successful"
echo "3. ✅ Required files present"
echo ""
echo "🚀 Next Steps for Vercel:"
echo "1. Push these changes to your GitHub repository"
echo "2. In Vercel dashboard, redeploy your project"
echo "3. Set these environment variables in Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_BACKEND_URL"
echo "4. Check build logs for any remaining errors"
echo ""
echo "🎯 If you still see the default Next.js page:"
echo "1. Clear Vercel cache and redeploy"
echo "2. Check that all environment variables are set"
echo "3. Verify the build output directory is '.next'"
echo "4. Ensure the framework is set to 'Next.js'"

echo ""
echo "✨ Deployment fix complete!"
