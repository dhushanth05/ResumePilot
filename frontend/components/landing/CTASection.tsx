import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-28 bg-gradient-to-br from-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Optimize Your Career?
        </h2>
        <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
          Start optimizing your resume today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link 
            href="/register"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all transform hover:scale-105 text-center"
          >
            Start Your Free Trial
          </Link>
        </div>

        <p className="text-white/60 text-sm">
          No credit card required.
        </p>

        {/* Social Proof */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-slate-400 text-sm mb-4">
            Trusted by professionals from leading companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-slate-400 font-semibold">Google</div>
            <div className="text-slate-400 font-semibold">Microsoft</div>
            <div className="text-slate-400 font-semibold">Amazon</div>
            <div className="text-slate-400 font-semibold">Meta</div>
            <div className="text-slate-400 font-semibold">Apple</div>
          </div>
        </div>
      </div>
    </section>
  )
}
