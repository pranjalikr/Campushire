import { apiClient } from './client'

export interface User {
  id: number
  full_name: string
  email: string
  linkedin_id?: string
  github_id?: string
  college_name?: string
  branch?: string
  bio?: string
  package_offered?: number
  questions_asked?: Record<string, string[]>
  profile_completed: boolean
  profile_completion_percentage: number
  created_at: string
}

export interface ProfileUpdateRequest {
  full_name?: string
  linkedin_id?: string
  github_id?: string
  college_name?: string
  branch?: string
  bio?: string
  package_offered?: number
  questions_asked?: Record<string, string[]>
}

export const usersAPI = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/users/me')
    return response.data
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await apiClient.put('/users/me', data)
    return response.data
  },

  getProfileCompletion: async () => {
    const response = await apiClient.get('/users/profile-completion')
    return response.data
  },

  getEligibility: async () => {
    const response = await apiClient.get('/users/eligibility')
    return response.data
  },
}
