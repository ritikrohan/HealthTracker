# Environment Setup Guide

## The Issue
Your API calls are failing with "Auth session missing!" because the Supabase environment variables are not configured.

## Solution

### 1. Create Environment File
Create a `.env.local` file in your project root with your Supabase credentials:

```bash
# Create the environment file
touch .env.local
```

### 2. Add Your Supabase Credentials
Open `.env.local` and add your Supabase project details:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Get Your Supabase Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Restart Your Development Server
After adding the environment variables:

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## What Was Fixed

1. **Client-Side Authentication**: Updated to use `@supabase/ssr` for proper session management
2. **Session Handling**: Added auth state listeners to handle session changes
3. **API Authentication**: The server-side auth helpers were already correct
4. **Environment Variables**: You need to add your Supabase credentials

## Testing

After setting up the environment variables:

1. Sign in with your credentials
2. Check the Auth Debug component on the dashboard
3. Test the "Test Auth API" button
4. Try uploading a document

The authentication should now work properly across both client and server components.

