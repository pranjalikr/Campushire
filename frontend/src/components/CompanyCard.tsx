import { Link } from 'react-router-dom'
import { Building2, DollarSign, TrendingUp, Sparkles, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

// Role icon mapping (currently unused but kept for future use)
// const getRoleIcon = (role: string) => {
//   const roleLower = role.toLowerCase()
//   if (roleLower.includes('sde') || roleLower.includes('software') || roleLower.includes('developer')) return Code
//   if (roleLower.includes('analyst') || roleLower.includes('data')) return BarChart3
//   if (roleLower.includes('manager') || roleLower.includes('product')) return UserCog
//   if (roleLower.includes('hr') || roleLower.includes('human')) return Users
//   if (roleLower.includes('intern')) return GraduationCap
//   return Briefcase
// }

interface CompanyCardProps {
  company: {
    name: string
    experienceCount: number
    selectionRate: number
    avgPackage: number
    totalQuestions?: number
    isMajor?: boolean
  }
  index: number
}

export default function CompanyCard({ company, index }: CompanyCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 25,
        mass: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -6,
        scale: 1.01,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.5
        }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      <Link
        to={`/company/${encodeURIComponent(company.name)}`}
        className={`card relative overflow-hidden group block ${
          company.isMajor ? 'border-2 border-primary-300 dark:border-primary-700' : 'border border-primary-200 dark:border-primary-800'
        }`}
        style={{
          boxShadow: isHovered 
            ? '0 12px 24px rgba(0, 0, 0, 0.12), 0 0 12px rgba(59, 130, 246, 0.15)' 
            : '0 4px 12px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'box-shadow',
          transform: 'translateZ(0)'
        }}
      >
        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0"
          style={{
            background: company.isMajor 
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
            filter: 'blur(15px)',
            zIndex: 0
          }}
          animate={{
            opacity: isHovered ? 0.25 : 0,
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={isHovered ? { x: '200%' } : { x: '-100%' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ zIndex: 1, willChange: 'transform' }}
        />
        
        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  company.isMajor 
                    ? 'bg-primary-500' 
                    : 'bg-primary-100 dark:bg-primary-900'
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{ willChange: 'transform' }}
              >
                {company.isMajor ? (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1]
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                )}
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {company.name}
                  </h3>
                  {company.isMajor && (
                    <motion.span 
                      className="px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded"
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Popular
                    </motion.span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {company.experienceCount} experience{company.experienceCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.05 + 0.15,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Selection Rate</span>
              </div>
              <motion.span 
                className="font-semibold text-gray-900 dark:text-white"
                animate={isHovered ? { scale: 1.05 } : {}}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {company.selectionRate.toFixed(1)}%
              </motion.span>
            </motion.div>

            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: index * 0.05 + 0.25,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Avg Package</span>
              </div>
              <motion.span 
                className={`font-semibold ${company.avgPackage > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}
                animate={isHovered && company.avgPackage > 0 ? { scale: 1.05 } : {}}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                {company.avgPackage > 0 ? `₹${company.avgPackage.toFixed(1)}L` : '₹0.0L'}
              </motion.span>
            </motion.div>

            {company.totalQuestions !== undefined && company.totalQuestions > 0 && (
              <motion.div 
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05 + 0.35,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Total Questions</span>
                </div>
                <motion.span 
                  className="font-semibold text-blue-600 dark:text-blue-400"
                  animate={isHovered ? { scale: 1.05 } : {}}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  {company.totalQuestions}
                </motion.span>
              </motion.div>
            )}
          </div>

          <motion.div 
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              delay: index * 0.05 + 0.45,
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <motion.span 
              className="text-primary-600 dark:text-primary-400 text-sm font-medium inline-flex items-center gap-2"
              animate={isHovered ? { x: 3 } : { x: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              View Experiences
              <motion.span
                animate={isHovered ? { x: 3 } : { x: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                →
              </motion.span>
            </motion.span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}
