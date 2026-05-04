import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: any): State {
    // Helper function to safely extract error message - handles ALL cases
    const extractErrorMessage = (err: any): string => {
      try {
        // If it's a string, return it
        if (typeof err === 'string') {
          return err
        }
        
        // If it's an Error instance, check its message
        if (err instanceof Error) {
          if (typeof err.message === 'string') {
            return err.message
          }
          // If message is an object or array, convert it
          if (err.message) {
            if (Array.isArray(err.message)) {
              return (err.message as any[]).map((e: any) => {
                if (typeof e === 'string') return e
                if (e && typeof e === 'object') {
                  if (e.msg) return String(e.msg)
                  if (e.type && e.loc && e.msg) {
                    return `Validation error: ${String(e.msg)} at ${Array.isArray(e.loc) ? e.loc.join('.') : String(e.loc)}`
                  }
                  try {
                    return JSON.stringify(e)
                  } catch {
                    return String(e)
                  }
                }
                return String(e)
              }).join('. ')
            }
            if (typeof err.message === 'object') {
              const msgObj = err.message as any
              if (msgObj.type && msgObj.loc && msgObj.msg) {
                return `Validation error: ${String(msgObj.msg)} at ${Array.isArray(msgObj.loc) ? msgObj.loc.join('.') : String(msgObj.loc)}`
              }
              try {
                return JSON.stringify(err.message)
              } catch {
                return String(err.message)
              }
            }
          }
        }
        
        // If it's an object with a message property
        if (err && typeof err === 'object') {
          if (err.message) {
            if (typeof err.message === 'string') {
              return err.message
            }
            if (Array.isArray(err.message)) {
              return err.message.map((e: any) => {
                if (typeof e === 'string') return e
                if (e && typeof e === 'object') {
                  if (e.msg) return String(e.msg)
                  if (e.type && e.loc && e.msg) {
                    return `Validation error: ${String(e.msg)} at ${Array.isArray(e.loc) ? e.loc.join('.') : String(e.loc)}`
                  }
                  try {
                    return JSON.stringify(e)
                  } catch {
                    return String(e)
                  }
                }
                return String(e)
              }).join('. ')
            }
            if (typeof err.message === 'object') {
              try {
                return JSON.stringify(err.message)
              } catch {
                return String(err.message)
              }
            }
          }
          
          // Check if it's a FastAPI validation error object directly
          if (err.type && err.loc && err.msg) {
            return `Validation error: ${String(err.msg)} at ${Array.isArray(err.loc) ? err.loc.join('.') : String(err.loc)}`
          }
          
          // If it's an array of validation errors
          if (Array.isArray(err)) {
            return err.map((e: any) => {
              if (typeof e === 'string') return e
              if (e && typeof e === 'object') {
                if (e.msg) return String(e.msg)
                if (e.type && e.loc && e.msg) {
                  return `Validation error: ${String(e.msg)} at ${Array.isArray(e.loc) ? e.loc.join('.') : String(e.loc)}`
                }
                try {
                  return JSON.stringify(e)
                } catch {
                  return String(e)
                }
              }
              return String(e)
            }).join('. ')
          }
          
          // Try to stringify the whole object
          try {
            return JSON.stringify(err)
          } catch {
            return String(err)
          }
        }
        
        // Fallback - convert to string no matter what
        return String(err || 'An unexpected error occurred')
      } catch {
        // Ultimate fallback
        return 'An unexpected error occurred'
      }
    }
    
    // Extract safe error message
    const safeMessage = extractErrorMessage(error)
    
    // Create a proper Error object with the safe message
    const errorToStore = new Error(safeMessage)
    
    // Preserve stack trace if available
    if (error?.stack && typeof error.stack === 'string') {
      errorToStore.stack = error.stack
    }
    
    return { hasError: true, error: errorToStore }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      // Safely extract error message - ensure it's always a string
      let errorMessage = 'An unexpected error occurred'
      if (this.state.error) {
        try {
          if (typeof this.state.error.message === 'string') {
            errorMessage = this.state.error.message
          } else if (this.state.error.message) {
            // If message is an object or array, convert it safely
            if (Array.isArray(this.state.error.message)) {
              errorMessage = (this.state.error.message as any[]).map((e: any) => {
                if (typeof e === 'string') return e
                if (e && typeof e === 'object') {
                  if (e.msg) return String(e.msg)
                  if (e.type && e.loc && e.msg) {
                    return `Validation error: ${String(e.msg)} at ${Array.isArray(e.loc) ? e.loc.join('.') : String(e.loc)}`
                  }
                  try {
                    return JSON.stringify(e)
                  } catch {
                    return String(e)
                  }
                }
                return String(e)
              }).join('. ')
            } else if (typeof this.state.error.message === 'object') {
              try {
                errorMessage = JSON.stringify(this.state.error.message)
              } catch {
                errorMessage = String(this.state.error.message)
              }
            } else {
              errorMessage = String(this.state.error.message)
            }
          }
        } catch {
          errorMessage = 'An unexpected error occurred'
        }
      }

      // Safely extract stack trace - ensure it's always a string
      let stackTrace = ''
      if (this.state.error?.stack) {
        try {
          stackTrace = typeof this.state.error.stack === 'string' 
            ? this.state.error.stack 
            : JSON.stringify(this.state.error.stack, null, 2)
        } catch {
          stackTrace = String(this.state.error.stack || '')
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full card">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="btn-primary"
            >
              Reload Page
            </button>
            {stackTrace && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {stackTrace}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
