import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../api/users'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import React from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { User, Linkedin, Github, GraduationCap, CheckCircle2, FileText, DollarSign, HelpCircle, X } from 'lucide-react'

export default function ProfilePage() {
  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    full_name: '',
    linkedin_id: '',
    github_id: '',
    college_name: '',
    branch: '',
    bio: '',
    package_offered: undefined as number | undefined,
    questions_asked: {} as Record<string, string[]>,
  })
  const [newQuestion, setNewQuestion] = useState({ category: 'DSA', question: '' })
  const [hasChanges, setHasChanges] = useState(false)

  const { data: user, isLoading, error: userError } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        return await usersAPI.getMe()
      } catch (error: any) {
        console.error('Failed to load user profile:', error)
        let errorMessage = 'Failed to load profile'
        if (error?.message && typeof error.message === 'string') {
          errorMessage = error.message
        } else if (error?.response?.data?._extractedMessage) {
          errorMessage = error.response.data._extractedMessage
        } else if (error?.response?.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail
          }
        }
        toast.error(errorMessage)
        throw error
      }
    },
    retry: 2,
  })

  // Update form data when user is loaded
  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        linkedin_id: user.linkedin_id || '',
        github_id: user.github_id || '',
        college_name: user.college_name || '',
        branch: user.branch || '',
        bio: user.bio || '',
        package_offered: user.package_offered,
        questions_asked: user.questions_asked || {},
      })
      setHasChanges(false)
    }
  }, [user])

  // Track changes
  React.useEffect(() => {
    if (user) {
      const changed = 
        formData.full_name !== (user.full_name || '') ||
        formData.linkedin_id !== (user.linkedin_id || '') ||
        formData.github_id !== (user.github_id || '') ||
        formData.college_name !== (user.college_name || '') ||
        formData.branch !== (user.branch || '') ||
        formData.bio !== (user.bio || '') ||
        formData.package_offered !== (user.package_offered || undefined) ||
        JSON.stringify(formData.questions_asked) !== JSON.stringify(user.questions_asked || {})
      setHasChanges(changed)
    }
  }, [formData, user])

  const { data: completion } = useQuery({
    queryKey: ['profile-completion'],
    queryFn: usersAPI.getProfileCompletion,
  })

  const updateMutation = useMutation({
    mutationFn: usersAPI.updateProfile,
    onSuccess: (data) => {
      updateUser(data)
      // Invalidate all related queries to refresh eligibility
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      queryClient.invalidateQueries({ queryKey: ['profile-completion'] })
      queryClient.invalidateQueries({ queryKey: ['user-eligibility'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pending-experiences'] })
      setHasChanges(false)
      toast.success('Profile updated successfully! Eligibility will be recalculated.')
    },
     onError: (error: any) => {
       // Extract error message safely
       let errorMessage = 'Failed to update profile'
       if (error?.message && typeof error.message === 'string') {
         errorMessage = error.message
       } else if (error?.response?.data?._extractedMessage) {
         errorMessage = error.response.data._extractedMessage
       } else if (error?.response?.data?.detail) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  // Show error state but still allow editing - render form even on error
  const showError = userError && !user
  const errorMessage = userError instanceof Error 
    ? userError.message 
    : 'Network Error - Cannot connect to backend server'
  
  const completionPercentage = completion?.percentage || 0

  // Initialize form data even if user is not loaded yet (for offline editing)
  React.useEffect(() => {
    if (!user && !isLoading) {
      // If user data failed to load, initialize with empty values so form is still editable
      setFormData({
        full_name: '',
        linkedin_id: '',
        github_id: '',
        college_name: '',
        branch: '',
        bio: '',
        package_offered: undefined,
        questions_asked: {},
      })
    }
  }, [user, isLoading])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Loading Indicator - Show at top while loading */}
      {isLoading && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 dark:text-blue-300">Loading your profile...</p>
          </div>
        </div>
      )}

      {/* Error Banner - Show at top if error */}
      {showError && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-2">
            {errorMessage}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Make sure the backend server is running at http://localhost:8000
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['user-profile'] })
                queryClient.invalidateQueries({ queryKey: ['profile-completion'] })
              }}
              className="btn-primary"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <span>You have unsaved changes</span>
          </motion.div>
        )}
      </div>

      {/* Profile Completion Bar - Only show if user data loaded */}
      {!showError && (
        <motion.div 
          className="card relative overflow-hidden group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Completion
          </span>
          <span className="text-sm font-semibold text-primary-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="bg-primary-600 h-3 rounded-full"
          />
        </div>
        {completionPercentage < 100 && (
          <motion.p 
            className="text-sm text-gray-500 dark:text-gray-400 mt-2 relative z-10"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Complete your profile to unlock all features
          </motion.p>
        )}
        </motion.div>
      )}

      {/* Profile Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="card space-y-6 relative overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
      >
         <motion.div
           className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100"
           transition={{ duration: 0.3 }}
         />
         <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
           <span className={`text-sm ${showError ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
             {showError ? '⚠️ Offline mode - changes will save when backend is available' : '✏️ Click any field to edit and write your information'}
           </span>
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
             <User className="w-4 h-4 inline mr-2" />
             Full Name *
           </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => {
              setFormData({ ...formData, full_name: e.target.value })
            }}
            onFocus={(e) => {
              e.target.select()
            }}
            className="input-field focus:ring-2 focus:ring-primary-500"
            placeholder="Type your full name here..."
            autoComplete="name"
            disabled={updateMutation.isPending || isLoading}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This is your display name (required)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Linkedin className="w-4 h-4 inline mr-2" />
            LinkedIn ID
          </label>
          <input
            type="text"
            value={formData.linkedin_id}
            onChange={(e) => setFormData({ ...formData, linkedin_id: e.target.value })}
            className="input-field focus:ring-2 focus:ring-primary-500"
            placeholder="Type your LinkedIn profile ID here..."
            autoComplete="off"
            disabled={updateMutation.isPending || isLoading}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example: john-doe or in/johndoe
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Github className="w-4 h-4 inline mr-2" />
            GitHub ID
          </label>
          <input
            type="text"
            value={formData.github_id}
            onChange={(e) => setFormData({ ...formData, github_id: e.target.value })}
            className="input-field focus:ring-2 focus:ring-primary-500"
            placeholder="Type your GitHub username here..."
            autoComplete="off"
            disabled={updateMutation.isPending || isLoading}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example: johndoe or github.com/johndoe
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <GraduationCap className="w-4 h-4 inline mr-2" />
            College Name
          </label>
          <input
            type="text"
            value={formData.college_name}
            onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
            className="input-field focus:ring-2 focus:ring-primary-500"
            placeholder="Type your college/university name here..."
            autoComplete="organization"
            disabled={updateMutation.isPending || isLoading}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example: MIT, Stanford University, IIT Delhi
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <GraduationCap className="w-4 h-4 inline mr-2" />
            Branch
          </label>
          <input
            type="text"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            className="input-field focus:ring-2 focus:ring-primary-500"
            placeholder="Type your branch/field of study here..."
            autoComplete="off"
            disabled={updateMutation.isPending || isLoading}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Example: Computer Science, Electrical Engineering, Mechanical Engineering
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            About Me / Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="input-field h-40 resize-y focus:ring-2 focus:ring-primary-500"
            placeholder="Write about yourself here... 

You can include:
• Your interests and hobbies
• Skills and expertise
• Achievements and projects
• Career goals and aspirations
• Anything else you'd like to share!"
            rows={8}
            autoComplete="off"
            spellCheck="true"
            disabled={updateMutation.isPending || isLoading}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Write as much as you want! This helps others know more about you.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Characters: {formData.bio.length} (no limit)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Expected Package (LPA)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.package_offered || ''}
            onChange={(e) => setFormData({ ...formData, package_offered: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="input-field focus:ring-2 focus:ring-primary-500"
            placeholder="Enter expected package in LPA (e.g., 12.5)"
            autoComplete="off"
            disabled={updateMutation.isPending || isLoading}
            readOnly={false}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your expected or typical package offer in Lakhs Per Annum
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HelpCircle className="w-4 h-4 inline mr-2" />
            Common Interview Questions
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                className="input-field flex-1 focus:ring-2 focus:ring-primary-500"
                disabled={updateMutation.isPending || isLoading}
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
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newQuestion.question.trim()) {
                      const updated = { ...formData.questions_asked }
                      if (!updated[newQuestion.category]) {
                        updated[newQuestion.category] = []
                      }
                      updated[newQuestion.category].push(newQuestion.question.trim())
                      setFormData({ ...formData, questions_asked: updated })
                      setNewQuestion({ category: 'DSA', question: '' })
                    }
                  }
                }}
                className="input-field flex-2 focus:ring-2 focus:ring-primary-500"
                placeholder="Enter a question and press Enter"
                disabled={updateMutation.isPending || isLoading}
              />
              <button
                type="button"
                onClick={() => {
                  if (newQuestion.question.trim()) {
                    const updated = { ...formData.questions_asked }
                    if (!updated[newQuestion.category]) {
                      updated[newQuestion.category] = []
                    }
                    updated[newQuestion.category].push(newQuestion.question.trim())
                    setFormData({ ...formData, questions_asked: updated })
                    setNewQuestion({ category: 'DSA', question: '' })
                  }
                }}
                className="btn-primary"
                disabled={updateMutation.isPending || isLoading || !newQuestion.question.trim()}
              >
                Add
              </button>
            </div>
            {Object.keys(formData.questions_asked).length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {Object.entries(formData.questions_asked).map(([category, questions]) => (
                  questions.length > 0 && (
                    <div key={category} className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{category}</h4>
                      {questions.map((q, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded">
                          <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">{q}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...formData.questions_asked }
                              updated[category] = updated[category].filter((_, i) => i !== idx)
                              if (updated[category].length === 0) {
                                delete updated[category]
                              }
                              setFormData({ ...formData, questions_asked: updated })
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                            disabled={updateMutation.isPending || isLoading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add common interview questions you've encountered or expect
          </p>
        </div>

         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700"
         >
           <button 
             type="submit" 
             className={`btn-primary flex-1 ${!hasChanges ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
             disabled={updateMutation.isPending || !hasChanges}
             title={!hasChanges ? 'Make changes to enable save' : 'Save your profile changes'}
           >
              {updateMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Saving...
                </span>
              ) : (
               'Save Changes'
               )}
           </button>
           {hasChanges && (
             <button
               type="button"
               onClick={() => {
                 if (user) {
                   setFormData({
                     full_name: user.full_name || '',
                     linkedin_id: user.linkedin_id || '',
                     github_id: user.github_id || '',
                     college_name: user.college_name || '',
                     branch: user.branch || '',
                     bio: user.bio || '',
                     package_offered: user.package_offered,
                     questions_asked: user.questions_asked || {},
                   })
                   setHasChanges(false)
                 }
               }}
               className="btn-secondary"
               disabled={updateMutation.isPending}
             >
               Cancel
             </button>
           )}
         </motion.div>
      </motion.form>

      {completionPercentage === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
          <div className="flex items-center space-x-3 relative z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Profile Complete!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your profile is 100% complete. You can now access all features.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
