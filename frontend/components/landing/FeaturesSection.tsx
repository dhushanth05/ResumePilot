export default function FeaturesSection() {
  const features = [
    {
      title: "ResumePilot Analysis",
      description: "Advanced AI analyzes your resume structure, content, and formatting.",
      icon: "🤖"
    },
    {
      title: "ATS Score",
      description: "Get real-time ATS compatibility scores to pass automated screening.",
      icon: "📊"
    },
    {
      title: "Job Match %",
      description: "Instantly see how well your resume matches specific job descriptions.",
      icon: "🎯"
    },
    {
      title: "Skill Gap Detection",
      description: "Identify missing skills and qualifications for your target roles.",
      icon: "🔍"
    },
    {
      title: "Resume Tracking",
      description: "Track multiple resume versions and their application performance.",
      icon: "📈"
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive analytics showing resume performance and success rates.",
      icon: "📋"
    }
  ]

  return (
    <section id="features" className="py-28 bg-slate-950 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful AI Features
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Everything you need to optimize your resume and land your dream job.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
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
