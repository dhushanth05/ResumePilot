import { TrendingUp, Target, AlertCircle } from 'lucide-react'

export default function InsideDashboardSection() {
  return (
    <section id="dashboard-preview" className="py-24 bg-slate-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📊 Inside Your Analytics Dashboard
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Powerful insights that help you continuously improve.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Score Trend Overview Card */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-slate-800/50 hover:to-slate-700/30 hover:border-white/20 transition-all duration-300 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Score Trend Overview</h3>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            
            {/* Mock Line Graph */}
            <div className="h-32 mb-4 relative">
              <div className="absolute inset-0 flex items-end justify-between">
                <div className="w-8 h-16 bg-gradient-to-t from-blue-500/30 to-blue-400 rounded-t"></div>
                <div className="w-8 h-20 bg-gradient-to-t from-blue-500/40 to-blue-400 rounded-t"></div>
                <div className="w-8 h-24 bg-gradient-to-t from-blue-500/50 to-blue-400 rounded-t"></div>
                <div className="w-8 h-28 bg-gradient-to-t from-blue-500/60 to-blue-400 rounded-t"></div>
                <div className="w-8 h-32 bg-gradient-to-t from-green-500 to-green-400 rounded-t"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Last 30 days</span>
              <span className="text-green-400 font-semibold">+12% Improvement</span>
            </div>
          </div>

          {/* Skill Radar Overview Card */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-slate-800/50 hover:to-slate-700/30 hover:border-white/20 transition-all duration-300 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Skill Radar Overview</h3>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            
            {/* Mock Radar Chart */}
            <div className="h-32 mb-4 flex items-center justify-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border border-white/10 rounded-full"></div>
                <div className="absolute inset-2 border border-white/10 rounded-full"></div>
                <div className="absolute inset-4 border border-white/10 rounded-full"></div>
                
                {/* Skill Points */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-xs text-white mt-1 block text-center">85%</span>
                </div>
                <div className="absolute top-1/4 right-0 transform translate-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  <span className="text-xs text-white mt-1 block text-center">72%</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-white mt-1 block text-center">90%</span>
                </div>
                <div className="absolute top-1/4 left-0 transform -translate-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-xs text-white mt-1 block text-center">68%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">JavaScript</span>
                <span className="text-blue-400">85%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Python</span>
                <span className="text-cyan-400">72%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">React</span>
                <span className="text-green-400">90%</span>
              </div>
            </div>
          </div>

          {/* Missing Skills Intelligence Card */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-slate-800/50 hover:to-slate-700/30 hover:border-white/20 transition-all duration-300 shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Missing Skills Intelligence</h3>
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">AWS Services</p>
                  <p className="text-slate-400 text-sm">Cloud infrastructure</p>
                </div>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">High</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">TypeScript</p>
                  <p className="text-slate-400 text-sm">Type safety</p>
                </div>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">Medium</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div>
                  <p className="text-white font-medium">GraphQL</p>
                  <p className="text-slate-400 text-sm">API design</p>
                </div>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Low</span>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-slate-400">3 critical gaps identified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
