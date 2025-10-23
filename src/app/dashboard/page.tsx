'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import DocumentUpload from '@/components/upload/DocumentUpload'
import HealthDashboard from '@/components/charts/HealthDashboard'
import ReportComparison from '@/components/comparison/ReportComparison'
import AuthButton from '@/components/auth/AuthButton'
import { API_ENDPOINTS, APIClient } from '@/lib/api-config'
import { Upload, BarChart3, FileText, Settings, Heart } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upload')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const apiClient = new APIClient(supabase)

  useEffect(() => {
    checkUser()
    fetchReports()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          router.push('/auth/signin')
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Auth error:', error)
      router.push('/auth/signin')
      return
    }
    if (!user) {
      router.push('/auth/signin')
      return
    }
    setUser(user)
  }

  const fetchReports = async () => {
    try {
      const data = await apiClient.request(API_ENDPOINTS.GET_REPORTS)
      console.log('Fetched reports data:', data) // Debug log
      setReports(data.data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (documentId: string) => {
    // Refresh reports after upload
    fetchReports()
  }

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HealthTracker</span>
            </div>
            <AuthButton user={user} />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Documents
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Health Dashboard
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Reports
            </button>
          </nav>
        </div>


        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Health Documents</h2>
              <DocumentUpload onUploadComplete={handleUploadComplete} />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Dashboard</h2>
              <HealthDashboard reports={reports} />
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Reports</h2>
              
              {/* Test Categories Overview */}
              {reports.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {['blood_work', 'imaging', 'vital_signs', 'specialized', 'other'].map((category) => {
                      const categoryReports = reports.filter(r => r.test_category === category);
                      if (categoryReports.length === 0) return null;
                      
                      const categoryLabels = {
                        blood_work: 'Blood Work',
                        imaging: 'Imaging',
                        vital_signs: 'Vital Signs',
                        specialized: 'Specialized',
                        other: 'Other'
                      };
                      
                      return (
                        <div key={category} className="bg-white p-4 rounded-lg shadow-sm border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{categoryLabels[category]}</p>
                              <p className="text-2xl font-bold text-blue-600">{categoryReports.length}</p>
                            </div>
                            <div className="text-blue-500">
                              {category === 'blood_work' && '🩸'}
                              {category === 'imaging' && '📷'}
                              {category === 'vital_signs' && '💓'}
                              {category === 'specialized' && '🔬'}
                              {category === 'other' && '📋'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {reports.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                  <p className="text-gray-500 mb-4">Upload your first health document to see your reports.</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{report.test_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(report.test_date).toLocaleDateString()} • {report.test_category}
                          </p>
                          {report.lab_name && (
                            <p className="text-sm text-gray-600 mt-1">
                              🏥 {report.lab_name}
                              {report.lab_address && ` • ${report.lab_address}`}
                            </p>
                          )}
                          {report.patient_name && (
                            <p className="text-sm text-gray-600">
                              👤 {report.patient_name}
                              {report.patient_age && `, Age: ${report.patient_age}`}
                              {report.patient_gender && `, ${report.patient_gender}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.flagged_values?.length > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {report.flagged_values?.length > 0 ? 'Flagged Values' : 'Normal'}
                          </span>
                          <button
                            onClick={() => toggleReportExpansion(report.id)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                          >
                            {expandedReport === report.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </div>
                      
                      {report.ai_summary && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">AI Summary</h4>
                          <p className="text-gray-600 text-sm">{report.ai_summary}</p>
                        </div>
                      )}

                      {report.flagged_values?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-red-700 mb-2">Flagged Values</h4>
                          <div className="flex flex-wrap gap-2">
                            {report.flagged_values.map((value: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.recommendations?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {report.recommendations.map((rec: string, index: number) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Expanded Details with Health Tables */}
                      {expandedReport === report.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Analysis</h4>
                          
                          {/* Health Tables */}
                          {report.health_tables && report.health_tables.length > 0 && (
                            <div className="space-y-6">
                              {report.health_tables.map((table: any, tableIndex: number) => (
                                <div key={tableIndex} className="bg-gray-50 p-4 rounded-lg">
                                  <h5 className="text-md font-medium text-gray-800 mb-3">{table.name}</h5>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          {table.headers.map((header: string, headerIndex: number) => (
                                            <th key={headerIndex} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {table.rows.map((row: any[], rowIndex: number) => (
                                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {row.map((cell: any, cellIndex: number) => (
                                              <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900">
                                                {cell}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Raw Results Data */}
                          {report.results && Object.keys(report.results).length > 0 && (
                            <div className="mt-6">
                              <h5 className="text-md font-medium text-gray-800 mb-3">All Parameters</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(report.results).map(([param, data]: [string, any]) => (
                                  <div key={param} className="bg-gray-50 p-3 rounded">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-gray-700">{param}</span>
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        data.status === 'high' || data.status === 'low' 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {data.status}
                                      </span>
                                    </div>
                                    <div className="mt-1">
                                      <span className="text-lg font-semibold text-gray-900">{data.value}</span>
                                      <span className="text-sm text-gray-500 ml-1">{data.unit}</span>
                                    </div>
                                    {data.normalRange && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Normal: {data.normalRange}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
