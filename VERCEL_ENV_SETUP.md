# Vercel Environment Variables Setup

## 🚨 Current Issue
The deployment is failing because environment variables are not properly configured in Vercel.

## 🔧 How to Fix

### 1. **Go to Vercel Dashboard**
1. Open your Vercel project dashboard
2. Click on your **Health Tracker** project
3. Go to **Settings** tab
4. Click on **Environment Variables**

### 2. **Add These Environment Variables**

Add each variable one by one:

#### **NEXT_PUBLIC_SUPABASE_URL**
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://your-project-id.supabase.co`
- **Environment**: Production, Preview, Development

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `your_supabase_anon_key_here`
- **Environment**: Production, Preview, Development

#### **NEXT_PUBLIC_BACKEND_URL**
- **Name**: `NEXT_PUBLIC_BACKEND_URL`
- **Value**: `https://health-tracker-7fcp.vercel.app` (or your backend URL)
- **Environment**: Production, Preview, Development

### 3. **Get Your Supabase Values**

If you don't have your Supabase values:

1. Go to your **Supabase Dashboard**
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. **Redeploy**

After adding all environment variables:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Select **"Use existing Build Cache"** = **No**
4. Click **"Redeploy"**

### 5. **Verify Deployment**

After redeployment, you should see:
- ✅ Health Tracker landing page (not default Next.js page)
- ✅ Working authentication
- ✅ No environment variable errors

## 🎯 Quick Checklist

- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `NEXT_PUBLIC_BACKEND_URL`
- [ ] Set for all environments (Production, Preview, Development)
- [ ] Redeployed with cache cleared
- [ ] Verified deployment is working

## 🆘 If Still Having Issues

1. **Check Build Logs**: Look for any remaining errors
2. **Verify Supabase**: Ensure your Supabase project is active
3. **Test Locally**: Run `npm run dev` to test locally first
4. **Contact Support**: If issues persist, check Vercel support docs
