import { useQuery } from '@tanstack/react-query'
import { experiencesAPI, Experience } from '../api/experiences'
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Search, CheckCircle2, Briefcase, Users, Code, GraduationCap, UserCog, BarChart3, Edit, FileText, DollarSign, PlusCircle, Filter, X, Calendar } from 'lucide-react'
import Chatbot from '../components/Chatbot'
import CompanyCard from '../components/CompanyCard'
import CompanyAccordion from '../components/CompanyAccordion'
import { useAuthStore } from '../store/authStore'
import { motion } from 'framer-motion'

export default function Dashboard() {
  console.log('Dashboard component rendering...')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [showMyExperiences, setShowMyExperiences] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'accordion'>('accordion') // New accordion view
  const { user } = useAuthStore()
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  console.log('Dashboard state:', { user, searchQuery, filterRole })

  // Show welcome message on first visit after signup
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome && user?.full_name) {
      setShowWelcome(true)
      sessionStorage.setItem('hasSeenWelcome', 'true')
      // Hide welcome after 5 seconds
      setTimeout(() => setShowWelcome(false), 5000)
    }
  }, [user])

  // Fetch user's own experiences
  const { data: myExperiences = [], isLoading: myExperiencesLoading } = useQuery({
    queryKey: ['my-experiences'],
    queryFn: () => experiencesAPI.getMyExperiences(),
  })

  const { data: experiences, isLoading, error } = useQuery({
    queryKey: ['experiences', searchQuery, filterRole],
    queryFn: async () => {
      try {
        return await experiencesAPI.getAll(searchQuery || undefined, filterRole || undefined)
      } catch (err: any) {
        console.error('Failed to load experiences:', err)
        setHasError(true)
        // Safely extract error message - handle both Error objects and API error responses
        let message = 'Failed to load experiences'
        if (err instanceof Error) {
          message = typeof err.message === 'string' ? err.message : String(err.message)
        } else if (err?.message) {
          message = typeof err.message === 'string' ? err.message : String(err.message)
        } else if (err?.response?.data?._extractedMessage) {
          message = err.response.data._extractedMessage
        } else if (err?.response?.data?.detail) {
          if (typeof err.response.data.detail === 'string') {
            message = err.response.data.detail
          } else if (Array.isArray(err.response.data.detail)) {
            message = err.response.data.detail.map((e: any) => {
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
          } else if (typeof err.response.data.detail === 'object') {
            // Handle single validation error object
            const detail = err.response.data.detail
            if (detail.msg) {
              message = String(detail.msg)
            } else if (detail.type && detail.loc && detail.msg) {
              message = `Validation error: ${String(detail.msg)} at ${Array.isArray(detail.loc) ? detail.loc.join('.') : String(detail.loc)}`
            } else {
              try {
                message = JSON.stringify(detail)
              } catch {
                message = String(detail)
              }
            }
          }
        }
        
        // Check if backend is actually running for network errors
        if (message.includes('Network') || message.includes('Failed to fetch') || !err?.response) {
          try {
            const healthCheck = await fetch('http://localhost:8000/health', { cache: 'no-cache' })
            if (healthCheck.ok) {
              message = 'Connection issue. Please refresh the page (Ctrl + Shift + R)'
            } else {
              message = 'Unable to connect to server. Please check if the backend is running.'
            }
          } catch {
            message = 'Unable to connect to server. Please check if the backend is running.'
          }
        }
        
        setErrorMessage(message)
        throw err
      }
    },
    retry: 2,
    retryDelay: 1000,
    refetchInterval: 30000, // Refresh every 30 seconds to catch newly approved experiences
    refetchOnWindowFocus: true, // Refresh when user returns to the tab
  })

  // Major tech companies to prioritize
  const majorCompanies = ['Amazon', 'Google', 'Microsoft', 'IBM', 'Oracle', 'Accenture', 'Apple']
  
  // Filter and group experiences by company
  const filteredAndGroupedCompanies = useMemo(() => {
    if (!experiences || !Array.isArray(experiences)) return []
    
    // Apply filters
    let filtered = experiences.filter((exp: Experience) => {
      // Pre-uploaded experiences are always visible, others need to be published
      if (!exp.is_published && !exp.is_preuploaded) return false
      
      // Search filter
      if (searchQuery && !exp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !exp.role.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Role filter
      if (filterRole && !exp.role.toLowerCase().includes(filterRole.toLowerCase())) {
        return false
      }
      
      // Branch filter
      if (filterBranch && exp.branch && !exp.branch.toLowerCase().includes(filterBranch.toLowerCase())) {
        return false
      }
      
      // Difficulty filter (check interview rounds)
      if (filterDifficulty && exp.interview_rounds) {
        const hasDifficulty = exp.interview_rounds.some((round: any) => 
          round.difficulty && round.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
        )
        if (!hasDifficulty) return false
      }
      
      return true
    })
    
    // Group by company
    const companyMap = new Map<string, Experience[]>()
    filtered.forEach((exp: Experience) => {
      const companyName = exp.company_name
      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, [])
      }
      companyMap.get(companyName)!.push(exp)
    })
    
    // Convert to array and calculate stats
    const companies = Array.from(companyMap.entries()).map(([name, exps]) => {
      const selectedCount = exps.filter(e => e.final_result === 'Selected').length
      const packages = exps.filter(e => e.package_offered).map(e => e.package_offered!)
      const avgPackage = packages.length > 0 
        ? packages.reduce((sum, pkg) => sum + pkg, 0) / packages.length 
        : 0
      
      // Calculate total questions across all experiences for this company
      const totalQuestions = exps.reduce((total, exp) => {
        if (exp.questions_asked) {
          return total + Object.values(exp.questions_asked).flat().length
        }
        return total
      }, 0)
      
      return {
        name,
        experiences: exps,
        experienceCount: exps.length,
        selectionRate: exps.length > 0 ? (selectedCount / exps.length) * 100 : 0,
        avgPackage,
        totalQuestions,
        isMajor: majorCompanies.some(mc => name.toLowerCase().includes(mc.toLowerCase())),
      }
    })
    
    // Sort by experience count (descending)
    return companies.sort((a, b) => {
      if (a.isMajor && !b.isMajor) return -1
      if (!a.isMajor && b.isMajor) return 1
      return b.experienceCount - a.experienceCount
    })
  }, [experiences, searchQuery, filterRole, filterBranch, filterDifficulty])
  
  // Get unique branches and difficulties for filter dropdowns
  const uniqueBranches = useMemo(() => {
    if (!experiences) return []
    const branches = new Set<string>()
    experiences.forEach((exp: Experience) => {
      if (exp.branch) branches.add(exp.branch)
    })
    return Array.from(branches).sort()
  }, [experiences])
  
  const uniqueDifficulties = useMemo(() => {
    if (!experiences) return []
    const difficulties = new Set<string>()
    experiences.forEach((exp: Experience) => {
      if (exp.interview_rounds) {
        exp.interview_rounds.forEach((round: any) => {
          if (round.difficulty) difficulties.add(round.difficulty)
        })
      }
    })
    return Array.from(difficulties).sort()
  }, [experiences])

  // Show error if there's a critical error
  if (hasError && errorMessage) {
    return (
      <div className="space-y-6">
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-500 dark:text-red-500 mb-4">
            {typeof errorMessage === 'string' ? errorMessage : String(errorMessage || 'An unexpected error occurred')}
          </p>
          <button
            onClick={() => {
              setHasError(false)
              setErrorMessage(null)
              window.location.reload()
            }}
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  console.log('Dashboard render state:', { experiences, isLoading, error, companies: filteredAndGroupedCompanies.length })
  
  // Safety check
  if (!experiences && !isLoading && !error) {
    console.log('Showing loading state...')
    return (
      <div className="space-y-6">
        <div className="card">
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  console.log('Rendering main dashboard content...')
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      {showWelcome && user?.full_name && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold">
                Welcome, {user.full_name}! 👋
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                Your account has been created successfully. Start exploring interview experiences!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="hidden sm:block"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {user?.full_name ? `Welcome back, ${user.full_name}!` : 'Company Experiences'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filterRole 
                ? `Explore ${filterRole} interview experiences shared by students`
                : 'Explore interview experiences shared by students'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMyExperiences(!showMyExperiences)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {showMyExperiences ? 'Hide' : 'My'} Experiences ({myExperiences.length})
          </button>
          <Link
            to="/experience/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Share Experience
          </Link>
        </div>
      </div>

      {/* My Experiences Section */}
      {showMyExperiences && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card mb-6"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            My Experiences
          </h2>
          {myExperiencesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : myExperiences.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't shared any experiences yet.</p>
              <Link to="/experience/new" className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Share Your First Experience
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myExperiences.map((exp: any, idx: number) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exp.company_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          exp.is_approved
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {exp.is_approved ? 'Approved' : 'Pending Review'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{exp.role}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {exp.package_offered != null && exp.package_offered > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ₹{exp.package_offered.toFixed(1)}L
                          </span>
                        )}
                        {exp.years_of_experience && exp.years_of_experience > 0 && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {exp.years_of_experience} {exp.years_of_experience === 1 ? 'Year' : 'Years'} Exp.
                          </span>
                        )}
                        <span>Result: {exp.final_result}</span>
                        <span>{new Date(exp.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      to={`/experience/${exp.id}/edit`}
                      className="btn-secondary inline-flex items-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Filters Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {(filterRole || filterBranch || filterDifficulty || searchQuery) && (
            <button
              onClick={() => {
                setFilterRole('')
                setFilterBranch('')
                setFilterDifficulty('')
                setSearchQuery('')
              }}
              className="ml-auto text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search companies/roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input-field appearance-none"
            >
              <option value="">All Roles</option>
              <option value="SDE">Software Development Engineer (SDE)</option>
              <option value="Analyst">Data Analyst</option>
              <option value="Intern">Intern</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR / Human Resources</option>
              <option value="Product Manager">Product Manager</option>
              <option value="QA">QA / Quality Assurance</option>
              <option value="DevOps">DevOps Engineer</option>
              <option value="Designer">UI/UX Designer</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="input-field appearance-none"
            >
              <option value="">All Branches</option>
              {uniqueBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="input-field appearance-none"
            >
              <option value="">All Difficulties</option>
              {uniqueDifficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="card text-center py-12 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Failed to load experiences
          </p>
          <p className="text-sm text-red-500 dark:text-red-500">
            {(() => {
              // Safely extract error message - handle all cases including FastAPI validation errors
              const extractErrorMsg = (err: any): string => {
                if (err instanceof Error) {
                  const msg = err.message
                  if (typeof msg === 'string') return msg
                  if (Array.isArray(msg)) {
                    return (msg as any[]).map((e: any) => {
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
                  if (typeof msg === 'object') {
                    try {
                      return JSON.stringify(msg)
                    } catch {
                      return String(msg)
                    }
                  }
                  return String(msg)
                }
                if (err?.message) {
                  const msg = err.message
                  if (typeof msg === 'string') return msg
                  if (Array.isArray(msg)) {
                    return msg.map((e: any) => {
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
                  if (typeof msg === 'object') {
                    try {
                      return JSON.stringify(msg)
                    } catch {
                      return String(msg)
                    }
                  }
                  return String(msg)
                }
                if (err?.response?.data?._extractedMessage) {
                  return String(err.response.data._extractedMessage)
                }
                if (err?.response?.data?.detail) {
                  const detail = err.response.data.detail
                  if (typeof detail === 'string') return detail
                  if (Array.isArray(detail)) {
                    return detail.map((e: any) => {
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
                  if (typeof detail === 'object') {
                    if (detail.msg) return String(detail.msg)
                    try {
                      return JSON.stringify(detail)
                    } catch {
                      return String(detail)
                    }
                  }
                }
                return 'Please check your connection and try again.'
              }
              return extractErrorMsg(error)
            })()}
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredAndGroupedCompanies.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No companies found matching your filters. Try adjusting your search criteria.
          </p>
        </div>
      ) : viewMode === 'accordion' ? (
        <div className="space-y-4">
          {filteredAndGroupedCompanies.map((company, idx) => (
            <CompanyAccordion
              key={company.name}
              company={company}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndGroupedCompanies.map((company, idx) => (
            <CompanyCard key={company.name} company={company} index={idx} />
          ))}
        </div>
      )}

      <Chatbot selectedRole={filterRole || undefined} />
    </div>
  )
}
