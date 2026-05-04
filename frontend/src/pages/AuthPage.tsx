import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Mail, Lock, User, Shield, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

type AuthStep = 'signup' | 'otp-verify' | 'complete-profile' | 'login' | 'forgot-password' | 'reset-password'

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('signup')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [isCompletingProfile, setIsCompletingProfile] = useState(false)
  const [verifiedOTP, setVerifiedOTP] = useState<string>('') // Store verified OTP
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const emailDomains = ['@gmail.com', '@outlook.com', '@yahoo.com', '@hotmail.com']

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.includes('@')) {
      const [localPart, domain] = value.split('@')
      if (domain) {
        const suggestions = emailDomains
          .filter((d) => d.startsWith('@' + domain.toLowerCase()))
          .map((d) => localPart + d)
        setEmailSuggestions(suggestions)
        setShowSuggestions(suggestions.length > 0)
      } else {
        setEmailSuggestions([])
        setShowSuggestions(false)
      }
    } else {
      setEmailSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleEmailSuggestionClick = (suggestion: string) => {
    setEmail(suggestion)
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && emailSuggestions.length > 0 && !email.includes('@')) {
      e.preventDefault()
      handleEmailSuggestionClick(emailSuggestions[0])
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)
    try {
      console.log('Sending signup request for email:', email)
      const response = await authAPI.signup({ full_name: '', email })
      console.log('Signup response:', response)
      setStep('otp-verify')
      toast.success('OTP sent to your email! Check your inbox and spam folder.')
    } catch (error: any) {
      console.error('Signup error:', error)
      // Safely extract error message with better network error handling
      let errorMessage = 'Failed to send OTP. Please check your connection and try again.'
      
      // Check for network errors first
      if (!error.response) {
        // Network error - provide immediate feedback without blocking health check
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          errorMessage = 'Request timed out. The server may be slow or the backend might not be running. Please check if the backend server is running at http://localhost:8000 and try again.'
        } else if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running at http://localhost:8000'
        } else {
          errorMessage = 'Connection failed. Please check if the backend server is running.'
        }
      } else if (error.message && typeof error.message === 'string') {
        // Check if it's a network-related error message
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          errorMessage = 'Request timed out. The server may be slow or unreachable. Please check if the backend is running and try again.'
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch') || error.message.includes('ERR_')) {
          errorMessage = 'Connection issue. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      } else if (error.response?.data?._extractedMessage) {
        errorMessage = error.response.data._extractedMessage
      } else if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((e: any) => 
            typeof e === 'string' ? e : e.msg || JSON.stringify(e)
          ).join('. ')
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '⚠️',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTPOnly = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    
    setIsVerifyingOTP(true)
    try {
      await authAPI.verifyOTPOnly({ email, otp })
      setVerifiedOTP(otp) // Store verified OTP for profile completion
      toast.success('OTP verified! Please complete your profile.')
      setStep('complete-profile')
      setOtp('') // Clear OTP input after verification
    } catch (error: any) {
      // Safely extract error message
      let errorMessage = 'Invalid or expired OTP'
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message
      } else if (error.response?.data?._extractedMessage) {
        errorMessage = error.response.data._extractedMessage
      } else if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((e: any) => 
            typeof e === 'string' ? e : e.msg || JSON.stringify(e)
          ).join('. ')
        }
      }
      toast.error(errorMessage)
    } finally {
      setIsVerifyingOTP(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate full name
    if (!fullName || fullName.trim().length < 2) {
      toast.error('Please enter your full name (at least 2 characters)')
      return
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    // Validate password length
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    setIsCompletingProfile(true)
    try {
      // Backend checks if email was recently verified (within 5 minutes) from verify-otp-only
      // If not, it will require the OTP again. We send the stored OTP as fallback.
      const response = await authAPI.verifyOTP({ 
        email, 
        otp: verifiedOTP || '', // Send stored OTP if available, backend will check recent verification first
        full_name: fullName.trim(),
        password,
        confirm_password: confirmPassword
      })
      setAuth(
        {
          id: response.user_id,
          email: response.email,
          full_name: fullName.trim(),
          profile_completed: response.profile_completed,
        },
        response.access_token
      )
      toast.success(`Welcome, ${fullName.trim()}! Account created successfully!`)
      // Clear welcome flag so it shows on dashboard
      sessionStorage.removeItem('hasSeenWelcome')
      // Clear stored OTP
      setVerifiedOTP('')
      navigate('/dashboard')
    } catch (error: any) {
      // Safely extract error message
      let errorMessage = 'Failed to create account'
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message
      } else if (error.response?.data?._extractedMessage) {
        errorMessage = error.response.data._extractedMessage
      } else if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((e: any) => 
            typeof e === 'string' ? e : e.msg || JSON.stringify(e)
          ).join('. ')
        }
      }
      
      // If OTP expired, go back to OTP verification step
      if (errorMessage.includes('OTP') && errorMessage.includes('expired')) {
        toast.error('OTP verification expired. Please verify your OTP again.')
        setStep('otp-verify')
        setVerifiedOTP('')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsCompletingProfile(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      setAuth(
        {
          id: response.user_id,
          email: response.email,
          full_name: response.full_name || response.email.split('@')[0],
          profile_completed: response.profile_completed,
        },
        response.access_token
      )
      toast.success('Logged in successfully!')
      // Clear welcome flag so it shows on dashboard
      sessionStorage.removeItem('hasSeenWelcome')
      // Navigate to dashboard immediately
      navigate('/dashboard')
    } catch (error: any) {
      // Handle timeout errors first
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Request timed out. The server may be slow or the backend might not be running. Please check if the backend server is running at http://localhost:8000 and try again.')
        setIsLoading(false)
        return
      }
      
      const errorMessage = error.response?.data?.detail || error.message || 'Invalid credentials'
      
      // Provide more helpful error messages
      if (errorMessage.includes('Invalid email or password')) {
        toast.error('Invalid email or password. Please check your credentials and try again.')
      } else if (errorMessage.includes('inactive')) {
        toast.error('Your account is inactive. Please contact support.')
      } else if (error.response?.status === 401) {
        toast.error('Invalid email or password. Please check your credentials.')
      } else if (!error.response || error.response?.status === 0 || error.message?.includes('Network')) {
        // Network error - provide immediate feedback
        toast.error('Cannot connect to server. Please make sure the backend is running at http://localhost:8000')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    try {
      await authAPI.forgotPassword({ email })
      setStep('reset-password')
      toast.success('Password reset OTP sent to your email! Check your inbox, spam folder, and Promotions tab (Gmail).')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to send reset OTP'
      
      // Provide more helpful error messages
      if (errorMessage.includes('SMTP') || errorMessage.includes('email configuration')) {
        toast.error('Email service is not configured. Please contact the administrator.')
      } else if (error.response?.status === 0 || error.message?.includes('Network')) {
        // Check if backend is actually running
        try {
          const healthCheck = await fetch('http://localhost:8000/health', { cache: 'no-cache' })
          if (healthCheck.ok) {
            toast.error('Connection issue. Please refresh the page (Ctrl + Shift + R)')
          } else {
            toast.error('Unable to connect to server. Please check if the backend is running.')
          }
        } catch {
          toast.error('Unable to connect to server. Please check if the backend is running.')
        }
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate OTP
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    // Validate password length
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    try {
      await authAPI.resetPassword({
        email,
        otp,
        new_password: password,
        confirm_password: confirmPassword
      })
      toast.success('Password reset successfully! You can now login with your new password.')
      setStep('login')
      setPassword('')
      setConfirmPassword('')
      setOtp('')
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to reset password'
      
      // Provide more helpful error messages
      if (errorMessage.includes('Invalid or expired OTP')) {
        toast.error('Invalid or expired OTP. Please request a new password reset.')
      } else if (errorMessage.includes('not found')) {
        toast.error('User not found. Please check your email address.')
      } else if (error.response?.status === 0 || error.message?.includes('Network')) {
        // Check if backend is actually running
        try {
          const healthCheck = await fetch('http://localhost:8000/health', { cache: 'no-cache' })
          if (healthCheck.ok) {
            toast.error('Connection issue. Please refresh the page (Ctrl + Shift + R)')
          } else {
            toast.error('Unable to connect to server. Please check if the backend is running.')
          }
        } catch {
          toast.error('Unable to connect to server. Please check if the backend is running.')
        }
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleResendOTP = async () => {
    try {
      await authAPI.resendOTP(email)
      toast.success('OTP resent to your email!')
    } catch (error: any) {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Back Button - Clearly Visible */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-lg hover:shadow-xl border-2 border-primary-200 dark:border-primary-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all"
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-semibold">Back to Home</span>
      </motion.button>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Animated Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col items-center justify-center"
        >
          <div className="relative w-full max-w-md">
            {/* Main Illustration Container */}
            <motion.div
              className="relative bg-gradient-to-br from-primary-500 via-blue-500 to-purple-500 rounded-3xl p-12 shadow-2xl"
              animate={{
                boxShadow: [
                  '0 20px 60px rgba(59, 130, 246, 0.3)',
                  '0 20px 60px rgba(147, 51, 234, 0.4)',
                  '0 20px 60px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {/* Floating Icons */}
              <motion.div
                className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Building2 className="w-10 h-10 text-primary-600" />
              </motion.div>
              
              <motion.div
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -15, 15, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>

              {/* Center Content */}
              <div className="text-center text-white space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Welcome to CampusHire</h2>
                <p className="text-white/90 text-lg">
                  Your gateway to successful career opportunities
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-6"
          >
      <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4"
      >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              CampusHire
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transform placement experiences into interview preparation
          </p>
          </motion.div>

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-primary-200 dark:border-primary-800 shadow-2xl"
          >
          <AnimatePresence mode="wait">
          {step === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSignup}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-3"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign Up</h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                Enter your email to receive an OTP
              </p>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-600" />
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(emailSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="input-field w-full pl-10"
                  placeholder="your.email@example.com"
                />
                </div>
                {showSuggestions && emailSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                    {emailSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleEmailSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Sending OTP...
                  </>
                ) : (
                  <>
                Send OTP to Email
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}

          {/* Step 1: OTP Verification Only */}
          {step === 'otp-verify' && (
            <motion.form
              key="otp-verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTPOnly}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-3"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                  We've sent an OTP to <strong className="text-primary-600 dark:text-primary-400">{email}</strong>
              </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4"
              >
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  📧 Can't find the OTP email?
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                  <li>Check <strong>Spam/Junk</strong> folder</li>
                  <li>Check <strong>Promotions</strong> tab (Gmail)</li>
                  <li>Check <strong>Updates</strong> tab (Gmail)</li>
                  <li>Wait 30-60 seconds for delivery</li>
                  <li>OTP expires in <strong>1 minute</strong></li>
                </ul>
              </motion.div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary-600" />
                  Enter OTP (6 digits)
                </label>
                <motion.div
                  className="flex gap-2 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <motion.input
                      key={index}
                  type="text"
                      maxLength={1}
                      value={otp[index] || ''}
                      onChange={(e) => {
                        const newOtp = otp.split('')
                        newOtp[index] = e.target.value.replace(/\D/g, '')
                        setOtp(newOtp.join('').slice(0, 6))
                        // Auto-focus next input
                        if (e.target.value && index < 5) {
                          const nextInput = (e.target as HTMLInputElement).parentElement?.children[index + 1] as HTMLInputElement
                          nextInput?.focus()
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          const prevInput = (e.target as HTMLInputElement).parentElement?.children[index - 1] as HTMLInputElement
                          prevInput?.focus()
                        }
                      }}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-primary-300 dark:border-primary-700 rounded-lg focus:border-primary-600 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800"
                      whileFocus={{ scale: 1.1, borderColor: '#3b82f6' }}
                    />
                  ))}
                </motion.div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={otp.length !== 6 || isVerifyingOTP}
              >
                {isVerifyingOTP ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify OTP
                  </>
                )}
              </motion.button>
              <button
                type="button"
                onClick={handleResendOTP}
                className="w-full text-sm text-primary-600 hover:text-primary-700"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('signup')
                  setOtp('')
                }}
                className="w-full text-sm text-gray-600 dark:text-gray-400"
              >
                Change email
              </button>
            </motion.form>
          )}

          {/* Step 2: Complete Profile (Full Name, Password) */}
          {step === 'complete-profile' && (
            <motion.form
              key="complete-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleCompleteProfile}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-3"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                  Email <strong className="text-primary-600 dark:text-primary-400">{email}</strong> verified! Please enter your details.
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                    className="input-field w-full pl-10"
                  placeholder="Enter your full name"
                />
              </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-600" />
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pl-10"
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                />
              </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-600" />
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field w-full pl-10"
                  placeholder="Confirm your password"
                  minLength={6}
                />
              </div>
                {password && confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </motion.p>
                )}
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCompletingProfile || !fullName || !password || !confirmPassword}
              >
                {isCompletingProfile ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </motion.button>
              <button
                type="button"
                onClick={() => {
                  setStep('otp-verify')
                  setPassword('')
                  setConfirmPassword('')
                  setFullName('')
                }}
                className="w-full text-sm text-gray-600 dark:text-gray-400"
              >
                ← Back to OTP
              </button>
            </motion.form>
          )}

          {step === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-3"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Login</h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Welcome back! Please login to continue
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-600" />
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full pl-10"
                  placeholder="your.email@example.com"
                />
              </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-600" />
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pl-10"
                  placeholder="Enter your password"
                />
              </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-primary bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                Login
                  </>
                )}
              </motion.button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('forgot-password')
                    setPassword('')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </motion.form>
          )}

          {step === 'forgot-password' && (
            <motion.form
              key="forgot-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleForgotPassword}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
              </div>
              <button type="submit" className="w-full btn-primary">
                Send Reset OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('login')
                  setEmail('')
                }}
                className="w-full text-sm text-gray-600 dark:text-gray-400"
              >
                ← Back to Login
              </button>
            </motion.form>
          )}

          {step === 'reset-password' && (
            <motion.form
              key="reset-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-center">Reset Password</h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                We've sent an OTP to <strong>{email}</strong>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>
              
              <button type="submit" className="w-full btn-primary">
                Reset Password
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                className="w-full text-sm text-primary-600 hover:text-primary-700"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('login')
                  setPassword('')
                  setConfirmPassword('')
                  setOtp('')
                }}
                className="w-full text-sm text-gray-600 dark:text-gray-400"
              >
                ← Back to Login
              </button>
            </motion.form>
          )}
          </AnimatePresence>
          </motion.div>
        </motion.div>
        </div>
    </div>
  )
}
