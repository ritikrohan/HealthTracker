'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { ExtractedHealthData } from '@/lib/ai-vision-processor'
import { createClient } from '@/lib/supabase-client'
import { API_ENDPOINTS, APIClient } from '@/lib/api-config'

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void
}

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [aiResults, setAiResults] = useState<ExtractedHealthData | null>(null)
  const [showResults, setShowResults] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const apiClient = new APIClient(supabase)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error')
      setMessage('Invalid file type. Only PDF and images are allowed.')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setUploadStatus('error')
      setMessage('File too large. Maximum size is 10MB.')
      return
    }

    setUploading(true)
    setUploadStatus('idle')
    setMessage('Processing document...')

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Authentication required')
      }

      // Use AI Vision to analyze the document via backend API
      setMessage('🤖 AI is analyzing your document...')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'lab_report')
      
      const aiResult = await apiClient.uploadFile(API_ENDPOINTS.UPLOAD_AND_ANALYZE, formData)
      const extractedData = aiResult.aiResult
      
      // The backend has already handled upload, analysis, and database saving
      setMessage('✅ Document processed successfully!')

      setUploadStatus('success')
      setMessage('🎉 AI analysis complete! Your health document has been processed with advanced AI vision, structured tables created, and comprehensive summary generated.')
      
      // Store AI results and show them
      setAiResults(extractedData)
      setShowResults(true)
      
      onUploadComplete?.(aiResult.documentId)

    } catch (error) {
      console.error('Processing error:', error)
      setUploadStatus('error')
      setMessage(error instanceof Error ? error.message : 'Processing failed. Please try again.')
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }


  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const createHealthTable = (extractedData: ExtractedHealthData): any[] => {
    const tables = []

    // Main results table
    if (Object.keys(extractedData.results).length > 0) {
      tables.push({
        name: 'Health Parameters',
        headers: ['Parameter', 'Value', 'Unit', 'Status', 'Normal Range'],
        rows: Object.entries(extractedData.results).map(([param, data]) => [
          param,
          data.value,
          data.unit,
          data.status,
          extractedData.normalRanges[param]?.range || 'N/A'
        ])
      })
    }

    // Flagged values table
    if (extractedData.flaggedValues.length > 0) {
      tables.push({
        name: 'Flagged Values',
        headers: ['Parameter', 'Value', 'Status', 'Recommendation'],
        rows: extractedData.flaggedValues.map(flagged => {
          const [param, value, status] = flagged.split(': ')
          return [
            param,
            value,
            status,
            'Consult healthcare provider'
          ]
        })
      })
    }

    return tables
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading || processing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            {uploading || processing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {uploading ? 'Processing Document...' : 'Upload Health Document'}
            </h3>
            <p className="text-sm text-gray-500">
              {uploading ? (
                'Extracting and analyzing your health document...'
              ) : (
                <>
                  Drag and drop your health document here, or{' '}
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    browse files
                  </button>
                </>
              )}
            </p>
            {uploading && (
              <div className="text-xs text-blue-600 mt-2">
                <p>🤖 AI Vision Analysis - Advanced document processing!</p>
                <p>📊 Creates structured tables and comprehensive summaries</p>
                <p>📄 Supports PDFs, images, and handwritten documents</p>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400">
            <p>Supported formats: PDF, JPG, PNG (including handwritten documents)</p>
            <p>Maximum file size: 10MB</p>
            <p>🤖 AI Vision Analysis with structured table extraction</p>
            <p>📊 Comprehensive health summaries and recommendations</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-md flex items-center ${
          uploadStatus === 'success' 
            ? 'bg-green-50 text-green-800' 
            : uploadStatus === 'error'
            ? 'bg-red-50 text-red-800'
            : 'bg-blue-50 text-blue-800'
        }`}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="h-5 w-5 mr-2" />
          ) : (
            <FileText className="h-5 w-5 mr-2" />
          )}
          {message}
        </div>
      )}

      {/* AI Results Display */}
      {showResults && aiResults && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                🤖 AI Analysis Results
              </h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Test Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Test Name</h4>
                <p className="text-blue-700">{aiResults.testName}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Category</h4>
                <p className="text-green-700 capitalize">{aiResults.testCategory.replace('_', ' ')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-1">Test Date</h4>
                <p className="text-purple-700">{aiResults.testDate}</p>
              </div>
            </div>

            {/* Health Parameters Table */}
            {Object.keys(aiResults.results).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">📊 Health Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(aiResults.results).map(([param, data]) => (
                        <tr key={param}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{param}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{data.value}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{data.unit}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              data.status === 'normal' 
                                ? 'bg-green-100 text-green-800'
                                : data.status === 'high'
                                ? 'bg-red-100 text-red-800'
                                : data.status === 'low'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {data.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Flagged Values */}
            {aiResults.flaggedValues.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-3">⚠️ Flagged Values</h4>
                <ul className="space-y-2">
                  {aiResults.flaggedValues.map((flagged, index) => (
                    <li key={index} className="text-red-700 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {flagged}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Summary */}
            {aiResults.summary && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">📝 AI Summary</h4>
                <p className="text-blue-800 leading-relaxed">{aiResults.summary}</p>
              </div>
            )}

            {/* Recommendations */}
            {aiResults.recommendations.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">💡 Recommendations</h4>
                <ul className="space-y-2">
                  {aiResults.recommendations.map((rec, index) => (
                    <li key={index} className="text-green-700 flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

