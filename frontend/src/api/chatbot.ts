import { apiClient } from './client'

export interface ChatMessage {
  message: string
  conversation_id?: string
}

export interface ChatResponse {
  response: string
  conversation_id: string
}

export const chatbotAPI = {
  chat: async (message: string, conversationId?: string): Promise<ChatResponse> => {
    const response = await apiClient.post('/chatbot/chat', {
      message,
      conversation_id: conversationId,
    })
    return response.data
  },
}
