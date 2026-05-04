import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Building2, DollarSign, Users, CheckCircle2, XCircle, Shield, TrendingUp, MessageSquare, Calendar } from 'lucide-react'
import { Experience } from '../api/experiences'
import { Link } from 'react-router-dom'

interface CompanyAccordionProps {
  company: {
    name: string
    experiences: Experience[]
    avgPackage: number
    experienceCount: number
    selectionRate: number
  }
  index: number
}

export default function CompanyAccordion({ company, index }: CompanyAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Show all experiences (pre-uploaded are always visible)
  const visibleExperiences = company.experiences
  
  if (visibleExperiences.length === 0) {
    return null
  }
  
  const selectedCount = visibleExperiences.filter(exp => exp.final_result === 'Selected').length
  
  // Calculate total questions across all experiences
  const totalQuestions = visibleExperiences.reduce((total, exp) => {
    if (exp.questions_asked) {
      return total + Object.values(exp.questions_asked).flat().length
    }
    return total
  }, 0)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="card overflow-hidden border border-primary-200 dark:border-primary-800"
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      {/* Company Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {company.name}
                </h3>
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs font-semibold">
                  {visibleExperiences.length} {visibleExperiences.length === 1 ? 'Experience' : 'Experiences'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {company.avgPackage > 0 ? (
                  <div className="flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
                    <DollarSign className="w-5 h-5" />
                    <span>Avg Package: ₹{company.avgPackage.toFixed(1)}L</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>Package: Not available</span>
                  </div>
                )}
                {totalQuestions > 0 && (
                  <div className="flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                    <MessageSquare className="w-5 h-5" />
                    <span>Total Questions: {totalQuestions}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Selection: {company.selectionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{selectedCount} Selected</span>
                </div>
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </motion.div>
        </div>
      </button>

      {/* Expanded Content - Individual Experiences */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              {visibleExperiences.map((experience, expIndex) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: expIndex * 0.05, 
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {experience.role}
                        </h4>
                        {experience.is_preuploaded && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          experience.final_result === 'Selected'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {experience.final_result === 'Selected' ? (
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 inline mr-1" />
                          )}
                          {experience.final_result}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        {experience.branch && (
                          <span>Branch: {experience.branch}</span>
                        )}
                        {experience.package_offered && experience.package_offered > 0 ? (
                          <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            <DollarSign className="w-4 h-4" />
                            Package: ₹{experience.package_offered.toFixed(1)}L
                          </span>
                        ) : null}
                        {experience.years_of_experience && experience.years_of_experience > 0 && (
                          <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                            <Calendar className="w-4 h-4" />
                            {experience.years_of_experience} {experience.years_of_experience === 1 ? 'Year' : 'Years'} Exp.
                          </span>
                        )}
                        {experience.questions_asked && (() => {
                          const totalQ = Object.values(experience.questions_asked).flat().length
                          return totalQ > 0 ? (
                            <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                              <MessageSquare className="w-4 h-4" />
                              Questions: {totalQ}
                            </span>
                          ) : null
                        })()}
                        {experience.interview_rounds && experience.interview_rounds.length > 0 && (
                          <span>{experience.interview_rounds.length} Round{experience.interview_rounds.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/company/${encodeURIComponent(company.name)}`}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                  
                  {/* Questions Summary */}
                  {experience.questions_asked && Object.keys(experience.questions_asked).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Questions by Category:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(experience.questions_asked).map(([category, questions]) => (
                          questions.length > 0 && (
                            <span
                              key={category}
                              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs"
                            >
                              {category}: {questions.length}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
