import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Brain, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

interface IntroAnimationProps {
  onComplete: () => void
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [showLogo, setShowLogo] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showOpeningLine, setShowOpeningLine] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    // Sequence the animations - faster and smoother
    const timer1 = setTimeout(() => setShowLogo(true), 200)
    const timer2 = setTimeout(() => setShowTitle(true), 600)
    const timer3 = setTimeout(() => setShowOpeningLine(true), 1000)
    const timer4 = setTimeout(() => setShowDescription(true), 1600)
    const timer5 = setTimeout(() => setShowFeatures(true), 2200)
    const timer6 = setTimeout(() => setShowCTA(true), 2800)
    const timer7 = setTimeout(() => {
      // Fade out and call onComplete
      setTimeout(onComplete, 600)
    }, 4000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearTimeout(timer6)
      clearTimeout(timer7)
    }
  }, [onComplete])

  // Generate floating particles - optimized for smooth performance
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 8 + 8,
  }))

  // Generate subtle geometric shapes - reduced count for performance
  const shapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 30 + 15,
    rotation: Math.random() * 360,
    delay: Math.random() * 2,
    duration: Math.random() * 12 + 10,
  }))

  const features = [
    { icon: Building2, text: 'Real Company Experiences', color: '#3B82F6' },
    { icon: Brain, text: 'AI-Powered Preparation', color: '#8B5CF6' },
    { icon: CheckCircle2, text: 'Career Readiness', color: '#10B981' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #667eea 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Subtle Floating Particles - Optimized */}
        {particles.map((particle) => (
          <motion.div
            key={`particle-${particle.id}`}
            className="absolute rounded-full bg-white/15 blur-sm"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
            animate={{
              y: [0, -20, -40, -20, 0],
              x: [0, Math.random() * 15 - 7.5],
              opacity: [0.1, 0.3, 0.15, 0.3, 0.1],
              scale: [1, 1.1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier
            }}
          />
        ))}

        {/* Subtle Geometric Shapes */}
        {shapes.map((shape) => (
          <motion.div
            key={`shape-${shape.id}`}
            className="absolute opacity-8"
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
              borderRadius: shape.id % 2 === 0 ? '25%' : '50%',
              transform: `rotate(${shape.rotation}deg)`,
            }}
            animate={{
              y: [0, -30, -60, -30, 0],
              x: [0, Math.random() * 20 - 10],
              rotate: [shape.rotation, shape.rotation + 90, shape.rotation + 180],
              opacity: [0.03, 0.1, 0.05, 0.1, 0.03],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Floating Sparkles - Optimized */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute text-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
            animate={{
              y: [0, -25, -50, -25, 0],
              x: [0, Math.random() * 10 - 5],
              opacity: [0, 0.4, 0.2, 0.4, 0],
              scale: [0, 1, 0.8, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto">
          {/* Logo Icon */}
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mb-6"
              >
                <motion.div
                  className="w-20 h-20 md:w-24 md:h-24 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Building2 className="w-10 h-10 md:w-12 md:h-12 text-blue-600" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <AnimatePresence>
            {showTitle && (
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-center"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                }}
              >
                CampusHire
              </motion.h1>
            )}
          </AnimatePresence>

          {/* Opening Line */}
          <AnimatePresence>
            {showOpeningLine && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-4 text-center leading-tight"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Your Smart Solution for Interview Preparation
              </motion.h2>
            )}
          </AnimatePresence>

          {/* Description */}
          <AnimatePresence>
            {showDescription && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-base md:text-lg text-white/90 mb-8 text-center max-w-2xl leading-relaxed"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Connect with real company experiences, prepare with AI-powered insights, 
                and build the confidence you need to land your dream job. 
                <span className="block mt-2 font-medium">
                  Your journey to career success starts here.
                </span>
              </motion.p>
            )}
          </AnimatePresence>

          {/* Feature Highlights */}
          <AnimatePresence>
            {showFeatures && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 w-full"
              >
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.15,
                        ease: 'easeOut',
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                    >
                      <Icon className="w-5 h-5" style={{ color: feature.color }} />
                      <span
                        className="text-sm md:text-base font-medium text-white"
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {feature.text}
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Hint */}
          <AnimatePresence>
            {showCTA && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex items-center gap-2 text-white/80"
              >
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
                <span
                  className="text-sm md:text-base font-medium"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Starting your journey...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
