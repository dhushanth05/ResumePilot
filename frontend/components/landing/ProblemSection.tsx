export default function ProblemSection() {
  const problems = [
    {
      icon: "🚫",
      title: "ATS Systems Reject Resumes",
      description: "75% of resumes are filtered out before human review due to formatting issues."
    },
    {
      icon: "🔍",
      title: "Missing Keywords Reduce Visibility",
      description: "Most resumes lack the specific keywords that recruiters are searching for."
    },
    {
      icon: "📊",
      title: "No Clarity on Skill",
      description: "Job seekers don't know which skills they're missing for target roles."
    },
    {
      icon: "🎯",
      title: "No Match Scoring Before Applying",
      description: "Applying blindly wastes time and reduces interview success rates."
    }
  ]

  return (
    <section className="py-28 bg-slate-950 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Most Resumes Get Rejected
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            The job application process is broken. Here's what's holding you back.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex items-center mb-3">
                <div className="text-2xl group-hover:scale-110 transition-transform">
                  {problem.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {problem.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
