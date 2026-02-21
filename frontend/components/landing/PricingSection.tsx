import Link from 'next/link'

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 bg-slate-950 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Choose the plan that fits your needs. Start free and upgrade as you grow.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
              <p className="text-slate-300">
                Perfect for getting started with basic resume analysis
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                3 Resume Analyses per month
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Basic ATS Score
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Job Match Percentage
              </li>
            </ul>

            <Link 
              href="/register"
              className="w-full px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all text-center block"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-400/10 backdrop-blur-lg border-2 border-blue-500 rounded-2xl p-8 hover:from-blue-500/20 hover:to-cyan-400/20 transition-all relative ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
              <p className="text-slate-300">
                For serious job seekers who want maximum results
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Unlimited Resume Analyses
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Advanced AI Insights
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Resume Tracking Dashboard
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Skill Gap Analysis
              </li>
              <li className="flex items-center text-slate-300">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Priority Support
              </li>
            </ul>

            <Link 
              href="/register"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all text-center block"
            >
              Start Pro Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
