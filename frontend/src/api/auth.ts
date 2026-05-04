import { apiClient } from './client'

export interface SignUpRequest {
  full_name: string
  email: string
}

export interface OTPVerifyOnlyRequest {
  email: string
  otp: string
}

export interface OTPVerifyRequest {
  email: string
  otp: string
  full_name: string
  password: string
  confirm_password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user_id: number
  email: string
  full_name?: string
  is_verified: boolean
  profile_completed: boolean
}

export const authAPI = {
  signup: async (data: SignUpRequest) => {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  verifyOTPOnly: async (data: OTPVerifyOnlyRequest) => {
    const response = await apiClient.post('/auth/verify-otp-only', data)
    return response.data
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  resendOTP: async (email: string) => {
    const response = await apiClient.post('/auth/resend-otp', { email })
    return response.data
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await apiClient.post('/auth/forgot-password', data)
    return response.data
  },

  resetPassword: async (data: {
    email: string
    otp: string
    new_password: string
    confirm_password: string
  }) => {
    const response = await apiClient.post('/auth/reset-password', data)
    return response.data
  },
}
