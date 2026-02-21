export default function DifferentSection() {
  const differentiators = [
    {
      title: "Semantic AI Matching",
      description: "Our AI understands context and meaning, not just keywords. Get accurate matching based on skills and experience.",
      icon: "🧠"
    },
    {
      title: "Multi-Version Resume Tracking",
      description: "Track multiple resume versions and their performance. Optimize based on real data.",
      icon: "📊"
    },
    {
      title: "Real-Time Job Matching",
      description: "Get instant match scores as you browse jobs. Know your chances before applying.",
      icon: "⚡"
    },
    {
      title: "Enterprise-Level Analytics",
      description: "Advanced insights and trends that help you understand the job market.",
      icon: "📈"
    }
  ]

  return (
    <section className="py-28 bg-slate-950 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why ResumePilot Is Different
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            We're not just another resume checker. Our technology sets us apart.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {differentiators.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-blue-500/20 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/40 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                  {item.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
