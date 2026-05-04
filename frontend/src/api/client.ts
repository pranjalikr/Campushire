import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Helper function to extract error message from FastAPI error response
function extractErrorMessage(error: any): string {
  if (!error.response) {
    return typeof error.message === 'string' ? error.message : String(error.message || 'An unexpected error occurred')
  }

  const { data } = error.response
  
  // Handle FastAPI validation errors (422) - detail is an array of error objects
  if (error.response.status === 422 && Array.isArray(data?.detail)) {
    const messages = data.detail.map((err: any) => {
      if (typeof err === 'string') return err
      if (err && typeof err === 'object') {
        if (err.msg) return String(err.msg)
        if (err.type && err.loc && err.msg) {
          return `Validation error: ${String(err.msg)} at ${Array.isArray(err.loc) ? err.loc.join('.') : String(err.loc)}`
        }
        if (err.message) return String(err.message)
        try {
          return JSON.stringify(err)
        } catch {
          return String(err)
        }
      }
      return String(err)
    })
    return messages.join('. ') || 'Validation error'
  }
  
  // Handle standard error with detail
  if (data?.detail) {
    if (typeof data.detail === 'string') {
      return data.detail
    }
    if (Array.isArray(data.detail)) {
      return data.detail.map((err: any) => {
        if (typeof err === 'string') return err
        if (err && typeof err === 'object') {
          if (err.msg) return String(err.msg)
          if (err.type && err.loc && err.msg) {
            return `Validation error: ${String(err.msg)} at ${Array.isArray(err.loc) ? err.loc.join('.') : String(err.loc)}`
          }
          if (err.message) return String(err.message)
          try {
            return JSON.stringify(err)
          } catch {
            return String(err)
          }
        }
        return String(err)
      }).join('. ')
    }
    // If detail is an object (single validation error)
    if (typeof data.detail === 'object') {
      if (data.detail.msg) return String(data.detail.msg)
      if (data.detail.type && data.detail.loc && data.detail.msg) {
        return `Validation error: ${String(data.detail.msg)} at ${Array.isArray(data.detail.loc) ? data.detail.loc.join('.') : String(data.detail.loc)}`
      }
      if (data.detail.message) return String(data.detail.message)
      try {
        return JSON.stringify(data.detail)
      } catch {
        return String(data.detail)
      }
    }
  }
  
  // Fallback to status text or generic message
  return error.response.statusText || `Error ${error.response.status}` || 'An unexpected error occurred'
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20 second timeout for all requests (email sending can take time)
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from store - ensure we get the latest value
    const authState = useAuthStore.getState()
    const token = authState.token
    
    // Also check localStorage as fallback (in case Zustand persist hasn't synced yet)
    if (!token) {
      try {
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed?.state?.token) {
            config.headers.Authorization = `Bearer ${parsed.state.token}`
            return config
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (backend not reachable)
    if (!error.response) {
      console.error('Network error details:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      })
      
      // Provide immediate error message without blocking health check
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        error.message = 'Request timed out. Please check your connection and try again.'
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        error.message = 'Cannot connect to server. Please make sure the backend is running at http://localhost:8000'
      } else if (!error.message || error.message === 'Network Error') {
        error.message = 'Connection failed. Please check if the backend server is running.'
      }
    }
    
    // Extract and set a proper error message for API errors
    if (error.response) {
      const extractedMessage = extractErrorMessage(error)
      // Ensure extractedMessage is always a string
      const safeMessage = typeof extractedMessage === 'string' ? extractedMessage : String(extractedMessage || 'An unexpected error occurred')
      
      // Create a new Error with the extracted message to ensure it's always a string
      const newError = new Error(safeMessage)
      
      // Preserve original error properties for debugging (but don't include arrays/objects in message)
      ;(newError as any).originalError = error
      ;(newError as any).response = error.response
      ;(newError as any).config = error.config
      
      // Also set it in response.data for easy access
      if (error.response.data) {
        error.response.data._extractedMessage = safeMessage
      }
      
      if (error.response.status === 401) {
        // Only logout if we're not already on the auth page
        // This prevents logout loops when login fails
        const currentPath = window.location.pathname
        if (currentPath !== '/auth' && currentPath !== '/admin/login') {
      useAuthStore.getState().logout()
      window.location.href = '/auth'
    }
      }
      
      return Promise.reject(newError)
    }
    
    return Promise.reject(error)
  }
)
