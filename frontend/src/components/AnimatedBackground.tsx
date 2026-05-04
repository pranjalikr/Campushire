import { motion } from 'framer-motion'
import { Sparkles, Zap, Target, Brain, Cpu, Network, Code, Database } from 'lucide-react'
import { useMemo } from 'react'

export default function AnimatedBackground() {
  // Generate neural network nodes - Optimized
  const nodes = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 4 + Math.random() * 3,
    })), []
  )

  // Generate connections between nodes (neural network style)
  const connections = useMemo(() => {
    const conns: Array<{ from: number; to: number }> = []
    for (let i = 0; i < nodes.length; i++) {
      // Connect each node to 2-3 nearby nodes
      const nearby = nodes
        .map((n, idx) => ({ idx, dist: Math.abs(n.x - nodes[i].x) + Math.abs(n.y - nodes[i].y) }))
        .filter(n => n.idx !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2 + Math.floor(Math.random() * 2))
      
      nearby.forEach(n => {
        if (!conns.some(c => (c.from === i && c.to === n.idx) || (c.from === n.idx && c.to === i))) {
          conns.push({ from: i, to: n.idx })
        }
      })
    }
    return conns
  }, [nodes])

  // Generate floating code snippets
  const codeSnippets = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      text: ['AI', 'ML', 'DL', 'NN', '0x1A', '0xFF', '1010', '0101'][i],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
    })), []
  )

  const icons = [Sparkles, Zap, Target, Brain, Cpu, Network, Code, Database]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Animated gradient background with AI theme */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(34, 197, 94, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Neural Network Connections */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {connections.map((conn, idx) => {
          const fromNode = nodes[conn.from]
          const toNode = nodes[conn.to]
          return (
            <motion.line
              key={`conn-${idx}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="0.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </svg>

      {/* Neural Network Nodes */}
      {nodes.map((node) => (
        <motion.div
          key={`node-${node.id}`}
          className="absolute"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            boxShadow: [
              '0 0 0px rgba(59, 130, 246, 0)',
              '0 0 20px rgba(59, 130, 246, 0.5)',
              '0 0 0px rgba(59, 130, 246, 0)',
            ],
          }}
          transition={{
            duration: node.duration,
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-3 h-3 bg-primary-400 rounded-full" />
        </motion.div>
      ))}

      {/* Floating AI Icons - Optimized */}
      {Array.from({ length: 12 }, (_, i) => {
        const Icon = icons[i % icons.length]
        const xOffset = Math.random() * 20 - 10
        return (
          <motion.div
            key={`icon-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, xOffset, 0],
              opacity: [0.1, 0.35, 0.1],
              scale: [0.5, 0.9, 0.5],
              rotate: [0, 180],
            }}
            transition={{
              duration: 8 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-4 h-4 text-primary-400/40" />
          </motion.div>
        )
      })}

      {/* Floating Code Snippets / Binary */}
      {codeSnippets.map((snippet) => (
        <motion.div
          key={`code-${snippet.id}`}
          className="absolute font-mono text-xs text-primary-300/30 font-bold"
          style={{
            left: `${snippet.x}%`,
            top: `${snippet.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: snippet.duration,
            delay: snippet.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {snippet.text}
        </motion.div>
      ))}

      {/* Circuit Board Pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(45deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 80px 80px, 80px 80px',
        }}
        animate={{
          backgroundPosition: [
            '0% 0%, 0% 0%, 0% 0%, 0% 0%',
            '40px 40px, 40px 40px, 80px 80px, 80px 80px',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Data Flow Particles - Optimized */}
      {Array.from({ length: 15 }, (_, i) => {
        const xOffset = (Math.random() - 0.5) * 80
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              willChange: 'transform, opacity',
              background: `rgba(59, 130, 246, ${Math.random() * 0.4 + 0.2})`,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, xOffset, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 1.5,
              ease: 'easeInOut',
            }}
          />
        )
      })}

      {/* Pulsing AI Orbs */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${150 + i * 80}px`,
            height: `${150 + i * 80}px`,
            left: `${15 + i * 25}%`,
            top: `${10 + i * 20}%`,
            background: `radial-gradient(circle, ${
              i % 2 === 0 
                ? `rgba(59, 130, 246, ${0.25 - i * 0.05})` 
                : `rgba(147, 51, 234, ${0.25 - i * 0.05})`
            } 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, (Math.random() - 0.5) * 50, 0],
            y: [0, (Math.random() - 0.5) * 50, 0],
          }}
          transition={{
            duration: 5 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.7,
          }}
        />
      ))}

      {/* Animated Grid Pattern (Tech Grid) */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '60px 60px'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Glowing Tech Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {Array.from({ length: 5 }, (_, i) => {
          const x = 20 + i * 15
          return (
            <motion.line
              key={`line-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={100}
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="0.5"
              animate={{
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          )
        })}
      </svg>

      {/* AI Data Streams - Vertical flowing data */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`stream-${i}`}
          className="absolute"
          style={{
            left: `${10 + i * 12}%`,
            top: '-10%',
            width: '2px',
            height: '30%',
          }}
          animate={{
            y: ['0%', '110%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'linear',
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-primary-400 to-transparent blur-sm" />
        </motion.div>
      ))}

      {/* Matrix-style Code Rain - Optimized */}
      {Array.from({ length: 10 }, (_, i) => {
        const chars = ['0', '1', 'AI', 'ML', '01', '10']
        return (
          <motion.div
            key={`matrix-${i}`}
            className="absolute font-mono text-xs text-primary-300/20 font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-5%',
              willChange: 'transform, opacity',
            }}
            animate={{
              y: ['-5%', '105%'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 7 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          >
            {chars[Math.floor(Math.random() * chars.length)]}
          </motion.div>
        )
      })}

      {/* Holographic Scan Lines */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(59, 130, 246, 0.03) 50%)',
          backgroundSize: '100% 4px',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '0% 100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* AI Processing Indicators - Pulsing Rings - Optimized */}
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={`processing-${i}`}
          className="absolute rounded-full border-2 border-primary-400/30"
          style={{
            width: `${60 + i * 40}px`,
            height: `${60 + i * 40}px`,
            left: `${20 + i * 30}%`,
            top: `${25 + (i % 2) * 30}%`,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform, opacity',
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.55, 0.3],
            borderColor: [
              'rgba(59, 130, 246, 0.3)',
              'rgba(147, 51, 234, 0.5)',
              'rgba(59, 130, 246, 0.3)',
            ],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Neural Network Pulse Waves */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 12 }, (_, i) => {
          const centerX = 20 + (i % 4) * 20
          const centerY = 20 + Math.floor(i / 4) * 30
          return (
            <motion.circle
              key={`pulse-${i}`}
              cx={centerX}
              cy={centerY}
              r="5"
              fill="none"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="0.3"
              animate={{
                r: [5, 15, 5],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          )
        })}
      </svg>

      {/* AI Brain Network Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 200 200" preserveAspectRatio="none">
        {Array.from({ length: 15 }, (_, i) => {
          const angle = (i / 15) * Math.PI * 2
          const radius = 40
          const centerX = 50
          const centerY = 50
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          
          return (
            <g key={`brain-node-${i}`}>
              <motion.circle
                cx={x}
                cy={y}
                r="1.5"
                fill="rgba(147, 51, 234, 0.5)"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
              {i < 15 - 1 && (
                <motion.line
                  x1={x}
                  y1={y}
                  x2={centerX + Math.cos((i + 1) / 15 * Math.PI * 2) * radius}
                  y2={centerY + Math.sin((i + 1) / 15 * Math.PI * 2) * radius}
                  stroke="rgba(147, 51, 234, 0.2)"
                  strokeWidth="0.2"
                  animate={{
                    opacity: [0.1, 0.4, 0.1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>

      {/* Quantum Computing Qubits Visualization */}
      {Array.from({ length: 10 }, (_, i) => (
        <motion.div
          key={`qubit-${i}`}
          className="absolute rounded-full"
          style={{
            width: '8px',
            height: '8px',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.4))',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 360],
            x: [0, (Math.random() - 0.5) * 50],
            y: [0, (Math.random() - 0.5) * 50],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* AI Algorithm Visualization - Connected Nodes */}
      <svg className="absolute inset-0 w-full h-full opacity-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 8 }, (_, i) => {
          const x = 10 + (i % 4) * 25
          const y = 15 + Math.floor(i / 4) * 35
          return (
            <g key={`algo-node-${i}`}>
              <motion.circle
                cx={x}
                cy={y}
                r="2"
                fill="rgba(34, 197, 94, 0.6)"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
              {i > 0 && (
                <motion.line
                  x1={x}
                  y1={y}
                  x2={10 + ((i - 1) % 4) * 25}
                  y2={15 + Math.floor((i - 1) / 4) * 35}
                  stroke="rgba(34, 197, 94, 0.3)"
                  strokeWidth="0.2"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
