# Health Tracker - Vercel Deployment Guide

## 🚀 Quick Fix for Vercel Deployment

The default Next.js page appearing means there's likely a build or configuration issue. Here's how to fix it:

### 1. **Environment Variables Setup**

In your Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=https://your-backend-deployment-url
```

### 2. **Build Configuration**

The `vercel.json` file has been created with the correct configuration. Make sure your Vercel project is set to:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3. **Common Issues & Solutions**

#### Issue: Default Next.js page showing
**Solution**: 
1. Check if build is successful in Vercel logs
2. Ensure all environment variables are set
3. Verify the build output directory

#### Issue: Build failures
**Solution**:
1. Check for TypeScript errors
2. Ensure all dependencies are installed
3. Verify Tailwind CSS configuration

### 4. **Deployment Steps**

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add the required env vars
3. **Deploy**: Vercel will automatically build and deploy
4. **Check Logs**: Monitor build logs for any errors

### 5. **Backend Deployment**

Since the frontend calls a backend API, you'll also need to deploy the backend:

1. **Deploy Backend**: Deploy the `healthTracker-backend` to Vercel or another service
2. **Update Frontend**: Set `NEXT_PUBLIC_BACKEND_URL` to your backend URL
3. **Redeploy Frontend**: Trigger a new deployment

### 6. **Verification**

After deployment, you should see:
- ✅ Health Tracker landing page (not default Next.js page)
- ✅ Working authentication
- ✅ Document upload functionality
- ✅ Dashboard with reports

### 7. **Troubleshooting**

If you still see the default Next.js page:

1. **Check Build Logs**: Look for errors in Vercel build logs
2. **Clear Cache**: Try redeploying with "Clear Cache" option
3. **Check Routes**: Ensure all pages are properly exported
4. **Environment Variables**: Verify all required env vars are set

### 8. **Production Checklist**

- [ ] Environment variables configured
- [ ] Backend deployed and accessible
- [ ] Database migrations run
- [ ] Build successful
- [ ] All routes working
- [ ] Authentication functional
