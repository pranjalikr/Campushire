import { apiClient } from './client'

export interface Experience {
  id: number
  company_name: string
  role: string
  package_offered?: number
  years_of_experience?: number
  full_name: string
  linkedin_id: string
  github_id: string
  college_name: string
  branch: string
  bio: string
  interview_rounds?: any[]
  questions_asked?: Record<string, string[]>
  preparation_strategy?: string
  resources_followed?: string[]
  rejection_reasons?: string
  final_result: string
  is_anonymous: boolean
  is_approved: boolean
  is_published: boolean
  is_preuploaded?: boolean  // Admin pre-uploaded experiences
  user_id?: number
  user_name?: string
  // User profile information (from user's profile)
  user_email?: string
  user_profile_completed?: boolean
  user_profile_completion_percentage?: number
  // Eligibility information (for admin view)
  user_eligible?: boolean
  user_eligibility_percentage?: number
  user_eligibility_status?: string
  created_at: string
}

export interface ExperienceCreateRequest {
  company_name: string
  role: string
  package_offered?: number
  years_of_experience?: number
  full_name: string  // Required
  linkedin_id: string  // Required
  github_id: string  // Required
  college_name: string  // Required
  branch: string  // Required
  bio: string  // Required
  interview_rounds?: any[]
  questions_asked?: Record<string, string[]>
  preparation_strategy?: string
  resources_followed?: string[]
  rejection_reasons?: string
  final_result: string
  is_anonymous: boolean
}

export const experiencesAPI = {
  getAll: async (company_name?: string, role?: string): Promise<Experience[]> => {
    const params: any = {}
    if (company_name) params.company_name = company_name
    if (role) params.role = role
    const response = await apiClient.get('/experiences/', { params })
    return response.data
  },

  getById: async (id: number): Promise<Experience> => {
    const response = await apiClient.get(`/experiences/${id}`)
    return response.data
  },

  create: async (data: ExperienceCreateRequest): Promise<Experience> => {
    const response = await apiClient.post('/experiences/', data)
    return response.data
  },

  update: async (id: number, data: Partial<ExperienceCreateRequest>): Promise<Experience> => {
    const response = await apiClient.put(`/experiences/${id}`, data)
    return response.data
  },

  getMyExperiences: async (): Promise<Experience[]> => {
    const response = await apiClient.get('/experiences/my-experiences')
    return response.data
  },

  bookmark: async (id: number) => {
    const response = await apiClient.post(`/experiences/${id}/bookmark`)
    return response.data
  },

  removeBookmark: async (id: number) => {
    const response = await apiClient.delete(`/experiences/${id}/bookmark`)
    return response.data
  },

  getBookmarks: async (): Promise<Experience[]> => {
    const response = await apiClient.get('/experiences/bookmarks/all')
    return response.data
  },
}
