import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { adminAPI } from '../api/admin'
import { useAuthStore } from '../store/authStore'
import { Shield, Lock, Mail, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { adminLogin } = useAuthStore()

  // Check backend status on page load (non-blocking, with timeout)
  const { data: backendStatus } = useQuery({
    queryKey: ['backend-health'],
    queryFn: async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
        const response = await fetch('http://localhost:8000/health', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        return response.ok
      } catch {
        return false
      }
    },
    refetchInterval: 10000, // Check every 10 seconds (reduced frequency)
    staleTime: 5000, // Consider data stale after 5 seconds
  })

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => adminAPI.login(data),
    onSuccess: (data) => {
      adminLogin(data.admin_id)
      toast.success('Admin login successful!')
      navigate('/admin')
    },
    onError: (error: any) => {
      console.error('Admin login error:', error)
      // Safely extract error message
      let errorMessage = 'Admin login failed'
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message
      } else if (error.response?.data?._extractedMessage) {
        errorMessage = error.response.data._extractedMessage
      } else if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((e: any) => 
            typeof e === 'string' ? e : e.msg || JSON.stringify(e)
          ).join('. ')
        }
      }
      
      // If backend status is green, don't show "not running" error
      if (backendStatus) {
        // Backend is running, so show the actual error
        if (errorMessage.includes('Backend server is not running')) {
          errorMessage = 'Login failed. Check browser console (F12) for details. Backend is running.'
        }
        // Show the actual error message
        toast.error(errorMessage, { duration: 7000 })
      } else {
        // Backend status is red, show not running message
        if (errorMessage.includes('fetch') || errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
          errorMessage = 'Backend server is not running! Please start the backend server first.'
        }
        toast.error(errorMessage, { duration: 5000 })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Access the admin panel to review experiences
            </p>
            {/* Backend Status Indicator */}
            <div className={`mt-4 p-3 rounded-lg flex items-center justify-center space-x-2 ${
              backendStatus 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              {backendStatus ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Backend is running
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Backend is not running
                  </span>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Use the ADMIN_PASSWORD from backend/.env file
              </p>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-primary"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
