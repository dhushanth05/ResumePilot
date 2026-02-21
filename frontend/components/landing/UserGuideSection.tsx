import { BookOpen, Target, Search, BarChart3, TrendingUp, Lightbulb } from 'lucide-react'

export default function UserGuideSection() {
  const guides = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of ResumePilot and set up your account for success.",
      buttonText: "View Guide"
    },
    {
      icon: Target,
      title: "Understanding ATS Score",
      description: "Master how ATS scoring works and what recruiters look for.",
      buttonText: "View Guide"
    },
    {
      icon: Search,
      title: "Skill Gap Analysis",
      description: "Identify and address missing skills in your resume effectively.",
      buttonText: "View Guide"
    },
    {
      icon: BarChart3,
      title: "Resume Comparison",
      description: "Compare different versions to find your optimal resume format.",
      buttonText: "View Guide"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Navigate your performance metrics and track improvements.",
      buttonText: "View Guide"
    },
    {
      icon: Lightbulb,
      title: "Pro Optimization Tips",
      description: "Advanced techniques to maximize your resume's impact.",
      buttonText: "View Guide"
    }
  ]

  return (
    <section id="user-guide" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📘 Learn How to Use ResumePilot Like a Pro
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Step-by-step guidance to maximize your results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:scale-[1.02] hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <guide.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {guide.title}
              </h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                {guide.description}
              </p>
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 transform hover:scale-[1.02]">
                {guide.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
