'use client'

import { useState, useEffect } from 'react'
import HealthChart from './HealthChart'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

interface HealthDashboardProps {
  reports: any[]
}

export default function HealthDashboard({ reports }: HealthDashboardProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [labStats, setLabStats] = useState<any>({})
  const [trendData, setTrendData] = useState<any[]>([])

  useEffect(() => {
    if (reports && reports.length > 0) {
      processReportsData()
      processLabStats()
      processTrendData()
    }
  }, [reports])

  const processReportsData = () => {
    // Group reports by test name and create time series data
    const groupedReports = reports.reduce((acc, report) => {
      const testName = report.test_name
      if (!acc[testName]) {
        acc[testName] = []
      }
      acc[testName].push({
        date: report.test_date,
        results: report.results,
        testName: report.test_name
      })
      return acc
    }, {})

    // Create chart data for each test
    const charts = Object.entries(groupedReports).map(([testName, testReports]: [string, any]) => {
      const sortedReports = testReports.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      // Extract key metrics for visualization
      const chartData = sortedReports.map((report: any, index: number) => {
        const results = report.results
        const keyMetrics = Object.entries(results).map(([key, value]: [string, any]) => ({
          parameter: key,
          value: typeof value === 'object' ? value.value : value,
          unit: typeof value === 'object' ? value.unit : '',
          status: typeof value === 'object' ? value.status : 'normal'
        }))

        return {
          date: report.date,
          testName: report.test_name,
          metrics: keyMetrics,
          index
        }
      })

      return {
        testName,
        data: chartData,
        latestReport: sortedReports[sortedReports.length - 1]
      }
    })

    setChartData(charts)

    // Calculate summary statistics
    const summaryData = {
      totalTests: reports.length,
      uniqueTestTypes: new Set(reports.map(r => r.test_category)).size,
      flaggedValues: reports.reduce((acc, report) => 
        acc + (report.flagged_values?.length || 0), 0),
      latestTestDate: reports.length > 0 ? 
        new Date(Math.max(...reports.map(r => new Date(r.test_date).getTime()))).toLocaleDateString() : 
        'No tests'
    }

    setSummary(summaryData)
  }

  const processLabStats = () => {
    const labCounts = reports.reduce((acc, report) => {
      if (report.lab_name) {
        acc[report.lab_name] = (acc[report.lab_name] || 0) + 1
      }
      return acc
    }, {})

    const labStats = Object.entries(labCounts).map(([labName, count]) => ({
      labName,
      count,
      percentage: Math.round((count as number / reports.length) * 100)
    })).sort((a, b) => b.count - a.count)

    setLabStats(labStats)
  }

  const processTrendData = () => {
    // Group by test category and create trend data
    const categoryTrends = reports.reduce((acc, report) => {
      const category = report.test_category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        date: report.test_date,
        count: 1,
        flaggedCount: report.flagged_values?.length || 0
      })
      return acc
    }, {})

    const trendData = Object.entries(categoryTrends).map(([category, data]: [string, any]) => {
      const sortedData = data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const totalTests = sortedData.length
      const totalFlagged = sortedData.reduce((sum: number, item: any) => sum + item.flaggedCount, 0)
      
      return {
        category,
        totalTests,
        totalFlagged,
        flaggedPercentage: Math.round((totalFlagged / totalTests) * 100),
        data: sortedData
      }
    })

    setTrendData(trendData)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
      case 'abnormal':
        return 'text-red-600 bg-red-50'
      case 'low':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-green-600 bg-green-50'
    }
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Data</h3>
        <p className="text-gray-500">Upload your first health document to see your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalTests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Minus className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Test Categories</p>
              <p className="text-2xl font-bold text-gray-900">{summary.uniqueTestTypes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Flagged Values</p>
              <p className="text-2xl font-bold text-gray-900">{summary.flaggedValues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Latest Test</p>
              <p className="text-sm font-bold text-gray-900">{summary.latestTestDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Statistics */}
      {labStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labStats.map((lab, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{lab.labName}</p>
                    <p className="text-lg font-bold text-blue-600">{lab.count} tests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{lab.percentage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {trendData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Category Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendData.map((trend, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 capitalize">{trend.category.replace('_', ' ')}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    trend.flaggedPercentage > 30 ? 'bg-red-100 text-red-800' :
                    trend.flaggedPercentage > 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {trend.flaggedPercentage}% flagged
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Tests:</span>
                    <span className="font-medium">{trend.totalTests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Flagged Values:</span>
                    <span className="font-medium text-red-600">{trend.totalFlagged}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.map((chart, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {chart.testName} Trends
            </h3>
            <div className="space-y-4">
              {chart.data.map((dataPoint: any, dataIndex: number) => (
                <div key={dataIndex} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(dataPoint.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      Test #{dataPoint.index + 1}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {dataPoint.metrics.slice(0, 3).map((metric: any, metricIndex: number) => (
                      <div key={metricIndex} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{metric.parameter}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {metric.value} {metric.unit}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                            {metric.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


