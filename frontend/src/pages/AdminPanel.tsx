import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CheckCircle2, XCircle, Shield, ArrowLeft, Users, FileText, TrendingUp, AlertCircle, Plus, BarChart3, Eye, DollarSign, MessageSquare, ChevronDown, ChevronUp, User, Linkedin, Github, GraduationCap, BookOpen, X, RefreshCw, Calendar } from 'lucide-react'
import { Experience } from '../api/experiences'
import { adminAPI, UserProfile } from '../api/admin'
import { useAuthStore } from '../store/authStore'
import Chatbot from '../components/Chatbot'
import { motion } from 'framer-motion'
import ExperienceForm from './ExperienceForm'

type TabType = 'experiences' | 'users' | 'create' | 'dashboard' | 'all-experiences'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('experiences')
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [experienceToReject, setExperienceToReject] = useState<number | null>(null)
  const [userToReject, setUserToReject] = useState<number | null>(null)
  const [isRejectingUser, setIsRejectingUser] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isAdmin, adminLogout } = useAuthStore()

  // Redirect if not admin - use useEffect to avoid render issues
  useEffect(() => {
  if (!isAdmin) {
    navigate('/admin/login')
    }
  }, [isAdmin, navigate])

  if (!isAdmin) {
    return null
  }

  const { data: pendingExperiences = [], isLoading: experiencesLoading } = useQuery({
    queryKey: ['admin-pending-experiences'],
    queryFn: () => adminAPI.getPendingExperiences(),
    refetchInterval: 30000, // Refresh every 30 seconds to catch new user submissions
    refetchOnWindowFocus: true, // Refresh when admin returns to the tab
    refetchOnMount: true, // Always refresh when component mounts
  })

  const { data: allExperiences = [], isLoading: allExperiencesLoading } = useQuery({
    queryKey: ['admin-all-experiences'],
    queryFn: () => adminAPI.getAllExperiences(false), // Get all experiences, not just approved
    enabled: activeTab === 'all-experiences' || activeTab === 'dashboard',
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when admin returns to the tab
    refetchOnMount: true, // Always refresh when component mounts
  })

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: () => adminAPI.getAllUsers(),
  })

  // Calculate statistics
  const stats = {
    totalExperiences: allExperiences?.length || 0,
    pendingExperiences: pendingExperiences?.length || 0,
    approvedExperiences: allExperiences?.filter((e: Experience) => e.is_approved).length || 0,
    totalUsers: allUsers?.length || 0,
    verifiedUsers: allUsers?.filter((u: UserProfile) => u.user.profile_completed).length || 0,
  }

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminAPI.approveExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
      // Force refresh dashboard experiences
      queryClient.refetchQueries({ queryKey: ['experiences'] })
      toast.success('Experience approved and published! It will now be visible on the dashboard.')
      setSelectedExperience(null)
    },
    onError: (error: any) => {
      // Safely extract error message
      let errorMessage = 'Failed to approve experience'
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
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      adminAPI.rejectExperience(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-experiences'] })
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
      toast.success('Experience rejected')
      setShowRejectModal(false)
      setRejectReason('')
      setExperienceToReject(null)
      setSelectedExperience(null)
    },
    onError: (error: any) => {
      // Safely extract error message
      let errorMessage = 'Failed to reject experience'
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
    },
  })

  const approveUserMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      adminAPI.approveUserProfile(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
      toast.success('User profile approved!')
      setSelectedUser(null)
    },
    onError: (error: any) => {
      // Safely extract error message
      let errorMessage = 'Failed to approve user profile'
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
    },
  })

  const rejectUserMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      adminAPI.rejectUserProfile(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
      toast.success('User profile rejected')
      setShowRejectModal(false)
      setRejectReason('')
      setUserToReject(null)
      setIsRejectingUser(false)
      setSelectedUser(null)
    },
    onError: (error: any) => {
      // Safely extract error message
      let errorMessage = 'Failed to reject user profile'
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
    },
  })

  const handleReject = (id: number) => {
    setExperienceToReject(id)
    setUserToReject(null)
    setIsRejectingUser(false)
    setShowRejectModal(true)
  }

  const handleRejectUser = (id: number) => {
    setUserToReject(id)
    setExperienceToReject(null)
    setIsRejectingUser(true)
    setShowRejectModal(true)
  }

  const confirmReject = () => {
    if (experienceToReject) {
      rejectMutation.mutate({ id: experienceToReject, reason: rejectReason || undefined })
    } else if (userToReject) {
      rejectUserMutation.mutate({ id: userToReject, reason: rejectReason || undefined })
    }
  }

  const getEligibilityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400'
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getEligibilityBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (percentage >= 60) return 'bg-blue-100 dark:bg-blue-900/20'
    if (percentage >= 40) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const isLoading = experiencesLoading || usersLoading

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve user profiles and experiences
            </p>
          </div>
          <div className="flex items-center gap-3">
          <button
              onClick={() => {
                adminLogout()
                navigate('/dashboard')
              }}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Admin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('dashboard')
              setSelectedExperience(null)
            }}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('experiences')
              setSelectedExperience(null)
            }}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'experiences'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Pending ({pendingExperiences.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('all-experiences')
              setSelectedExperience(null)
            }}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all-experiences'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            All Experiences
          </button>
          <button
            onClick={() => {
              setActiveTab('create')
              setSelectedExperience(null)
            }}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'create'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Experience
          </button>
          <button
            onClick={() => {
              setActiveTab('users')
              setSelectedUser(null)
            }}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users ({allUsers.length})
          </button>
        </div>

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Pending Experiences</h2>
              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['admin-pending-experiences'] })
                  toast.success('Refreshing pending experiences...')
                }}
                className="btn-secondary inline-flex items-center gap-2"
                disabled={experiencesLoading}
              >
                <RefreshCw className={`w-4 h-4 ${experiencesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : pendingExperiences.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              No pending experiences
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              All experiences have been reviewed
            </p>
          </div>
        ) : (
          <>
            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>{pendingExperiences.length}</strong> experience{pendingExperiences.length !== 1 ? 's' : ''} pending review
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {pendingExperiences.map((experience: Experience, idx: number) => (
                  <motion.div 
                    key={experience.id} 
                    className="card relative overflow-hidden group"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: idx * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.6 }}
                    ></motion.div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex-1">
                        <motion.h3 
                          className="text-xl font-bold text-gray-900 dark:text-white"
                          whileHover={{ scale: 1.05 }}
                        >
                          {experience.company_name}
                        </motion.h3>
                        <p className="text-gray-600 dark:text-gray-400">{experience.role}</p>
                        {experience.user_name && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              Submitted by: {experience.user_name}
                            </p>
                            {/* Eligibility Status Badge */}
                            {experience.user_eligible !== undefined && (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                experience.user_eligible
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                              }`}>
                                {experience.user_eligible ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Eligible ({experience.user_eligibility_percentage}%)
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Not Eligible ({experience.user_eligibility_percentage}%)
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => approveMutation.mutate(experience.id)}
                          disabled={approveMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50 relative z-10"
                          aria-label="Approve"
                          title="Approve"
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleReject(experience.id)}
                          disabled={rejectMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 relative z-10"
                          aria-label="Reject"
                          title="Reject"
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <XCircle className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                    {/* Package and Questions Summary */}
                    <div className="space-y-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Package Offered</p>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {experience.package_offered != null && experience.package_offered > 0
                                  ? `₹${experience.package_offered.toFixed(1)}L`
                                  : 'Not disclosed'}
                              </p>
                            </div>
                          </div>
                          {experience.years_of_experience && experience.years_of_experience > 0 && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {experience.years_of_experience} {experience.years_of_experience === 1 ? 'Year' : 'Yrs'}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total Questions</p>
                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {experience.questions_asked 
                                  ? Object.values(experience.questions_asked).flat().length 
                                  : 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Result: <strong className={`${
                              experience.final_result === 'Selected'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>{experience.final_result}</strong>
                          </p>
                        </div>
                      </div>
                      
                      {/* Questions by Category */}
                      {experience.questions_asked && Object.keys(experience.questions_asked).length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Questions by Category:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(experience.questions_asked).map(([category, questions]) => (
                              questions.length > 0 && (
                                <span
                                  key={category}
                                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs font-medium"
                                >
                                  {category}: {questions.length}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Preparation Strategy Preview */}
                      {experience.preparation_strategy && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Preparation Strategy:</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {experience.preparation_strategy}
                          </p>
                        </div>
                      )}
                    </div>
                    <motion.button
                      onClick={() => setSelectedExperience(experience)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium relative z-10 inline-flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      View Full Details
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-1">
                {selectedExperience ? (
                  <div className="card sticky top-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Experience Details
                    </h3>
                    <div className="space-y-4">
                      {/* Personal Information Section */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">Full Name:</strong>
                            <p className="text-gray-900 dark:text-white">{selectedExperience.full_name}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">College:</strong>
                            <p className="text-gray-900 dark:text-white">{selectedExperience.college_name}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">Branch:</strong>
                            <p className="text-gray-900 dark:text-white">{selectedExperience.branch}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">LinkedIn:</strong>
                            <p className="text-gray-900 dark:text-white break-all">{selectedExperience.linkedin_id || 'N/A'}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">GitHub:</strong>
                            <p className="text-gray-900 dark:text-white break-all">{selectedExperience.github_id || 'N/A'}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">Anonymous:</strong>
                            <p className="text-gray-900 dark:text-white">{selectedExperience.is_anonymous ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        {selectedExperience.bio && (
                          <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                            <strong className="text-gray-700 dark:text-gray-300">Bio/About:</strong>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedExperience.bio}</p>
                          </div>
                        )}
                      </div>

                      {/* Company & Role Information */}
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Company:</strong>
                        <p className="text-gray-900 dark:text-white">{selectedExperience.company_name}</p>
                      </div>
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Role:</strong>
                        <p className="text-gray-900 dark:text-white">{selectedExperience.role}</p>
                      </div>
                      {/* Enhanced Package Display */}
                      <div className={`p-4 rounded-lg border ${
                        selectedExperience.package_offered
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-center gap-3">
                          <DollarSign className={`w-6 h-6 ${
                            selectedExperience.package_offered
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`} />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Package Offered</p>
                            <p className={`text-2xl font-bold ${
                              selectedExperience.package_offered && selectedExperience.package_offered > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {selectedExperience.package_offered != null && selectedExperience.package_offered > 0
                                ? `₹${selectedExperience.package_offered.toFixed(1)}L`
                                : 'Not disclosed'}
                            </p>
                          </div>
                          {selectedExperience.years_of_experience && selectedExperience.years_of_experience > 0 && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Years of Experience</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {selectedExperience.years_of_experience} {selectedExperience.years_of_experience === 1 ? 'Year' : 'Years'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Eligibility Status in Detail View */}
                      {selectedExperience.user_eligible !== undefined && (
                        <div className={`p-4 rounded-lg border ${
                          selectedExperience.user_eligible
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {selectedExperience.user_eligible ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                              )}
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">User Eligibility Status</p>
                                <p className={`text-lg font-bold ${
                                  selectedExperience.user_eligible
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {selectedExperience.user_eligible ? 'Eligible' : 'Not Eligible'}
                                </p>
                                {selectedExperience.user_eligibility_status && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Status: {selectedExperience.user_eligibility_status} ({selectedExperience.user_eligibility_percentage}%)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Result:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-sm font-semibold ${
                            selectedExperience.final_result === 'Selected'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {selectedExperience.final_result}
                        </span>
                      </div>
                      {selectedExperience.rejection_reasons && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <strong className="text-gray-700 dark:text-gray-300">Rejection Reasons:</strong>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedExperience.rejection_reasons}</p>
                        </div>
                      )}
                      {selectedExperience.preparation_strategy && (
                        <div>
                          <strong className="text-gray-700 dark:text-gray-300">Preparation Strategy:</strong>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedExperience.preparation_strategy}
                          </p>
                        </div>
                      )}
                      {/* Enhanced Questions Display */}
                      {selectedExperience.questions_asked && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <strong className="text-gray-700 dark:text-gray-300">Questions Asked</strong>
                            <span className="ml-auto px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-bold">
                              {Object.values(selectedExperience.questions_asked).flat().length} Total
                            </span>
                          </div>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {Object.entries(selectedExperience.questions_asked).map(([category, questions]) => (
                              Array.isArray(questions) && questions.length > 0 && (
                                <div key={category} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs">
                                      {category}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">({questions.length} questions)</span>
                                  </p>
                                  <ul className="space-y-1.5">
                                    {questions.map((q: string, i: number) => (
                                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                        <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                                        <span>{q}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedExperience.resources_followed && selectedExperience.resources_followed.length > 0 && (
                        <div>
                          <strong className="text-gray-700 dark:text-gray-300">Resources:</strong>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedExperience.resources_followed.map((resource: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs"
                              >
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedExperience.interview_rounds && selectedExperience.interview_rounds.length > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            Interview Rounds ({selectedExperience.interview_rounds.length})
                          </h4>
                          <div className="space-y-4">
                            {selectedExperience.interview_rounds.map((round: any, idx: number) => (
                              <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <strong className="text-gray-900 dark:text-white">Round {idx + 1}</strong>
                                  {round.round_type && (
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-xs font-medium">
                                      {round.round_type}
                                    </span>
                                  )}
                                  {round.difficulty && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                                      {round.difficulty}
                                    </span>
                                  )}
                                </div>
                                {round.round_name && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <strong>Name:</strong> {round.round_name}
                                  </p>
                                )}
                                {round.questions && Array.isArray(round.questions) && round.questions.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                      Questions in this round ({round.questions.length}):
                                    </p>
                                    <ul className="space-y-1">
                                      {round.questions.map((q: string, qIdx: number) => (
                                        <li key={qIdx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                          <span className="text-orange-600 dark:text-orange-400 mt-1">•</span>
                                          <span>{q}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveMutation.mutate(selectedExperience.id)}
                            disabled={approveMutation.isPending}
                            className="flex-1 btn-primary text-sm"
                          >
                            {approveMutation.isPending ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(selectedExperience.id)}
                            disabled={rejectMutation.isPending}
                            className="flex-1 btn-secondary text-sm bg-red-600 hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                      Click on an experience to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
            )}
          </>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Experiences</p>
                    <p className="text-3xl font-bold">{stats.totalExperiences}</p>
                  </div>
                  <FileText className="w-12 h-12 opacity-50" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending Review</p>
                    <p className="text-3xl font-bold">{stats.pendingExperiences}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 opacity-50" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Approved</p>
                    <p className="text-3xl font-bold">{stats.approvedExperiences}</p>
                  </div>
                  <CheckCircle2 className="w-12 h-12 opacity-50" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-12 h-12 opacity-50" />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {pendingExperiences.slice(0, 5).map((exp: Experience) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{exp.company_name} - {exp.role}</p>
                        <p className="text-sm text-gray-500">Submitted by {exp.user_name || 'Unknown'}</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                        Pending
                      </span>
                    </div>
                  ))}
                  {pendingExperiences.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No pending experiences</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Experience
                  </button>
                  <button
                    onClick={() => setActiveTab('experiences')}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Review Pending Experiences
                  </button>
                  <button
                    onClick={() => setActiveTab('all-experiences')}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Experiences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Experience Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                Create Experience as Admin
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Experiences created by admins are automatically approved and published.
              </p>
            </div>
            <ExperienceForm isAdmin={true} />
          </div>
        )}

        {/* All Experiences Tab */}
        {activeTab === 'all-experiences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Experiences</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                  Approved: {stats.approvedExperiences}
                </span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm">
                  Pending: {stats.pendingExperiences}
                </span>
              </div>
            </div>
            {allExperiencesLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : allExperiences.length === 0 ? (
              <div className="card text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No experiences found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allExperiences.map((experience: Experience, idx: number) => (
                  <motion.div
                    key={experience.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    whileHover={{ y: -4 }}
                    className="card cursor-pointer border border-primary-200 dark:border-primary-800"
                    onClick={() => setSelectedExperience(experience)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{experience.company_name}</h3>
                      {experience.is_approved ? (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{experience.role}</p>
                    {experience.package_offered && experience.package_offered > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Package: ₹{experience.package_offered.toFixed(1)}L</span>
                      </div>
                    )}
                    {experience.years_of_experience && experience.years_of_experience > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Experience: {experience.years_of_experience} {experience.years_of_experience === 1 ? 'Year' : 'Years'}</span>
                      </div>
                    )}
                    {experience.questions_asked && (() => {
                      const totalQ = Object.values(experience.questions_asked).flat().length
                      return totalQ > 0 ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <MessageSquare className="w-4 h-4" />
                          <span>Questions: {totalQ}</span>
                        </div>
                      ) : null
                    })()}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By {experience.user_name || 'Unknown'} • {new Date(experience.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {usersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="card text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  No users found
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {allUsers.map((userProfile: UserProfile) => (
                      <div key={userProfile.user.id} className="card">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {userProfile.user.full_name}
                              </h3>
                              {userProfile.user.profile_completed && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{userProfile.user.email}</p>
                            {userProfile.user.college_name && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                {userProfile.user.college_name}
                                {userProfile.user.branch && ` - ${userProfile.user.branch}`}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveUserMutation.mutate({ id: userProfile.user.id })}
                              disabled={approveUserMutation.isPending}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50"
                              aria-label="Approve"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectUser(userProfile.user.id)}
                              disabled={rejectUserMutation.isPending}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                              aria-label="Reject"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Eligibility Score */}
                        <div className={`p-4 rounded-lg mb-4 ${getEligibilityBgColor(userProfile.eligibility.eligibility_percentage)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              <span className="font-semibold text-gray-900 dark:text-white">
                                Eligibility Score
                              </span>
                            </div>
                            <span className={`text-2xl font-bold ${getEligibilityColor(userProfile.eligibility.eligibility_percentage)}`}>
                              {userProfile.eligibility.eligibility_percentage}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2 py-1 rounded text-sm font-semibold ${getEligibilityBgColor(userProfile.eligibility.eligibility_percentage)} ${getEligibilityColor(userProfile.eligibility.eligibility_percentage)}`}>
                              {userProfile.eligibility.status}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Recommendation: {userProfile.eligibility.recommendation}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                userProfile.eligibility.eligibility_percentage >= 80
                                  ? 'bg-green-500'
                                  : userProfile.eligibility.eligibility_percentage >= 60
                                  ? 'bg-blue-500'
                                  : userProfile.eligibility.eligibility_percentage >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${userProfile.eligibility.eligibility_percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Strengths and Issues */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {userProfile.eligibility.strengths.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                                Strengths ({userProfile.eligibility.strengths.length})
                              </p>
                              <ul className="space-y-1">
                                {userProfile.eligibility.strengths.slice(0, 3).map((strength, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {userProfile.eligibility.issues.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                                Issues ({userProfile.eligibility.issues.length})
                              </p>
                              <ul className="space-y-1">
                                {userProfile.eligibility.issues.slice(0, 3).map((issue, idx) => (
                                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                    <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span>Experiences: {userProfile.experience_count}</span>
                          <span>Approved: {userProfile.eligibility.approved_experience_count}</span>
                          <span>Profile: {userProfile.user.profile_completion_percentage}%</span>
                        </div>

                        {/* User Experiences Summary */}
                        <UserExperiencesSummary userId={userProfile.user.id} />

                        <button
                          onClick={() => setSelectedUser(userProfile)}
                          className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          View Full Profile →
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-1">
                    {selectedUser ? (
                      <div className="card sticky top-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                          User Profile Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">Name:</strong>
                            <p className="text-gray-900 dark:text-white">{selectedUser.user.full_name}</p>
                          </div>
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">Email:</strong>
                            <p className="text-gray-900 dark:text-white">{selectedUser.user.email}</p>
                          </div>
                          {selectedUser.user.college_name && (
                            <div>
                              <strong className="text-gray-700 dark:text-gray-300">College:</strong>
                              <p className="text-gray-900 dark:text-white">{selectedUser.user.college_name}</p>
                            </div>
                          )}
                          {selectedUser.user.branch && (
                            <div>
                              <strong className="text-gray-700 dark:text-gray-300">Branch:</strong>
                              <p className="text-gray-900 dark:text-white">{selectedUser.user.branch}</p>
                            </div>
                          )}
                          {selectedUser.user.linkedin_id && (
                            <div>
                              <strong className="text-gray-700 dark:text-gray-300">LinkedIn:</strong>
                              <p className="text-gray-900 dark:text-white">{selectedUser.user.linkedin_id}</p>
                            </div>
                          )}
                          {selectedUser.user.github_id && (
                            <div>
                              <strong className="text-gray-700 dark:text-gray-300">GitHub:</strong>
                              <p className="text-gray-900 dark:text-white">{selectedUser.user.github_id}</p>
                            </div>
                          )}
                          <div>
                            <strong className="text-gray-700 dark:text-gray-300">Eligibility:</strong>
                            <div className={`mt-2 p-3 rounded ${getEligibilityBgColor(selectedUser.eligibility.eligibility_percentage)}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{selectedUser.eligibility.status}</span>
                                <span className={`text-lg font-bold ${getEligibilityColor(selectedUser.eligibility.eligibility_percentage)}`}>
                                  {selectedUser.eligibility.eligibility_percentage}%
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Score: {selectedUser.eligibility.score}/{selectedUser.eligibility.max_score}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Recommendation: <strong>{selectedUser.eligibility.recommendation}</strong>
                              </p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => approveUserMutation.mutate({ id: selectedUser.user.id })}
                                disabled={approveUserMutation.isPending}
                                className="flex-1 btn-primary text-sm"
                              >
                                {approveUserMutation.isPending ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRejectUser(selectedUser.user.id)}
                                disabled={rejectUserMutation.isPending}
                                className="flex-1 btn-secondary text-sm bg-red-600 hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="card">
                        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                          Click on a user profile to view details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {isRejectingUser ? 'Reject User Profile' : 'Reject Experience'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejection (optional):
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field w-full h-24 mb-4"
                placeholder="Reason for rejection..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason('')
                    setExperienceToReject(null)
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={isRejectingUser ? rejectUserMutation.isPending : rejectMutation.isPending}
                  className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
                >
                  {isRejectingUser
                    ? rejectUserMutation.isPending
                      ? 'Rejecting...'
                      : 'Confirm Reject'
                    : rejectMutation.isPending
                    ? 'Rejecting...'
                    : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Chatbot */}
        <div className="fixed bottom-6 right-6 z-40">
          <Chatbot />
        </div>
      </div>
  )
}

// Component to show user experiences summary
function UserExperiencesSummary({ userId }: { userId: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: userExperiences = [], isLoading } = useQuery({
    queryKey: ['user-experiences', userId],
    queryFn: () => adminAPI.getUserExperiences(userId),
    enabled: isExpanded,
  })

  // Calculate summary
  const packages = userExperiences
    .filter((exp: Experience) => exp.package_offered != null && exp.package_offered > 0)
    .map((exp: Experience) => exp.package_offered!)
  const avgPackage = packages.length > 0
    ? packages.reduce((sum: number, pkg: number) => sum + pkg, 0) / packages.length
    : 0
  const maxPackage = packages.length > 0 ? Math.max(...packages) : 0
  const totalQuestions = userExperiences.reduce((total: number, exp: Experience) => {
    if (exp.questions_asked) {
      return total + Object.values(exp.questions_asked).flat().length
    }
    return total
  }, 0)

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          View Experiences Summary
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : userExperiences.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No experiences found</p>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300">Avg Package</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {avgPackage > 0 ? `₹${avgPackage.toFixed(1)}L` : '₹0.0L'}
                  </p>
                  {packages.length === 0 && userExperiences.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No packages disclosed
                    </p>
                  )}
                  {maxPackage > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Max: ₹{maxPackage.toFixed(1)}L
                    </p>
                  )}
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-700 dark:text-green-300">Total Questions</span>
                  </div>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">{totalQuestions}</p>
                </div>
              </div>

              {/* Experiences List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userExperiences.map((exp: Experience) => (
                  <div key={exp.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{exp.company_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.role}</p>
                      </div>
                      <div className="text-right">
                        {exp.package_offered != null && exp.package_offered > 0 ? (
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            ₹{exp.package_offered.toFixed(1)}L
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Not disclosed
                          </p>
                        )}
                        {exp.years_of_experience && exp.years_of_experience > 0 && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {exp.years_of_experience} {exp.years_of_experience === 1 ? 'Year' : 'Yrs'} Exp.
                          </p>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          exp.is_approved
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {exp.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Questions Summary */}
                    {exp.questions_asked && Object.keys(exp.questions_asked).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Questions by Category:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(exp.questions_asked).map(([category, questions]) => (
                            questions.length > 0 && (
                              <span
                                key={category}
                                className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded"
                              >
                                {category}: {questions.length}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
