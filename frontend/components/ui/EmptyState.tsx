import { FileText, BarChart3, Upload } from 'lucide-react'

interface EmptyStateProps {
  type: 'resumes' | 'analytics'
  onAction?: () => void
}

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const configs = {
    resumes: {
      icon: FileText,
      heading: "No resumes yet",
      subtext: "Upload your first resume to get started.",
      buttonText: "Upload Resume",
      bgColor: "bg-white/5"
    },
    analytics: {
      icon: BarChart3,
      heading: "No data available",
      subtext: "Run analysis to see insights.",
      buttonText: "Run Analysis",
      bgColor: "bg-white/5"
    }
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} rounded-xl p-12 text-center`}>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
        <Icon className="h-8 w-8 text-white/60" />
      </div>
      
      <h3 className="mb-3 text-xl font-semibold text-white">
        {config.heading}
      </h3>
      
      <p className="mb-8 text-white/70 max-w-sm mx-auto">
        {config.subtext}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all transform hover:scale-105"
        >
          {type === 'resumes' ? (
            <Upload className="h-4 w-4" />
          ) : (
            <BarChart3 className="h-4 w-4" />
          )}
          {config.buttonText}
        </button>
      )}
    </div>
  )
}
