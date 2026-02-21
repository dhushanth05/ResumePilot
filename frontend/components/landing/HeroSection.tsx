'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [matchScore, setMatchScore] = useState(0)
  const [reactSkill, setReactSkill] = useState(0)
  const [pythonSkill, setPythonSkill] = useState(0)
  const [sqlSkill, setSqlSkill] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setMatchScore((prev) => {
          if (prev < 82) return prev + 2
          clearInterval(interval)
          return 82
        })
      }, 30)

      const skillTimer = setInterval(() => {
        setReactSkill((prev) => {
          if (prev < 95) return prev + 5
          return 95
        })
        setPythonSkill((prev) => {
          if (prev < 88) return prev + 5
          return 88
        })
        setSqlSkill((prev) => {
          if (prev < 72) return prev + 5
          return 72
        })
      }, 50)

      return () => {
        clearInterval(interval)
        clearInterval(skillTimer)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 to-blue-950 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Land Interviews <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">3x Faster</span> with ResumePilot
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
                Transform your resume into an interview magnet. Our AI analyzes your resume against job descriptions, optimizes for ATS systems, and helps you stand out from thousands of applicants.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all transform hover:scale-105 text-center"
              >
                Start Free Trial
              </Link>
              <Link 
                href="#how-it-works"
                className="px-8 py-4 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all text-center"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>10,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>95% Success Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>500+ Companies</span>
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Dashboard Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-float">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Resume Analysis</h3>
                  <span className="text-xs text-slate-400">Live Preview</span>
                </div>

                {/* Animated Match Score */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Job Match Score</span>
                    <span className="text-2xl font-bold text-green-400">{matchScore}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${matchScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Enhanced Skills List with Progress Bars */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-slate-300 text-sm mb-3">Key Skills Matched</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">React.js</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-400 h-1.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${reactSkill}%` }}
                          ></div>
                        </div>
                        <span className="text-green-400 text-xs">{reactSkill}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Python</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-400 h-1.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${pythonSkill}%` }}
                          ></div>
                        </div>
                        <span className="text-green-400 text-xs">{pythonSkill}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">SQL</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${sqlSkill}%` }}
                          ></div>
                        </div>
                        <span className="text-yellow-400 text-xs">{sqlSkill}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Skills List */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-slate-300 text-sm mb-3">Missing Skills</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-slate-400 text-sm">Docker</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-slate-400 text-sm">AWS</span>
                    </div>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 text-sm mb-2">Quick Improvements</h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• Add quantifiable achievements</li>
                    <li>• Include more relevant keywords</li>
                    <li>• Optimize formatting for ATS</li>
                  </ul>
                </div>

                {/* ATS Score */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">ATS Optimization</span>
                    <span className="text-lg font-semibold text-blue-400">Good</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
