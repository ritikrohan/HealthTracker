// API Configuration for Health Tracker
// This file centralizes all API endpoint configurations

// Backend server configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://health-tracker-7fcp.vercel.app'

// API endpoints
export const API_ENDPOINTS = {
  // Health Documents
  UPLOAD: `${BACKEND_URL}/api/health-documents/upload`,
  ANALYZE: `${BACKEND_URL}/api/health-documents/analyze`,
  UPLOAD_AND_ANALYZE: `${BACKEND_URL}/api/health-documents/upload-and-analyze`,
  GET_DOCUMENTS: `${BACKEND_URL}/api/health-documents`,
  GET_DOCUMENT: (id: string) => `${BACKEND_URL}/api/health-documents/${id}`,
  DELETE_DOCUMENT: (id: string) => `${BACKEND_URL}/api/health-documents/${id}`,
  
  // Health Reports
  GET_REPORTS: `${BACKEND_URL}/api/health-documents`, // Same as documents for now
  
  // AI Services
  AI_STATUS: `${BACKEND_URL}/api/ai/status`,
  CHAT_COMPLETION_STREAM: `${BACKEND_URL}/api/ai/chat-completion-stream`,
  HEALTH_CHAT_STREAM: `${BACKEND_URL}/api/ai/health-chat-stream`,
  FAST_CHAT_STREAM: `${BACKEND_URL}/api/ai/fast-chat-completion-stream`,
  ULTRA_FAST_CHAT_STREAM: `${BACKEND_URL}/api/ai/ultra-fast-chat-completion-stream`,
  HEALTH_FAST_STREAM: `${BACKEND_URL}/api/ai/health-fast-stream`,
  TEST_STREAM: `${BACKEND_URL}/api/ai/test-stream`,
  SIMPLE_CHAT: `${BACKEND_URL}/api/ai/simple-chat`,
  
  // Test endpoints
  TEST_AUTH: `${BACKEND_URL}/api/ai/status`, // Using AI status as auth test
  BACKEND_STATUS: `${BACKEND_URL}/api/status`,
  BACKEND_TEST: `${BACKEND_URL}/api/test`,
}

// Helper function to get auth headers
export const getAuthHeaders = async (supabase: any) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    throw new Error('No authentication token available')
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
}

// Helper function for file upload headers
export const getFileUploadHeaders = async (supabase: any) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    throw new Error('No authentication token available')
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`
    // Don't set Content-Type for FormData - let browser set it with boundary
  }
}

// API client with error handling
export class APIClient {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async request(endpoint: string, options: RequestInit = {}) {
    try {
      const authHeaders = await getAuthHeaders(this.supabase)
      
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async uploadFile(endpoint: string, formData: FormData) {
    try {
      const authHeaders = await getFileUploadHeaders(this.supabase)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders,
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  }
}

export default API_ENDPOINTS
