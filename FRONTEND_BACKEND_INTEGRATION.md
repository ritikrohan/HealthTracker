# Frontend-Backend Integration Guide

## Overview
The Health Tracker frontend has been updated to use the backend API server running on port 3001 instead of the Next.js API routes.

## Configuration

### 1. Environment Variables
Add these environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 2. Backend Server
Make sure the backend server is running on port 3001:

```bash
cd healthTracker-backend
npm install
npm run dev
```

## API Endpoints

### Updated Frontend API Calls

#### Document Upload
- **Old**: `POST /api/ai-analyze` (Next.js API route)
- **New**: `POST http://localhost:3001/api/health-documents/analyze` (Backend API)

#### Reports Fetching
- **Old**: `GET /api/reports` (Next.js API route)
- **New**: `GET http://localhost:3001/api/health-documents` (Backend API)

#### Authentication Testing
- **Old**: `GET /api/test-auth` (Next.js API route)
- **New**: `GET http://localhost:3001/api/ai/status` (Backend API)

## New API Configuration

### API Client
The frontend now uses a centralized API client (`src/lib/api-config.ts`) that:

- **Handles Authentication**: Automatically adds JWT tokens to requests
- **Error Handling**: Provides consistent error handling across all API calls
- **Type Safety**: TypeScript support for all API endpoints
- **Environment Configuration**: Uses `NEXT_PUBLIC_BACKEND_URL` for backend URL

### Available Endpoints

#### Health Documents
- `POST /api/health-documents/upload` - Upload document
- `POST /api/health-documents/analyze` - Analyze document with AI
- `GET /api/health-documents` - Get all documents
- `GET /api/health-documents/:id` - Get specific document
- `DELETE /api/health-documents/:id` - Delete document

#### AI Services
- `GET /api/ai/status` - AI service status
- `POST /api/ai/chat-completion-stream` - Standard streaming
- `POST /api/ai/health-chat-stream` - Health-focused streaming
- `POST /api/ai/fast-chat-completion-stream` - Fast streaming
- `POST /api/ai/ultra-fast-chat-completion-stream` - Ultra-fast streaming
- `POST /api/ai/health-fast-stream` - Health-specific fast streaming

## Updated Components

### 1. DocumentUpload Component
- Now uses `API_ENDPOINTS.ANALYZE` for AI analysis
- Uses `APIClient.uploadFile()` for file uploads
- Handles backend authentication automatically

### 2. Dashboard Component
- Uses `API_ENDPOINTS.GET_REPORTS` for fetching reports
- Integrated with `APIClient` for consistent error handling

### 3. Test Auth Page
- Uses `API_ENDPOINTS.TEST_AUTH` for authentication testing
- Tests backend API instead of Next.js API routes

### 4. AuthDebug Component
- Updated to use backend API endpoints
- Tests both authentication and file upload functionality

## Authentication Flow

### JWT Token Handling
The API client automatically:

1. **Gets Session**: Retrieves current Supabase session
2. **Extracts Token**: Gets access token from session
3. **Adds Headers**: Includes `Authorization: Bearer <token>` in requests
4. **Handles Errors**: Manages authentication errors gracefully

### Backend Authentication
The backend validates JWT tokens using:

1. **Token Extraction**: Extracts Bearer token from Authorization header
2. **Supabase Validation**: Validates token with Supabase
3. **User Context**: Adds user information to request context
4. **Error Handling**: Returns 401 for invalid tokens

## Development Workflow

### 1. Start Backend
```bash
cd healthTracker-backend
npm run dev
# Server runs on http://localhost:3001
```

### 2. Start Frontend
```bash
cd healthTracker
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Test Integration
- Visit `http://localhost:3000/test-auth` to test authentication
- Upload documents to test AI analysis
- Check browser network tab to see API calls going to port 3001

## Production Deployment

### Environment Variables
For production, update the backend URL:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

### CORS Configuration
The backend is configured to allow requests from:
- `http://localhost:3000` (development)
- `http://localhost:3001` (alternative port)
- Your production frontend domain

## Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure backend is running on port 3001
- Check CORS configuration in `corsOptions.js`
- Verify frontend is making requests to correct backend URL

#### 2. Authentication Errors
- Check Supabase configuration
- Verify JWT tokens are being sent correctly
- Test authentication with `/test-auth` page

#### 3. API Connection Errors
- Verify backend server is running
- Check `NEXT_PUBLIC_BACKEND_URL` environment variable
- Test backend health with `http://localhost:3001/health`

### Debug Steps

1. **Check Network Tab**: Verify API calls are going to port 3001
2. **Test Backend**: Visit `http://localhost:3001/api/status`
3. **Check Environment**: Verify `NEXT_PUBLIC_BACKEND_URL` is set
4. **Test Authentication**: Use the test-auth page to verify JWT flow

## Benefits

### Performance
- **Dedicated Backend**: Better performance for AI processing
- **Streaming Support**: Real-time AI responses
- **Optimized Headers**: Fast streaming with minimal overhead

### Scalability
- **Separate Services**: Frontend and backend can scale independently
- **Microservices**: AI services can be deployed separately
- **Load Balancing**: Backend can be load balanced

### Development
- **Clear Separation**: Frontend and backend concerns separated
- **Type Safety**: TypeScript support for API calls
- **Error Handling**: Consistent error handling across all endpoints
