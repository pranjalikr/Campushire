import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  // Prevent default error handling if it's a React rendering error
  if (event.error && event.error.message && event.error.message.includes('Objects are not valid as a React child')) {
    event.preventDefault()
    console.error('Caught React rendering error - ErrorBoundary should handle this')
  }
})

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // Log error details but don't modify event.reason (it's read-only)
  if (event.reason && typeof event.reason === 'object') {
    try {
      let errorMessage = 'An unexpected error occurred'
      if (Array.isArray(event.reason)) {
        errorMessage = event.reason.map((e: any) => 
          typeof e === 'string' ? e : (e.msg || JSON.stringify(e))
        ).join('. ')
      } else if (event.reason.message) {
        errorMessage = String(event.reason.message)
      } else {
        errorMessage = JSON.stringify(event.reason)
      }
      console.error('Converted error message:', errorMessage)
    } catch {
      console.error('Error converting rejection reason')
    }
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
