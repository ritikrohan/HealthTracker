'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { API_ENDPOINTS, APIClient } from '@/lib/api-config'

export default function AuthDebug() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        setError(error.message)
      } else {
        setUser(user)
      }
    } catch (err) {
      setError('Failed to check auth')
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    try {
      const supabase = createClient()
      const apiClient = new APIClient(supabase)
      const result = await apiClient.request(API_ENDPOINTS.TEST_AUTH)
      console.log('Auth test result:', result)
      alert(`Auth test: 200 - ${JSON.stringify(result, null, 2)}`)
    } catch (err) {
      console.error('Auth test error:', err)
      alert(`Auth test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const testUpload = async () => {
    try {
      // Create a test file for upload
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', testFile)
      formData.append('documentType', 'other')

      const supabase = createClient()
      const apiClient = new APIClient(supabase)
      const result = await apiClient.uploadFile(API_ENDPOINTS.UPLOAD, formData)
      
      console.log('Upload test result:', result)
      alert(`Upload test: 200 - ${JSON.stringify(result)}`)
    } catch (err) {
      console.error('Upload test error:', err)
      alert(`Upload test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">Checking auth...</div>
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}
      
      {user ? (
        <div className="mb-2 p-2 bg-green-100 text-green-800 rounded">
          ✅ Authenticated as: {user.email}
        </div>
      ) : (
        <div className="mb-2 p-2 bg-red-100 text-red-800 rounded">
          ❌ Not authenticated
        </div>
      )}
      
      <div className="space-x-2">
        <button
          onClick={testAuth}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Auth API
        </button>
        <button
          onClick={testUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Upload API
        </button>
      </div>
    </div>
  )
}
