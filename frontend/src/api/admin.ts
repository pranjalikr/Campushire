import { apiClient } from './client'
import { Experience } from './experiences'

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminAuthResponse {
  message: string
  admin_id: number
}

export interface ApprovalRequest {
  experience_id: number
  action: 'approve' | 'reject'
  reason?: string
}

export const adminAPI = {
  login: async (data: AdminLoginRequest): Promise<AdminAuthResponse> => {
    // Admin login doesn't require auth token, so use fetch directly to bypass axios interceptor
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    
    console.log('Attempting admin login to:', `${API_BASE_URL}/admin/login`)
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      console.log('Login response status:', response.status, response.statusText)
      
      if (!response.ok) {
        let errorDetail = 'Admin login failed'
        try {
          const errorData = await response.json()
          // Handle FastAPI validation errors (array of error objects)
          if (Array.isArray(errorData.detail)) {
            errorDetail = errorData.detail.map((err: any) => 
              typeof err === 'string' ? err : err.msg || JSON.stringify(err)
            ).join('. ')
          } else if (typeof errorData.detail === 'string') {
            errorDetail = errorData.detail
          } else if (errorData.detail?.msg) {
            errorDetail = errorData.detail.msg
          }
        } catch {
          errorDetail = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorDetail)
      }
      
      return await response.json()
    } catch (error: any) {
      // Log the actual error for debugging
      console.error('Admin login error:', error)
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      
      // Provide immediate error message without blocking health check
      if (error.message && (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('Network'))) {
        throw new Error('Cannot connect to server. Please make sure the backend is running at http://localhost:8000')
      }
      if (error.message) {
        throw error
      }
      throw new Error('Network error: Could not connect to backend server. Make sure backend is running on http://localhost:8000')
    }
  },

  getPendingExperiences: async (): Promise<Experience[]> => {
    const response = await apiClient.get('/admin/experiences/pending')
    return response.data
  },

  approveExperience: async (experienceId: number, reason?: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/admin/experiences/approve', {
      experience_id: experienceId,
      action: 'approve',
      reason,
    })
    return response.data
  },

  rejectExperience: async (experienceId: number, reason?: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/admin/experiences/approve', {
      experience_id: experienceId,
      action: 'reject',
      reason,
    })
    return response.data
  },

  getAllExperiences: async (approvedOnly: boolean = false): Promise<Experience[]> => {
    const response = await apiClient.get('/admin/experiences/all', {
      params: { approved_only: approvedOnly },
    })
    return response.data
  },

  getAuditLogs: async (limit: number = 100): Promise<any[]> => {
    const response = await apiClient.get('/admin/audit-logs', {
      params: { limit },
    })
    return response.data
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await apiClient.get('/admin/users')
    return response.data
  },

  getUserProfile: async (userId: number): Promise<UserProfile> => {
    const response = await apiClient.get(`/admin/users/${userId}`)
    return response.data
  },

  approveUserProfile: async (userId: number, reason?: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/admin/users/approve', {
      user_id: userId,
      action: 'approve',
      reason,
    })
    return response.data
  },

  rejectUserProfile: async (userId: number, reason?: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/admin/users/approve', {
      user_id: userId,
      action: 'reject',
      reason,
    })
    return response.data
  },

  createExperience: async (data: any): Promise<Experience> => {
    const response = await apiClient.post('/admin/experiences/create', data)
    return response.data
  },

  getUserExperiences: async (userId: number): Promise<Experience[]> => {
    const response = await apiClient.get(`/admin/users/${userId}/experiences`)
    return response.data
  },
}

export interface UserProfile {
  user: {
    id: number
    full_name: string
    email: string
    linkedin_id: string | null
    github_id: string | null
    college_name: string | null
    branch: string | null
    profile_completed: boolean
    profile_completion_percentage: number
    created_at: string
  }
  eligibility: {
    eligibility_percentage: number
    score: number
    max_score: number
    status: string
    recommendation: 'approve' | 'reject' | 'review'
    issues: string[]
    strengths: string[]
    experience_count: number
    approved_experience_count: number
  }
  experience_count: number
}
