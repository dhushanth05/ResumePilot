import { Brain, Search, Target, Award, FileText } from 'lucide-react'

export default function HowWeCalculateSection() {
  const calculations = [
    {
      icon: Brain,
      title: "Semantic Context Analysis",
      description: "AI understands the meaning behind your skills and experience, not just keywords."
    },
    {
      icon: Search,
      title: "Keyword Density Matching",
      description: "Optimal keyword frequency analysis for ATS systems without overstuffing."
    },
    {
      icon: Target,
      title: "Skill Relevance Weighting",
      description: "Prioritizes skills based on job requirements and industry standards."
    },
    {
      icon: Award,
      title: "Experience Scoring Algorithm",
      description: "Evaluates experience depth and relevance using machine learning models."
    },
    {
      icon: FileText,
      title: "ATS Formatting Evaluation",
      description: "Checks resume structure, readability, and ATS compatibility factors."
    }
  ]

  return (
    <section id="how-we-calculate" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🔬 How ResumePilot Calculates Match Scores
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Built on intelligent multi-factor analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {calculations.map((calc, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:scale-[1.02] hover:bg-white/10 transition-all duration-300 group text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <calc.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {calc.title}
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {calc.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
