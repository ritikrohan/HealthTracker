'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react'

interface ReportComparisonProps {
  reportId: string
}

export default function ReportComparison({ reportId }: ReportComparisonProps) {
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComparison()
  }, [reportId])

  const fetchComparison = async () => {
    try {
      const response = await fetch(`/api/comparisons?testName=${reportId}`)
      const data = await response.json()
      
      if (response.ok) {
        setComparison(data.comparisons[0] || null)
      } else {
        setError('Failed to fetch comparison data')
      }
    } catch (err) {
      setError('Failed to fetch comparison data')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50'
      case 'declining':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'significant':
        return 'text-red-600 bg-red-50'
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-green-600 bg-green-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center text-gray-500">
          <Minus className="h-8 w-8 mx-auto mb-2" />
          <p>No previous test data available for comparison</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Test Comparison: {comparison.test_name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Current Test</h4>
            <p className="text-sm text-gray-900">
              {new Date(comparison.current_report.test_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Previous Test</h4>
            <p className="text-sm text-gray-900">
              {new Date(comparison.previous_report.test_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Trends Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Trends Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(comparison.trends).map(([parameter, trend]: [string, any]) => (
            <div key={parameter} className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm font-medium text-gray-900">{parameter}</span>
              <div className="flex items-center space-x-2">
                {getTrendIcon(trend)}
                <span className={`px-2 py-1 rounded-full text-xs ${getTrendColor(trend)}`}>
                  {trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Detailed Comparison</h4>
        <div className="space-y-4">
          {Object.entries(comparison.comparison_data).map(([parameter, data]: [string, any]) => (
            <div key={parameter} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-gray-900">{parameter}</h5>
                <span className={`px-2 py-1 rounded-full text-xs ${getSignificanceColor(data.significance)}`}>
                  {data.significance}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Previous</p>
                  <p className="font-medium">{data.previous}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="font-medium">{data.current}</p>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Change:</span>
                  <span className={`font-medium ${
                    data.change > 0 ? 'text-red-600' : data.change < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {data.change > 0 ? '+' : ''}{data.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      {comparison.current_report.ai_summary && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
            AI Health Summary
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {comparison.current_report.ai_summary}
          </p>
        </div>
      )}
    </div>
  )
}


