'use client'

import { useEffect, useState } from 'react'

export default function MetricsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)
  const [count3, setCount3] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('metrics-section')
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      const timer1 = setTimeout(() => {
        const interval = setInterval(() => {
          setCount1((prev) => {
            if (prev < 1200) return prev + 50
            clearInterval(interval)
            return 1200
          })
        }, 30)
      }, 200)

      const timer2 = setTimeout(() => {
        const interval = setInterval(() => {
          setCount2((prev) => {
            if (prev < 42) return prev + 2
            clearInterval(interval)
            return 42
          })
        }, 50)
      }, 400)

      const timer3 = setTimeout(() => {
        const interval = setInterval(() => {
          setCount3((prev) => {
            if (prev < 3.2) return prev + 0.2
            clearInterval(interval)
            return 3.2
          })
        }, 100)
      }, 600)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isVisible])

  const metrics = [
    {
      value: `${count1}+`,
      label: "Resumes Analyzed",
      description: "AI-powered resume optimization"
    },
    {
      value: `+${count2}%`,
      label: "Interview Callback Rate",
      description: "Average improvement for our users"
    },
    {
      value: `${count3}x`,
      label: "Faster Resume Optimization",
      description: "Compared to manual methods"
    }
  ]

  return (
    <section id="metrics-section" className={`py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/5 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                {metric.value}
              </div>
              <div className="text-xl font-semibold text-white mb-2">
                {metric.label}
              </div>
              <div className="text-sm text-white/60">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
