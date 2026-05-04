import { apiClient } from './client'

export interface CompanySuggestions {
  company_name: string
  interview_questions: string[]
  skills_to_build: string[]
  preparation_tips: string[]
  common_rounds: string[]
  total_experiences: number
}

export const companiesAPI = {
  getSuggestions: async (companyName: string): Promise<CompanySuggestions> => {
    const response = await apiClient.get(`/companies/${encodeURIComponent(companyName)}/suggestions`)
    return response.data
  },
}
