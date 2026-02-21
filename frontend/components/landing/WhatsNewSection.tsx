import { Brain, TrendingUp, Zap, BarChart3, Target, Activity } from 'lucide-react'

export default function WhatsNewSection() {
  const features = [
    {
      icon: Brain,
      title: "Resume Comparison Engine",
      description: "Compare multiple resumes side-by-side with advanced AI analysis."
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive overview and comparison analytics for better insights."
    },
    {
      icon: Zap,
      title: "Semantic AI Matching",
      description: "Context-aware matching that understands skills beyond keywords."
    },
    {
      icon: Activity,
      title: "Real-Time Match Updates",
      description: "Instant score updates as you refine your resume content."
    },
    {
      icon: Target,
      title: "Enhanced Skill Categorization",
      description: "Better organization and classification of technical and soft skills."
    },
    {
      icon: TrendingUp,
      title: "Performance Trend Tracking",
      description: "Monitor your resume improvement over time with detailed metrics."
    }
  ]

  return (
    <section id="whats-new" className="py-24 bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🚀 What's New in ResumePilot
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Recent improvements and feature upgrades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-slate-800/50 hover:to-slate-700/30 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
