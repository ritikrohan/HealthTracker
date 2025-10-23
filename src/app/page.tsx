import Link from 'next/link'
import { Heart, Upload, BarChart3, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HealthTracker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Health
            <span className="text-blue-600"> Tracking</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your health documents and get instant AI analysis, trend tracking, 
            and personalized health insights. Take control of your health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              Start Tracking
            </Link>
            <Link
              href="/auth/signin"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need for health monitoring
          </h2>
          <p className="text-lg text-gray-600">
            Advanced AI technology meets intuitive design
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Upload className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Upload</h3>
            <p className="text-gray-600">
              Upload PDFs and images of your health documents with drag-and-drop simplicity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <BarChart3 className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              Advanced AI extracts and analyzes your health data with medical-grade accuracy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Heart className="h-8 w-8 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Tracking</h3>
            <p className="text-gray-600">
              Visualize your health trends over time with interactive charts and comparisons.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Shield className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your health data is encrypted and stored securely with enterprise-grade security.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to take control of your health?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who are already tracking their health with AI.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="h-8 w-8 text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">
              © 2024 HealthTracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}