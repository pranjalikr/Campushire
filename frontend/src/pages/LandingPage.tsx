import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  Building2, 
  Brain, 
  Users, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Target,
  Eye,
  Rocket,
  TrendingUp,
  MessageCircle,
  BookOpen,
  Zap,
  Shield
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      let startTime: number | null = null
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const { scrollYProgress } = useScroll()
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  // Animated gradient background
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden smooth-scroll">
      {/* Simple Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  whileHover={{ rotate: 0, scale: 1.2 }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </motion.div>
                <motion.span
                  className="text-xl font-bold text-gray-900 dark:text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  CampusHire
                </motion.span>
              </Link>
            </motion.div>
            <motion.nav
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium relative"
                >
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  Home
                </Link>
              </motion.div>
              {isAuthenticated ? (
                <>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      to="/dashboard"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium relative"
                    >
                      <motion.span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/admin/login"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-1"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Shield className="w-4 h-4" />
                      </motion.div>
                      Admin
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      to="/auth"
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium relative"
                    >
                      <motion.span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/auth"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors relative overflow-hidden group"
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <span className="relative z-10">Get Started</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
          style={{ y: backgroundY }}
          animate={{
            background: [
              'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #4f46e5 100%)',
              'linear-gradient(135deg, #9333ea 0%, #4f46e5 50%, #2563eb 100%)',
              'linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #9333ea 100%)',
              'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #4f46e5 100%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Animated particles/orbs - Optimized for smooth performance */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={`orb-${i}`}
                className="absolute rounded-full bg-white/10 blur-xl"
                style={{
                  width: Math.random() * 400 + 100,
                  height: Math.random() * 400 + 100,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 600 - 300, Math.random() * 600 - 300, Math.random() * 600 - 300, 0],
                  y: [0, Math.random() * 600 - 300, Math.random() * 600 - 300, Math.random() * 600 - 300, 0],
                  scale: [1, 1.4, 0.7, 1.2, 1],
                  opacity: [0.05, 0.25, 0.15, 0.3, 0.05],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: Math.random() * 20 + 20,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: Math.random() * 10,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          
          {/* Small floating particles - Optimized */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: Math.random() * 8 + 2,
                  height: Math.random() * 8 + 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 200 - 100],
                  y: [0, Math.random() * 200 - 100],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0.5, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: Math.random() * 5,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          
          {/* Medium glowing particles - Optimized */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`glow-${i}`}
                className="absolute rounded-full bg-gradient-to-r from-yellow-300/30 to-pink-300/30 blur-md"
                style={{
                  width: Math.random() * 60 + 20,
                  height: Math.random() * 60 + 20,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 300 - 150],
                  y: [0, Math.random() * 300 - 150],
                  scale: [1, 1.5, 0.8, 1],
                  opacity: [0.2, 0.6, 0.3, 0.2],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: Math.random() * 12 + 8,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: Math.random() * 8,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          
          {/* Animated grid pattern - Reduced opacity */}
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Real Experiences.
              </motion.span>
              <br />
              <motion.span
                className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={heroInView ? { opacity: 1, y: 0, backgroundPosition: ['0%', '100%', '0%'] } : { backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 0.8, delay: 0.7 }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                Smarter Preparation.
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              AI-powered interview preparation platform connecting students with real company insights,
              recruiter access, and a supportive community. Prepare smarter, land your dream job.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl flex items-center gap-2 relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Go to Dashboard
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </span>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/auth"
                      className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl flex items-center gap-2 relative overflow-hidden group"
                    >
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </span>
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/dashboard"
                      className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all relative overflow-hidden group"
                    >
                      <motion.span
                        className="absolute inset-0 bg-white/10"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative z-10">Explore Services</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            whileHover={{ scale: 1.2 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-white/10">
              <motion.div
                className="w-1 h-3 bg-white rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
          
          {/* Floating icons - Optimized */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`icon-${i}`}
              className="absolute text-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, -60, -30, 0],
                x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
                rotate: [0, 15, -15, 10, 0],
                scale: [1, 1.2, 0.9, 1.1, 1],
                opacity: [0.2, 0.5, 0.3, 0.4, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
            >
              {i % 3 === 0 ? (
                <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
              ) : i % 3 === 1 ? (
                <Zap className="w-6 h-6 md:w-8 md:h-8" />
              ) : (
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
              )}
            </motion.div>
          ))}
          
          {/* Animated lines/beams - Optimized */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`beam-${i}`}
              className="absolute h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                rotate: `${Math.random() * 360}deg`,
              }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.5, 1, 0.5],
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.section>

      {/* Stats Section */}
      <StatsSection />

      {/* Mission & Vision Section */}
      <MissionVisionSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Final CTA Section */}
      <FinalCTASection isAuthenticated={isAuthenticated} />
    </div>
  )
}

// Stats Section Component
function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  // Floating particles for stats section
  const particles = [...Array(20)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 5 + 3,
    delay: Math.random() * 2,
  }))

  const stats = [
    { value: 1000, suffix: '+', label: 'Active Users', icon: Users },
    { value: 500, suffix: '+', label: 'Companies', icon: Building2 },
    { value: 2000, suffix: '+', label: 'Interview Experiences', icon: BookOpen },
    { value: 95, suffix: '%', label: 'Success Rate', icon: TrendingUp },
  ]

  return (
    <motion.section
      ref={ref}
      className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Floating particles in stats section */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/20 dark:bg-blue-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, -60, -30, 0],
            x: [0, Math.random() * 20 - 10],
            opacity: [0, 0.5, 0.3, 0.5, 0],
            scale: [0, 1, 1.5, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group"
                initial={{ opacity: 0, y: 30, rotateY: -15 }}
                animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.08, y: -10, rotateY: 5 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 relative z-10"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">
                  {isInView ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <motion.div
                  className="text-gray-600 dark:text-gray-400 font-medium relative z-10"
                  animate={isInView ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

// Mission & Vision Section
function MissionVisionSection() {
  const missionRef = useRef(null)
  const visionRef = useRef(null)
  const missionInView = useInView(missionRef, { once: true, margin: '-100px' })
  const visionInView = useInView(visionRef, { once: true, margin: '-100px' })
  
  // Particles for mission/vision section - Optimized
  const missionParticles = [...Array(8)].map((_, i) => ({
    id: `mission-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
  }))
  
  const visionParticles = [...Array(8)].map((_, i) => ({
    id: `vision-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
  }))

  return (
    <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background animated particles - Optimized */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`bg-particle-${i}`}
          className="absolute rounded-full bg-purple-500/10 dark:bg-purple-400/10"
          style={{
            width: Math.random() * 8 + 2,
            height: Math.random() * 8 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, -100, -50, 0],
            x: [0, Math.random() * 30 - 15],
            opacity: [0, 0.3, 0.1, 0.3, 0],
            scale: [0, 1, 1.2, 1, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Mission */}
          <motion.div
            ref={missionRef}
            className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl relative overflow-hidden group"
            initial={{ opacity: 0, x: -50, rotateX: -15 }}
            animate={missionInView ? { opacity: 1, x: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            {/* Floating particles inside mission card */}
            {missionParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-blue-500/20"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                animate={{
                  y: [0, -20, -40, -20, 0],
                  x: [0, Math.random() * 15 - 7.5],
                  opacity: [0, 0.4, 0.2, 0.4, 0],
                  scale: [0, 1, 1.3, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
            
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <motion.div
                className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-gray-900 dark:text-white"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage: 'linear-gradient(90deg, #111827 0%, #2563eb 50%, #111827 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                Our Mission
              </motion.h2>
            </div>
            <motion.p
              className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed relative z-10"
              initial={{ opacity: 0 }}
              animate={missionInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              To democratize access to interview preparation resources by connecting students with real,
              verified interview experiences from top companies. We believe every student deserves the
              opportunity to prepare effectively and land their dream job.
            </motion.p>
          </motion.div>

          {/* Vision */}
          <motion.div
            ref={visionRef}
            className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl relative overflow-hidden group"
            initial={{ opacity: 0, x: 50, rotateX: -15 }}
            animate={visionInView ? { opacity: 1, x: 0, rotateX: 0 } : {}}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            {/* Floating particles inside vision card */}
            {visionParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full bg-purple-500/20"
                style={{
                  width: particle.size,
                  height: particle.size,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                animate={{
                  y: [0, -20, -40, -20, 0],
                  x: [0, Math.random() * 15 - 7.5],
                  opacity: [0, 0.4, 0.2, 0.4, 0],
                  scale: [0, 1, 1.3, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
            
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                backgroundPosition: ['100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle, #9333ea 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <motion.div
                className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center"
                animate={{
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Eye className="w-6 h-6 text-white" />
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-gray-900 dark:text-white"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage: 'linear-gradient(90deg, #111827 0%, #9333ea 50%, #111827 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                Our Vision
              </motion.h2>
            </div>
            <motion.p
              className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed relative z-10"
              initial={{ opacity: 0 }}
              animate={visionInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              To become the leading platform for interview preparation, where AI-powered insights meet
              real-world experiences. We envision a future where every student has the tools and knowledge
              to excel in their interviews and build successful careers.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  // Particles for features section - Optimized
  const featureParticles = [...Array(20)].map((_, i) => ({
    id: `feature-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 5 + 2,
    color: ['blue', 'purple', 'pink', 'indigo'][Math.floor(Math.random() * 4)],
  }))

  const features = [
    {
      icon: Building2,
      title: 'Company Insights',
      description: 'Access real interview experiences from top companies. Learn about their hiring process, questions asked, and what they look for.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'AI-Powered Preparation',
      description: 'Get personalized interview preparation powered by AI. Practice with intelligent chatbots and receive tailored feedback.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Recruiter Access',
      description: 'Connect directly with recruiters from leading companies. Get insights, tips, and opportunities to showcase your skills.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageCircle,
      title: 'Community Support',
      description: 'Join a vibrant community of students sharing experiences, tips, and supporting each other in their interview journey.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Tracking',
      description: 'Track your preparation progress, identify strengths and weaknesses, and get data-driven insights to improve your performance.',
      color: 'from-indigo-500 to-purple-500',
    },
  ]

  return (
    <motion.section
      ref={ref}
      className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Floating particles in features section */}
      {featureParticles.map((particle) => {
        const colorMap: Record<string, string> = {
          blue: 'bg-blue-500/20 dark:bg-blue-400/20',
          purple: 'bg-purple-500/20 dark:bg-purple-400/20',
          pink: 'bg-pink-500/20 dark:bg-pink-400/20',
          indigo: 'bg-indigo-500/20 dark:bg-indigo-400/20',
        }
        return (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${colorMap[particle.color]}`}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -40, -80, -40, 0],
              x: [0, Math.random() * 25 - 12.5],
              opacity: [0, 0.4, 0.2, 0.4, 0],
              scale: [0, 1, 1.4, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        )
      })}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            style={{
              backgroundSize: '200% 200%',
              backgroundImage: 'linear-gradient(90deg, #111827 0%, #2563eb 50%, #9333ea 50%, #111827 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            What We Offer
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Everything you need to ace your interviews and land your dream job
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.08, y: -15, rotateY: 5 }}
              >
                {/* Mini particles inside each feature card - Optimized */}
                {[...Array(4)].map((_, pIdx) => (
                  <motion.div
                    key={`feature-${index}-particle-${pIdx}`}
                    className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                    style={{
                      width: Math.random() * 4 + 2,
                      height: Math.random() * 4 + 2,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -15, -30, -15, 0],
                      x: [0, Math.random() * 10 - 5],
                      opacity: [0, 0.3, 0.1, 0.3, 0],
                      scale: [0, 1, 1.2, 1, 0],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
                {/* Animated border gradient */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`,
                    padding: '2px',
                  }}
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6">
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 relative z-10`}
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2,
                    }}
                    whileHover={{ rotate: 360, scale: 1.2 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400 leading-relaxed relative z-10"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  // Particles for how it works section - Optimized
  const stepParticles = [...Array(12)].map((_, i) => ({
    id: `step-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 3,
  }))

  const steps = [
    {
      number: '01',
      title: 'Sign Up & Create Profile',
      description: 'Join CampusHire and create your profile. Tell us about your skills, interests, and career goals.',
      icon: Rocket,
    },
    {
      number: '02',
      title: 'Explore Experiences',
      description: 'Browse through thousands of real interview experiences from top companies. Learn from others\' journeys.',
      icon: BookOpen,
    },
    {
      number: '03',
      title: 'AI-Powered Preparation',
      description: 'Use our AI chatbot to practice interviews, get personalized tips, and improve your skills.',
      icon: Brain,
    },
    {
      number: '04',
      title: 'Share & Connect',
      description: 'Share your own interview experiences and connect with recruiters and fellow students.',
      icon: Users,
    },
  ]

  return (
    <motion.section
      ref={ref}
      className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Floating particles */}
      {stepParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-blue-500/15 to-purple-500/15"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -35, -70, -35, 0],
            x: [0, Math.random() * 20 - 10],
            opacity: [0, 0.4, 0.2, 0.4, 0],
            scale: [0, 1, 1.3, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Animated connection lines - Reduced opacity */}
      <motion.div
        className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10"
        animate={{
          backgroundPosition: ['0%', '100%', '0%'],
        }}
        style={{
          backgroundSize: '200% 100%',
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            style={{
              backgroundSize: '200% 200%',
              backgroundImage: 'linear-gradient(90deg, #111827 0%, #2563eb 50%, #9333ea 50%, #111827 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Get started in four simple steps
          </motion.p>
        </motion.div>

        <div className="relative">

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Step indicator */}
                  <div className="relative z-10 mb-6">
                    <motion.div
                      className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg relative"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear', delay: index * 2 },
                        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 },
                      }}
                      whileHover={{ scale: 1.2, rotate: 0 }}
                    >
                      <Icon className="w-10 h-10 text-white" />
                      {/* Pulsing ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </motion.div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-blue-500"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.3,
                      }}
                    >
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{step.number}</span>
                    </motion.div>
                  </div>

                  <motion.h3
                    className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                    whileHover={{ x: 5, color: '#2563eb' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

// Final CTA Section
function FinalCTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.section
      ref={ref}
      className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background elements - More particles */}
      <div className="absolute inset-0">
        {/* Large orbs - Optimized */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`cta-orb-${i}`}
            className="absolute rounded-full bg-white/10 blur-xl"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.6, 0.8, 1.4, 1],
              opacity: [0.05, 0.3, 0.1, 0.25, 0.05],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: Math.random() * 4,
            }}
          />
        ))}
        
        {/* Medium particles - Optimized */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`cta-particle-${i}`}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 8 + 3,
              height: Math.random() * 8 + 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, -80, -40, 0],
              x: [0, Math.random() * 30 - 15],
              opacity: [0, 0.6, 0.3, 0.6, 0],
              scale: [0, 1, 1.5, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        {/* Glowing stars - Optimized */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`cta-star-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.5, 1, 0.5],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="w-4 h-4 text-white/40" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            animate={{
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 30px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Ready to Start Your Journey with CampusHire?
          </motion.span>
        </motion.h2>
        <motion.p
          className="text-xl text-white/90 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Join thousands of students who are already preparing smarter and landing their dream jobs.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {isAuthenticated ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Go to Dashboard
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Now
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </span>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  )
}
