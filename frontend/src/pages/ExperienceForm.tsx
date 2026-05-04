import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { experiencesAPI, ExperienceCreateRequest } from '../api/experiences'
import { adminAPI } from '../api/admin'
import { usersAPI } from '../api/users'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Plus, X, Save, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

const STEPS = ['Personal Info & Company', 'Interview Details', 'Questions & Strategy', 'Result & Review']

interface ExperienceFormProps {
  isAdmin?: boolean
}

export default function ExperienceForm({ isAdmin = false }: ExperienceFormProps = {}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ExperienceCreateRequest>({
    company_name: '',
    role: '',
    package_offered: undefined,
    years_of_experience: undefined,
    full_name: '',  // Required
    linkedin_id: '',  // Required
    github_id: '',  // Required
    college_name: '',  // Required
    branch: '',  // Required
    bio: '',  // Required
    interview_rounds: [],
    questions_asked: {
      DSA: [],
      Technical: [],
      HR: [],
      Managerial: [],
      'System Design': [],
      Database: [],
      OOP: [],
      'Web Development': [],
      'Mobile Development': [],
      'Data Structures': [],
      Algorithms: [],
      'Operating Systems': [],
      Networking: [],
    },
    preparation_strategy: '',
    resources_followed: [],
    rejection_reasons: '',
    final_result: 'Selected',
    is_anonymous: false,
  })
  const [newResource, setNewResource] = useState('')
  const [newRound, setNewRound] = useState({
    round_type: '',
    questions: [] as string[],
    difficulty: '',
  })
  const [newQuestion, setNewQuestion] = useState({ category: 'DSA', question: '', answer: '' })
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const hasShownNetworkErrorRef = React.useRef(false)
  const retryTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestFormDataRef = React.useRef<Partial<ExperienceCreateRequest>>(formData)
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, Record<number, { question: string; answer: string }>>>({})
  
  // Keep latest formData in ref for retry mechanism
  React.useEffect(() => {
    latestFormDataRef.current = formData
  }, [formData])

  const { data: existingExperience } = useQuery({
    queryKey: ['experience', id],
    queryFn: () => experiencesAPI.getById(Number(id)),
    enabled: !!id,
  })

  // Load user profile to auto-populate form fields for new experiences
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => usersAPI.getMe(),
    enabled: !id && !isAdmin, // Only load for new experiences (not editing, not admin)
    retry: 1,
  })

  // Check user eligibility for submitting experiences
  const { data: eligibility, isLoading: eligibilityLoading } = useQuery({
    queryKey: ['user-eligibility'],
    queryFn: () => usersAPI.getEligibility(),
    enabled: !id && !isAdmin, // Only check for new experiences (not editing, not admin)
    retry: 1,
  })

  // Auto-populate form from user profile when creating new experience
  React.useEffect(() => {
    if (!id && !isAdmin && userProfile && !existingExperience) {
      // Only auto-populate if fields are empty
      setFormData(prev => ({
        ...prev,
        full_name: prev.full_name || userProfile.full_name || '',
        linkedin_id: prev.linkedin_id || userProfile.linkedin_id || '',
        github_id: prev.github_id || userProfile.github_id || '',
        college_name: prev.college_name || userProfile.college_name || '',
        branch: prev.branch || userProfile.branch || '',
        bio: prev.bio || userProfile.bio || '',
      }))
    }
  }, [userProfile, id, isAdmin, existingExperience])

  // Update form data when experience is loaded
  React.useEffect(() => {
    if (existingExperience) {
      const loadedQuestions = existingExperience.questions_asked || {}
      setFormData({
        company_name: existingExperience.company_name,
        role: existingExperience.role,
        package_offered: existingExperience.package_offered,
        years_of_experience: existingExperience.years_of_experience,
        full_name: existingExperience.full_name || '',
        linkedin_id: existingExperience.linkedin_id || '',
        github_id: existingExperience.github_id || '',
        college_name: existingExperience.college_name || '',
        branch: existingExperience.branch || '',
        bio: existingExperience.bio || '',
        interview_rounds: existingExperience.interview_rounds || [],
        questions_asked: {
          DSA: [],
          Technical: [],
          HR: [],
          Managerial: [],
          'System Design': [],
          Database: [],
          OOP: [],
          'Web Development': [],
          'Mobile Development': [],
          'Data Structures': [],
          Algorithms: [],
          'Operating Systems': [],
          Networking: [],
          ...loadedQuestions,
        },
        preparation_strategy: existingExperience.preparation_strategy || '',
        resources_followed: existingExperience.resources_followed || [],
        rejection_reasons: existingExperience.rejection_reasons || '',
        final_result: existingExperience.final_result,
        is_anonymous: existingExperience.is_anonymous,
      })
      
      // Convert old format (string[]) to new format (question-answer pairs)
      const qaPairs: Record<string, Record<number, { question: string; answer: string }>> = {}
      Object.entries(loadedQuestions).forEach(([category, questions]) => {
        if (Array.isArray(questions)) {
          qaPairs[category] = {}
          questions.forEach((q, idx) => {
            try {
              // Try to parse as JSON (new format)
              const parsed = typeof q === 'string' ? JSON.parse(q) : q
              if (parsed && typeof parsed === 'object' && 'question' in parsed) {
                qaPairs[category][idx] = {
                  question: parsed.question || '',
                  answer: parsed.answer || '',
                }
              } else {
                // Old format - just a string
                qaPairs[category][idx] = { question: String(q), answer: '' }
              }
            } catch {
              // Not JSON, treat as old format string
              qaPairs[category][idx] = { question: String(q), answer: '' }
            }
          })
        }
      })
      setQuestionAnswers(qaPairs)
      
      // Also update formData to use new format
      const updatedQuestions: Record<string, string[]> = {}
      Object.entries(qaPairs).forEach(([category, qas]) => {
        updatedQuestions[category] = Object.values(qas).map(qa => JSON.stringify(qa))
      })
      setFormData(prev => ({
        ...prev,
        questions_asked: {
          ...prev.questions_asked,
          ...updatedQuestions,
        },
      }))
    }
  }, [existingExperience])

  // Helper to safely extract error messages
  const extractErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error
    if (error?.message && typeof error.message === 'string') return error.message
    if (error?.response?.data?._extractedMessage) return error.response.data._extractedMessage
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) {
        return detail.map((e: any) => 
          typeof e === 'string' ? e : (e.msg || JSON.stringify(e))
        ).join('. ')
      }
      if (typeof detail === 'object' && detail !== null) {
        if ('msg' in detail) return (detail as any).msg
        if ('type' in detail && 'loc' in detail && 'msg' in detail) {
          return `Validation error: ${(detail as any).msg} at ${Array.isArray((detail as any).loc) ? (detail as any).loc.join('.') : (detail as any).loc}`
        }
      }
    }
    return 'An unexpected error occurred'
  }

  const createMutation = useMutation({
    mutationFn: (data: ExperienceCreateRequest) => {
      if (isAdmin) {
        return adminAPI.createExperience(data)
      }
      return experiencesAPI.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pending-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-experiences'] })
      if (isAdmin) {
        toast.success('Experience created and published successfully!')
        // Reset form for admin
        setFormData({
          company_name: '',
          role: '',
          package_offered: undefined,
          years_of_experience: undefined,
          full_name: '',
          linkedin_id: '',
          github_id: '',
          college_name: '',
          branch: '',
          bio: '',
          interview_rounds: [],
          questions_asked: {
            DSA: [],
            Technical: [],
            HR: [],
            Managerial: [],
            'System Design': [],
            Database: [],
            OOP: [],
            'Web Development': [],
            'Mobile Development': [],
            'Data Structures': [],
            Algorithms: [],
            'Operating Systems': [],
            Networking: [],
          },
          preparation_strategy: '',
          resources_followed: [],
          rejection_reasons: '',
          final_result: 'Selected',
          is_anonymous: false,
        })
        setCurrentStep(0)
      } else {
        toast.success('Experience submitted successfully! It will be reviewed by an admin.')
        // Always update user profile with the information provided in the experience form
        // The experience form is the primary way to update profile information
        usersAPI.updateProfile({
          full_name: formData.full_name || undefined,
          linkedin_id: formData.linkedin_id || undefined,
          github_id: formData.github_id || undefined,
          college_name: formData.college_name || undefined,
          branch: formData.branch || undefined,
          bio: formData.bio || undefined,
        }).then(() => {
          // Invalidate profile queries to refresh eligibility
          queryClient.invalidateQueries({ queryKey: ['user-profile'] })
          queryClient.invalidateQueries({ queryKey: ['user-eligibility'] })
        }).catch(() => {
          // Silently fail - profile update error shouldn't block experience submission
        })
        navigate('/dashboard')
      }
    },
    onError: (error: any) => {
      // Handle eligibility errors with detailed messages
      if (error?.response?.status === 403 && error?.response?.data?.detail) {
        const detail = error.response.data.detail
        if (typeof detail === 'object' && detail.message) {
          // Detailed eligibility error
          let errorMsg = detail.message
          if (detail.issues && Array.isArray(detail.issues)) {
            errorMsg += '\n' + detail.issues.join('\n')
          }
          toast.error(errorMsg, { duration: 10000 })
          
          // Suggest completing profile information in the experience form
          if (detail.eligibility_percentage !== undefined && detail.eligibility_percentage < 60) {
            setTimeout(() => {
              toast.info('Please fill in all required profile information (College, Branch, LinkedIn, GitHub) in the experience form to improve your eligibility.', { duration: 8000 })
            }, 2000)
          }
          return
        }
      }
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ExperienceCreateRequest>) =>
      experiencesAPI.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
      toast.success('Experience updated successfully!')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error)
      toast.error(errorMessage)
    },
  })

  const handleSubmit = () => {
    // Validate required personal information fields
    if (!formData.full_name?.trim()) {
      toast.error('Full Name is required')
      setCurrentStep(0)
      return
    }
    if (!formData.linkedin_id?.trim()) {
      toast.error('LinkedIn ID is required')
      setCurrentStep(0)
      return
    }
    if (!formData.github_id?.trim()) {
      toast.error('GitHub ID is required')
      setCurrentStep(0)
      return
    }
    if (!formData.college_name?.trim()) {
      toast.error('College Name is required')
      setCurrentStep(0)
      return
    }
    if (!formData.branch?.trim()) {
      toast.error('Branch is required')
      setCurrentStep(0)
      return
    }
    if (!formData.bio?.trim()) {
      toast.error('Bio/About Me is required')
      setCurrentStep(0)
      return
    }
    if (!formData.company_name?.trim()) {
      toast.error('Company Name is required')
      setCurrentStep(0)
      return
    }
    if (!formData.role?.trim()) {
      toast.error('Role is required')
      setCurrentStep(0)
      return
    }
    
    if (id) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const addResource = () => {
    if (newResource.trim()) {
      setFormData({
        ...formData,
        resources_followed: [...(formData.resources_followed || []), newResource.trim()],
      })
      setNewResource('')
    }
  }

  const removeResource = (index: number) => {
    setFormData({
      ...formData,
      resources_followed: formData.resources_followed?.filter((_, i) => i !== index) || [],
    })
  }

  const addRound = () => {
    if (newRound.round_type) {
      const roundNumber = (formData.interview_rounds?.length || 0) + 1
      setFormData({
        ...formData,
        interview_rounds: [...(formData.interview_rounds || []), { 
          round_name: `Round ${roundNumber}`,
          ...newRound 
        }],
      })
      setNewRound({ round_type: '', questions: [], difficulty: '' })
    }
  }

  // Auto-save functionality with debouncing
  const autoSaveMutation = useMutation({
    mutationFn: (data: Partial<ExperienceCreateRequest>) => {
      if (!id) {
        throw new Error('Cannot auto-save: no experience ID')
      }
      return experiencesAPI.update(Number(id), data)
    },
    onSuccess: () => {
      setAutoSaveStatus('saved')
      hasShownNetworkErrorRef.current = false // Reset error flag on success
      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      queryClient.invalidateQueries({ queryKey: ['experience', id] })
    },
    onError: (error: any) => {
      setAutoSaveStatus('unsaved')
      const errorMessage = extractErrorMessage(error)
      
      // Check if it's an "approved experience" error - don't show notification, just mark as saved
      // This is expected behavior since approved experiences cannot be edited
      if (errorMessage.includes('Cannot update approved experience') || 
          errorMessage.includes('approved experience') ||
          errorMessage.includes('approved') && errorMessage.includes('update')) {
        setAutoSaveStatus('saved')
        // Don't show error for approved experiences - this is expected behavior
        return
      }
      
      // Only show error notification once per session to prevent spam
      // Check if it's a network error
      const isNetworkError = errorMessage.includes('Network') || 
                            errorMessage.includes('Failed to fetch') || 
                            errorMessage.includes('connection') ||
                            errorMessage.includes('ECONNREFUSED') ||
                            !error?.response
      
      // Use ref to check synchronously and prevent race conditions
      if (isNetworkError) {
        if (!hasShownNetworkErrorRef.current) {
          hasShownNetworkErrorRef.current = true
          // Dismiss any existing auto-save error toasts first
          toast.dismiss('auto-save-network-error')
          toast.error(
            `Auto-save failed: Network Error. Your internet connection may be unstable. Please wait a few seconds and continue typing—auto-save will retry automatically once the connection is restored. Avoid refreshing or closing the page.`,
            {
              id: 'auto-save-network-error', // Use same ID to prevent duplicates
              duration: 10000, // Longer duration so user can read the full message
            }
          )
          
          // Set up automatic retry mechanism - retry every 10 seconds
          const scheduleRetry = () => {
            // Clear any existing retry timeout
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current)
            }
            
            retryTimeoutRef.current = setTimeout(() => {
              // Use latest formData from ref to ensure we have current data
              const currentFormData = latestFormDataRef.current
              
              // Check if we still have form data and experience ID
              if (id && currentFormData.company_name && currentFormData.role) {
                // Check if experience is still not approved (re-fetch might have updated it)
                const checkAndRetry = async () => {
                  try {
                    const exp = await experiencesAPI.getById(Number(id))
                    if (exp.is_approved) {
                      // Experience was approved, stop retrying
                      hasShownNetworkErrorRef.current = false
                      if (retryTimeoutRef.current) {
                        clearTimeout(retryTimeoutRef.current)
                        retryTimeoutRef.current = null
                      }
                      return
                    }
                    
                    // Attempt to retry auto-save with latest data
                    autoSaveMutation.mutate(currentFormData, {
                      onSuccess: () => {
                        // Connection restored! Reset error flag and clear retry
                        hasShownNetworkErrorRef.current = false
                        if (retryTimeoutRef.current) {
                          clearTimeout(retryTimeoutRef.current)
                          retryTimeoutRef.current = null
                        }
                        toast.dismiss('auto-save-network-error')
                        toast.success('Connection restored! Your changes have been saved.', {
                          duration: 3000,
                        })
                      },
                      onError: (retryError: any) => {
                        // Still failing, check if it's still a network error
                        const retryErrorMessage = typeof retryError === 'string' 
                          ? retryError 
                          : retryError?.message || 'Network Error'
                        const isStillNetworkError = retryErrorMessage.includes('Network') || 
                                                  retryErrorMessage.includes('Failed to fetch') || 
                                                  retryErrorMessage.includes('connection') ||
                                                  retryErrorMessage.includes('ECONNREFUSED') ||
                                                  !retryError?.response
                        
                        if (isStillNetworkError) {
                          // Still a network error, schedule another retry
                          scheduleRetry()
                        } else {
                          // Different error, stop retrying
                          hasShownNetworkErrorRef.current = false
                          if (retryTimeoutRef.current) {
                            clearTimeout(retryTimeoutRef.current)
                            retryTimeoutRef.current = null
                          }
                        }
                      },
                    })
                  } catch (err) {
                    // If we can't even check the experience, it's still a network error
                    scheduleRetry()
                  }
                }
                
                checkAndRetry()
              } else {
                // No valid form data, stop retrying
                hasShownNetworkErrorRef.current = false
                if (retryTimeoutRef.current) {
                  clearTimeout(retryTimeoutRef.current)
                  retryTimeoutRef.current = null
                }
              }
            }, 10000) // Retry every 10 seconds
          }
          
          // Start the retry mechanism
          scheduleRetry()
        }
        // Don't show additional network error toasts
        return
      }
      
      // For non-network errors, show once per unique error
      const errorId = `auto-save-error-${errorMessage.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '-')}`
      toast.dismiss(errorId) // Dismiss any existing toast with this ID
      toast.error(`Auto-save failed: ${errorMessage}`, {
        id: errorId,
        duration: 4000,
      })
    },
  })

  // Debounced auto-save with network error prevention
  const debouncedAutoSave = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      let isSaving = false
      return (data: Partial<ExperienceCreateRequest>) => {
        // Don't attempt auto-save if we've shown a network error
        if (hasShownNetworkErrorRef.current) {
          return
        }
        // Don't attempt auto-save if experience is approved
        if (existingExperience?.is_approved) {
          setAutoSaveStatus('saved')
          return
        }
        if (timeoutId) clearTimeout(timeoutId)
        // Don't set unsaved if we're already saving to prevent status flicker
        if (!isSaving) {
          setAutoSaveStatus('unsaved')
        }
        timeoutId = setTimeout(() => {
          if (id && !hasShownNetworkErrorRef.current && !isSaving && !existingExperience?.is_approved) {
            isSaving = true
            setAutoSaveStatus('saving')
            autoSaveMutation.mutate(data, {
              onSettled: () => {
                isSaving = false
              }
            })
          }
        }, 2000) // Auto-save after 2 seconds of inactivity
      }
    })(),
    [id, autoSaveMutation, existingExperience]
  )

  // Auto-save when form data changes (only for editing)
  // Skip auto-save on initial load, if there's a persistent network error, or if experience is approved
  useEffect(() => {
    // Only auto-save if we have an ID (editing existing experience) and experience is loaded
    // Skip if experience is approved (cannot update approved experiences)
    // Skip if we've shown a network error (to prevent spam - retry mechanism handles retries)
    if (id && existingExperience && formData.company_name && formData.role) {
      // Don't auto-save if experience is approved
      if (existingExperience.is_approved) {
        setAutoSaveStatus('saved') // Show as saved since it's approved
        return
      }
      // If we've shown a network error, don't auto-save immediately
      // The retry mechanism will handle automatic retries
      // But if user continues typing and connection is restored, allow normal auto-save
      if (!hasShownNetworkErrorRef.current) {
        debouncedAutoSave(formData)
      }
    }
  }, [formData, id, debouncedAutoSave, existingExperience])
  
  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const addQuestion = () => {
    // Validate question is not empty
    const trimmedQuestion = newQuestion.question.trim()
    if (!trimmedQuestion) {
      toast.error('Question cannot be empty')
      return
    }
    
    // Validate question length (minimum 5 characters, maximum 500)
    if (trimmedQuestion.length < 5) {
      toast.error('Question must be at least 5 characters long')
      return
    }
    if (trimmedQuestion.length > 500) {
      toast.error('Question must be less than 500 characters')
      return
    }
    
    // Validate answer if provided (maximum 2000 characters)
    const trimmedAnswer = newQuestion.answer.trim()
    if (trimmedAnswer && trimmedAnswer.length > 2000) {
      toast.error('Answer must be less than 2000 characters')
      return
    }
    
    const category = newQuestion.category
    const currentQAs = questionAnswers[category] || {}
    const nextIndex = Object.keys(currentQAs).length
    
    // Add to question-answer pairs
    setQuestionAnswers({
      ...questionAnswers,
      [category]: {
        ...currentQAs,
        [nextIndex]: {
          question: trimmedQuestion,
          answer: trimmedAnswer,
        },
      },
    })
    
    // Update formData for submission (convert to array format for backend compatibility)
    const categoryQuestions = formData.questions_asked?.[category] || []
    setFormData({
      ...formData,
      questions_asked: {
        ...formData.questions_asked,
        [category]: [
          ...categoryQuestions,
          JSON.stringify({ question: trimmedQuestion, answer: trimmedAnswer }),
        ],
      },
    })
    
    setNewQuestion({ category: 'DSA', question: '', answer: '' })
    setAutoSaveStatus('unsaved')
    toast.success('Question added successfully')
  }

  const updateQuestionAnswer = (category: string, index: number, field: 'question' | 'answer', value: string) => {
    const currentQAs = questionAnswers[category] || {}
    
    // Validate question field
    if (field === 'question') {
      const trimmed = value.trim()
      if (!trimmed) {
        toast.error('Question cannot be empty')
        return
      }
      if (trimmed.length < 5) {
        toast.error('Question must be at least 5 characters long')
        return
      }
      if (trimmed.length > 500) {
        toast.error('Question must be less than 500 characters')
        return
      }
    }
    
    // Validate answer field
    if (field === 'answer') {
      const trimmed = value.trim()
      if (trimmed && trimmed.length > 2000) {
        toast.error('Answer must be less than 2000 characters')
        return
      }
    }
    
    const updatedQAs = {
      ...questionAnswers,
      [category]: {
        ...currentQAs,
        [index]: {
          ...currentQAs[index],
          [field]: field === 'question' ? value.trim() : value,
        },
      },
    }
    setQuestionAnswers(updatedQAs)
    
    // Update formData
    const categoryQuestions = formData.questions_asked?.[category] || []
    const updatedQuestions = [...categoryQuestions]
    updatedQuestions[index] = JSON.stringify({
      question: updatedQAs[category][index].question.trim(),
      answer: updatedQAs[category][index].answer.trim(),
    })
    
    setFormData({
      ...formData,
      questions_asked: {
        ...formData.questions_asked,
        [category]: updatedQuestions,
      },
    })
    setAutoSaveStatus('unsaved')
  }

  const removeQuestion = (category: string, index: number) => {
    const currentQAs = questionAnswers[category] || {}
    const updatedQAs = { ...currentQAs }
    delete updatedQAs[index]
    
    // Reindex
    const reindexed: Record<number, { question: string; answer: string }> = {}
    Object.values(updatedQAs).forEach((qa, idx) => {
      reindexed[idx] = qa
    })
    
    setQuestionAnswers({
      ...questionAnswers,
      [category]: reindexed,
    })
    
    // Update formData
    const updatedQuestions = Object.values(reindexed).map(qa => JSON.stringify(qa))
    setFormData({
      ...formData,
      questions_asked: {
        ...formData.questions_asked,
        [category]: updatedQuestions,
      },
    })
    setAutoSaveStatus('unsaved')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {id ? 'Edit Experience' : 'Share Interview Experience'}
      </h1>


      {/* Auto-save Info Banner */}
      {id && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-3">
            <Save className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                Auto-save is enabled
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Your responses are automatically saved as you fill the form to prevent data loss. 
                If you see an "Auto-save failed: Network Error" message, it usually means your internet connection was unstable or temporarily lost. 
                Please wait a few seconds and continue typing—auto-save will retry automatically once the connection is restored. 
                Avoid refreshing or closing the page until the message disappears. 
                If the issue persists, check your internet connection or manually click Next to ensure your data is saved successfully.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="card">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Personal Information & Company Details</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please fill in your personal information (all fields are required)
              </p>
              
              {/* Personal Information Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-primary-600 dark:text-primary-400">
                  Personal Information *
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      LinkedIn ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.linkedin_id}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin_id: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., john-doe or in/johndoe"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your LinkedIn profile identifier
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      GitHub ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.github_id}
                      onChange={(e) =>
                        setFormData({ ...formData, github_id: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., johndoe"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your GitHub username
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      College Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.college_name}
                      onChange={(e) =>
                        setFormData({ ...formData, college_name: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., MIT, Stanford University, IIT Delhi"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.branch}
                      onChange={(e) =>
                        setFormData({ ...formData, branch: e.target.value })
                      }
                      className="input-field"
                      placeholder="e.g., Computer Science, Electrical Engineering"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      About Me / Bio <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      className="input-field h-32 resize-y"
                      placeholder="Write about yourself, your skills, achievements, and career goals..."
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tell us about yourself - this helps others know more about you
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Company Information Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-4 text-primary-600 dark:text-primary-400">
                  Company & Role Information *
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({ ...formData, company_name: e.target.value })
                      }
                      className="input-field"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Software Engineer, Data Scientist"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Package Offered (LPA)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.package_offered || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          package_offered: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="input-field"
                      placeholder="e.g., 12.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Years of Experience</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.years_of_experience || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          years_of_experience: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="input-field"
                      placeholder="e.g., 2.5"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.is_anonymous}
                      onChange={(e) =>
                        setFormData({ ...formData, is_anonymous: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-600"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm">
                      Submit anonymously
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Interview Rounds</h2>
              <div className="space-y-4">
                <div>
                  <select
                    value={newRound.round_type}
                    onChange={(e) =>
                      setNewRound({ ...newRound, round_type: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="">Select Type</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Managerial">Managerial</option>
                    <option value="DSA">DSA</option>
                  </select>
                </div>
                <button type="button" onClick={addRound} className="btn-secondary">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Round
                </button>
                {formData.interview_rounds?.map((round, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <strong>Round {idx + 1}</strong> - {round.round_type}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            interview_rounds: formData.interview_rounds?.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Questions & Preparation</h2>
                {id && (
                  <div className="flex items-center gap-2 text-sm">
                    {autoSaveStatus === 'saving' && (
                      <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Save className="w-4 h-4 animate-spin" />
                        Saving...
                      </span>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Save className="w-4 h-4" />
                        Saved
                      </span>
                    )}
                    {autoSaveStatus === 'unsaved' && (
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Save className="w-4 h-4" />
                        Unsaved changes
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Add Question & Answer</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={newQuestion.category}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, category: e.target.value })
                      }
                      className="input-field w-40"
                    >
                      <option value="DSA">DSA</option>
                      <option value="Technical">Technical</option>
                      <option value="HR">HR</option>
                      <option value="Managerial">Managerial</option>
                      <option value="System Design">System Design</option>
                      <option value="Database">Database</option>
                      <option value="OOP">OOP</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Structures">Data Structures</option>
                      <option value="Algorithms">Algorithms</option>
                      <option value="Operating Systems">Operating Systems</option>
                      <option value="Networking">Networking</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Enter question"
                      value={newQuestion.question}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, question: e.target.value })
                      }
                      className="input-field flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                    />
                    <button type="button" onClick={addQuestion} className="btn-secondary">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Enter answer (optional)"
                    value={newQuestion.answer}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, answer: e.target.value })
                    }
                    className="input-field h-20"
                  />
                </div>
              </div>
              
              {/* Display Questions with Answers */}
              <div className="space-y-4">
                {Object.entries(questionAnswers).map(([category, qas]) => {
                  const questions = Object.entries(qas)
                  if (questions.length === 0) return null
                  
                  return (
                    <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 text-primary-600 dark:text-primary-400">
                        {category} ({questions.length})
                      </h3>
                      <div className="space-y-4">
                        {questions.map(([indexStr, qa]) => {
                          const index = parseInt(indexStr)
                          return (
                            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                                      Question {index + 1}:
                                    </label>
                                    <input
                                      type="text"
                                      value={qa.question}
                                      onChange={(e) => updateQuestionAnswer(category, index, 'question', e.target.value)}
                                      className="input-field text-sm"
                                      placeholder="Enter question"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                                      Answer:
                                    </label>
                                    <textarea
                                      value={qa.answer}
                                      onChange={(e) => updateQuestionAnswer(category, index, 'answer', e.target.value)}
                                      className="input-field text-sm h-24"
                                      placeholder="Enter your answer..."
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(category, index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preparation Strategy</label>
                <textarea
                  value={formData.preparation_strategy}
                  onChange={(e) =>
                    setFormData({ ...formData, preparation_strategy: e.target.value })
                  }
                  className="input-field h-32"
                  placeholder="Describe your preparation strategy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Resources Followed</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g., LeetCode, GeeksforGeeks"
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={addResource} className="btn-secondary">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.resources_followed?.map((resource, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                    >
                      {resource}
                      <button
                        type="button"
                        onClick={() => removeResource(idx)}
                        className="ml-2 hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Final Result</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Result *</label>
                <select
                  value={formData.final_result}
                  onChange={(e) =>
                    setFormData({ ...formData, final_result: e.target.value as 'Selected' | 'Rejected' })
                  }
                  className="input-field"
                >
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              {formData.final_result === 'Rejected' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Rejection Reasons</label>
                  <textarea
                    value={formData.rejection_reasons}
                    onChange={(e) =>
                      setFormData({ ...formData, rejection_reasons: e.target.value })
                    }
                    className="input-field h-32"
                    placeholder="If rejected, please share reasons..."
                  />
                </div>
              )}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Review Your Submission</h3>
                <p>
                  <strong>Company:</strong> {formData.company_name}
                </p>
                <p>
                  <strong>Role:</strong> {formData.role}
                </p>
                <p>
                  <strong>Result:</strong> {formData.final_result}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 inline mr-2" />
            Previous
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                // Validate step 0 (Personal Info & Company) before proceeding
                if (currentStep === 0) {
                  if (!formData.full_name?.trim()) {
                    toast.error('Full Name is required')
                    return
                  }
                  if (!formData.linkedin_id?.trim()) {
                    toast.error('LinkedIn ID is required')
                    return
                  }
                  if (!formData.github_id?.trim()) {
                    toast.error('GitHub ID is required')
                    return
                  }
                  if (!formData.college_name?.trim()) {
                    toast.error('College Name is required')
                    return
                  }
                  if (!formData.branch?.trim()) {
                    toast.error('Branch is required')
                    return
                  }
                  if (!formData.bio?.trim()) {
                    toast.error('Bio/About Me is required')
                    return
                  }
                  if (!formData.company_name?.trim()) {
                    toast.error('Company Name is required')
                    return
                  }
                  if (!formData.role?.trim()) {
                    toast.error('Role is required')
                    return
                  }
                }
                setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))
              }}
              className="btn-primary"
            >
              Next
              <ChevronRight className="w-4 h-4 inline ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Submitting...'
                : id ? 'Update Experience' : 'Submit Experience'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
