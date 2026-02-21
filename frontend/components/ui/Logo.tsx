import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  variant?: 'light' | 'dark'
}

export default function Logo({ size = 'md', className = '', showText = true, variant = 'light' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7', 
    lg: 'w-9 h-9'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  const textColors = variant === 'dark' 
    ? 'text-slate-300' 
    : 'text-slate-700'

  return (
    <Link href="/" className={`flex items-center space-x-2 group ${className}`}>
      {/* Paper Plane Icon */}
      <svg 
        className={`${sizeClasses[size]} transition-transform group-hover:scale-105`} 
        viewBox="0 0 24 24" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E7490" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <path 
          d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" 
          stroke="url(#planeGradient)" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path 
          d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12.01" 
          stroke="url(#planeGradient)" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path 
          d="M16 22L12 18L8 22" 
          stroke="url(#planeGradient)" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Logo Text */}
      {showText && (
        <span className={`${textSizes[size]} font-semibold`}>
          <span className={textColors}>Resume</span>
          <span className="ml-1 font-bold bg-gradient-to-r from-cyan-500 to-teal-600 bg-clip-text text-transparent">
            Pilot
          </span>
        </span>
      )}
    </Link>
  )
}
