export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Upload Resume",
      description: "Upload your current resume in PDF, DOC, or DOCX format."
    },
    {
      number: "2", 
      title: "Add Job Description",
      description: "Paste the job description you're targeting for personalized insights."
    },
    {
      number: "3",
      title: "Get Match Score", 
      description: "Receive instant AI-powered analysis with match scores and suggestions."
    },
    {
      number: "4",
      title: "Improve & Re-run",
      description: "Apply AI recommendations and re-run analysis to see improved scores."
    }
  ]

  return (
    <section id="how-it-works" className="py-28 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Get your resume optimized in four simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step Number Circle */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto group-hover:scale-110 transition-transform">
                  {step.number}
                </div>
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-cyan-400/50" style={{ width: '200%', marginLeft: '50%' }}></div>
                )}
              </div>

              {/* Step Content */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Connection Lines */}
        <div className="md:hidden mt-8 space-y-4">
          {steps.slice(0, -1).map((_, index) => (
            <div key={index} className="flex justify-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500/50 to-cyan-400/50"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
