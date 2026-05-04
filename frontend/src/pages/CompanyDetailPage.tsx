import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { experiencesAPI, Experience } from '../api/experiences'
import { companiesAPI } from '../api/companies'
import { ArrowLeft, Building2, Users, DollarSign, Calendar, BookOpen, Lightbulb, Target, Code, MessageSquare, Briefcase, GraduationCap, UserCog, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Layout from '../components/Layout'
import AutoTypingText from '../components/AutoTypingText'

// Role icon mapping
const getRoleIcon = (role: string) => {
  const roleLower = role.toLowerCase()
  if (roleLower.includes('sde') || roleLower.includes('software') || roleLower.includes('developer')) return Code
  if (roleLower.includes('analyst') || roleLower.includes('data')) return BarChart3
  if (roleLower.includes('manager') || roleLower.includes('product')) return UserCog
  if (roleLower.includes('hr') || roleLower.includes('human')) return Users
  if (roleLower.includes('intern')) return GraduationCap
  return Briefcase
}

// Role color mapping
const getRoleColor = (role: string) => {
  const roleLower = role.toLowerCase()
  if (roleLower.includes('sde') || roleLower.includes('software') || roleLower.includes('developer')) return 'from-blue-500 to-cyan-500'
  if (roleLower.includes('analyst') || roleLower.includes('data')) return 'from-purple-500 to-pink-500'
  if (roleLower.includes('manager') || roleLower.includes('product')) return 'from-orange-500 to-red-500'
  if (roleLower.includes('hr') || roleLower.includes('human')) return 'from-green-500 to-emerald-500'
  if (roleLower.includes('intern')) return 'from-yellow-500 to-orange-500'
  return 'from-primary-500 to-blue-500'
}

export default function CompanyDetailPage() {
  const { companyName } = useParams<{ companyName: string }>()
  const navigate = useNavigate()
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null)

  const decodedCompanyName = companyName ? decodeURIComponent(companyName) : ''

  const { data: experiences, isLoading } = useQuery({
    queryKey: ['experiences', 'company', decodedCompanyName],
    queryFn: () => experiencesAPI.getAll(decodedCompanyName, undefined),
  })

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['company-suggestions', decodedCompanyName],
    queryFn: () => companiesAPI.getSuggestions(decodedCompanyName),
    enabled: !!decodedCompanyName,
  })

  // Filter experiences for this company and published only
  const companyExperiences = experiences?.filter(
    (exp) => exp.company_name === decodedCompanyName && exp.is_published
  ) || []

  // Calculate statistics
  const stats = {
    total: companyExperiences.length,
    selected: companyExperiences.filter((e) => e.final_result === 'Selected').length,
    rejected: companyExperiences.filter((e) => e.final_result === 'Rejected').length,
    avgPackage: companyExperiences
      .filter((e) => e.package_offered)
      .reduce((acc, e) => acc + (e.package_offered || 0), 0) /
      (companyExperiences.filter((e) => e.package_offered).length || 1),
    selectionRate: companyExperiences.length > 0
      ? (companyExperiences.filter((e) => e.final_result === 'Selected').length /
          companyExperiences.length) *
        100
      : 0,
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {decodedCompanyName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Interview Experiences & Insights
              </p>
            </div>
          </div>
        </div>

        {/* AI Suggestions Section */}
        {suggestions && !suggestionsLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-2 border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI-Powered Preparation Guide
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personalized suggestions based on {suggestions.total_experiences} interview experiences
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interview Questions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Common Interview Questions</h3>
                </div>
                <div className="space-y-2">
                  {suggestions.interview_questions.slice(0, 5).map((question, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <AutoTypingText
                        text={question}
                        speed={20}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skills to Build */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Skills to Build</h3>
                </div>
                <div className="space-y-2">
                  {suggestions.skills_to_build.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <AutoTypingText
                        text={skill}
                        speed={25}
                        className="text-sm text-gray-700 dark:text-gray-300 font-medium"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Preparation Tips */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Preparation Strategy</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.preparation_tips.slice(0, 6).map((tip, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <AutoTypingText
                        text={`• ${tip}`}
                        speed={15}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div 
            className="card relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Experiences</p>
                <motion.p 
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stats.total}
                </motion.p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="card relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selection Rate</p>
                <motion.p 
                  className="text-2xl font-bold text-green-600"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {stats.selectionRate.toFixed(1)}%
                </motion.p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="card relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selected</p>
                <motion.p 
                  className="text-2xl font-bold text-green-600"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  {stats.selected}
                </motion.p>
              </div>
              <motion.div 
                className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              </motion.div>
            </div>
          </motion.div>

          {stats.avgPackage > 0 && (
            <motion.div 
              className="card relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Package</p>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  >
                    ₹{stats.avgPackage.toFixed(1)}L
                  </motion.p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <DollarSign className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Experiences List */}
        {companyExperiences.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No experiences shared yet for {decodedCompanyName}
            </p>
            <button
              onClick={() => navigate('/experience/new')}
              className="mt-4 btn-primary"
            >
              Share Your Experience
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Experiences List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Interview Experiences ({companyExperiences.length})
              </h2>
              {companyExperiences.map((experience, idx) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: idx * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <motion.div
                    className="card hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden group"
                    onClick={() => setSelectedExperience(experience)}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <motion.div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoleColor(experience.role)} flex items-center justify-center shadow-md`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            {(() => {
                              const RoleIcon = getRoleIcon(experience.role)
                              return <RoleIcon className="w-5 h-5 text-white" />
                            })()}
                          </motion.div>
                          <motion.h3 
                            className="text-lg font-bold text-gray-900 dark:text-white"
                            whileHover={{ scale: 1.05 }}
                          >
                            {experience.role}
                          </motion.h3>
                          <motion.span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              experience.final_result === 'Selected'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                            animate={{ 
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {experience.final_result}
                          </motion.span>
                        </div>
                        {experience.package_offered && experience.package_offered > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Package: ₹{experience.package_offered.toFixed(1)}L
                          </p>
                        )}
                        {experience.years_of_experience && experience.years_of_experience > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {experience.years_of_experience} {experience.years_of_experience === 1 ? 'Year' : 'Years'} Experience
                          </p>
                        )}
                        {experience.user_name && !experience.is_anonymous && (
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              By {experience.user_name}
                            </p>
                            {experience.user_email && (
                              <p className="text-xs text-gray-400 dark:text-gray-600">
                                {experience.user_email}
                              </p>
                            )}
                            {experience.user_profile_completion_percentage !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary-600 dark:bg-primary-400 transition-all"
                                    style={{ width: `${experience.user_profile_completion_percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-600">
                                  {experience.user_profile_completion_percentage}% Profile
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    {experience.preparation_strategy && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {experience.preparation_strategy}
                      </p>
                    )}
                    <motion.div 
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 relative z-10"
                      whileHover={{ x: 5 }}
                    >
                      <motion.span 
                        className="text-primary-600 dark:text-primary-400 text-sm font-medium inline-flex items-center gap-2"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        View Details
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Experience Detail Sidebar */}
            <div className="lg:col-span-1">
              {selectedExperience ? (
                <div className="card sticky top-6">
                  <h3 className="text-xl font-bold mb-4">Experience Details</h3>
                  <div className="space-y-4">
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">Role:</strong>
                      <p className="text-gray-900 dark:text-white">{selectedExperience.role}</p>
                    </div>

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

                    {selectedExperience.package_offered && selectedExperience.package_offered > 0 && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Package:</strong>
                        <p className="text-gray-900 dark:text-white">
                          ₹{selectedExperience.package_offered.toFixed(1)}L
                        </p>
                      </div>
                    )}
                    {selectedExperience.years_of_experience && selectedExperience.years_of_experience > 0 && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Years of Experience:</strong>
                        <p className="text-gray-900 dark:text-white">
                          {selectedExperience.years_of_experience} {selectedExperience.years_of_experience === 1 ? 'Year' : 'Years'}
                        </p>
                      </div>
                    )}

                    {selectedExperience.interview_rounds && selectedExperience.interview_rounds.length > 0 && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Interview Rounds:</strong>
                        <ul className="mt-2 space-y-1">
                          {selectedExperience.interview_rounds.map((round: any, idx: number) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                              • {round.round_name || round.round_type || `Round ${idx + 1}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedExperience.questions_asked && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Questions Asked:</strong>
                        <div className="mt-2 space-y-2">
                          {Object.entries(selectedExperience.questions_asked).map(([category, questions]) => (
                            <div key={category}>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">
                                {category}:
                              </p>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                {Array.isArray(questions) && questions.slice(0, 3).map((q: string, i: number) => (
                                  <li key={i}>• {q}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
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

                    {selectedExperience.rejection_reasons && (
                      <div>
                        <strong className="text-gray-700 dark:text-gray-300">Rejection Reasons:</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedExperience.rejection_reasons}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Shared on {new Date(selectedExperience.created_at).toLocaleDateString()}
                      </p>
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
        )}
      </div>
    </Layout>
  )
}
