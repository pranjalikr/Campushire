import { useState, useRef, useEffect } from 'react'
import { Send, X, Bot } from 'lucide-react'
import { chatbotAPI } from '../api/chatbot'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface ChatbotProps {
  selectedRole?: string
}

export default function Chatbot({ selectedRole }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Enhance message with role context if available
    let userMessage = input.trim()
    if (selectedRole) {
      userMessage = `[Role: ${selectedRole}] ${userMessage}`
    }

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: input.trim() }])
    setIsLoading(true)

    try {
      const response = await chatbotAPI.chat(userMessage, conversationId)
      setConversationId(response.conversation_id)
      // Ensure response.response is always a string
      const botResponse = typeof response.response === 'string' 
        ? response.response 
        : String(response.response || 'Sorry, I could not generate a response.')
      setMessages((prev) => [...prev, { role: 'bot', content: botResponse }])
    } catch (error: any) {
      toast.error('Failed to get response from chatbot')
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Campus Interview Assistant
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Ask me anything about campus interviews!</p>
                  {selectedRole && (
                    <p className="text-sm mt-2 text-primary-600 dark:text-primary-400">
                      Focused on: <strong>{selectedRole}</strong> role
                    </p>
                  )}
                  <div className="mt-4 space-y-2 text-left max-w-xs mx-auto">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Try asking:</p>
                    {selectedRole ? (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-500">• "{selectedRole} interview questions"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">• "How to prepare for {selectedRole} role?"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">• "{selectedRole} skills required"</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-500">• "SDE interview questions"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">• "HR interview tips"</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">• "Manager role preparation"</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {typeof msg.content === 'string' ? msg.content : String(msg.content || '')}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about interviews..."
                  className="flex-1 input-field"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-110"
      >
        <Bot className="w-6 h-6" />
      </button>
    </>
  )
}
