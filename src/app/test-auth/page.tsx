'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS, APIClient } from '@/lib/api-config'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authTest, setAuthTest] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const apiClient = new APIClient(supabase)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAuthAPI = async () => {
    setTestLoading(true)
    try {
      const result = await apiClient.request(API_ENDPOINTS.TEST_AUTH)
      setAuthTest({ status: 200, data: result })
    } catch (error) {
      setAuthTest({ status: 'error', data: { error: error instanceof Error ? error.message : 'Unknown error' } })
    } finally {
      setTestLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAuthTest(null)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Test</h1>
          
          {/* Current Auth Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h2>
            {user ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Authenticated</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>ID:</strong> {user.id}</p>
                      <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Not Authenticated</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>You need to sign in to test the API endpoints.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* API Test */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">API Test</h2>
            <button
              onClick={testAuthAPI}
              disabled={testLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {testLoading ? 'Testing...' : 'Test Auth API'}
            </button>
            
            {authTest && (
              <div className="mt-4 p-4 bg-gray-50 border rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">API Response:</h3>
                <div className="text-sm">
                  <p><strong>Status:</strong> {authTest.status}</p>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(authTest.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


