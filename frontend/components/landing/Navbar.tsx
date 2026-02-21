'use client'

import Link from 'next/link'
import { useState } from 'react'
import Logo from '../ui/Logo'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" variant="dark" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="#whats-new" className="text-slate-300 hover:text-white transition-colors">
                What's New
              </Link>
              <Link href="#user-guide" className="text-slate-300 hover:text-white transition-colors">
                Guide
              </Link>
              <Link href="#dashboard-preview" className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="#how-we-calculate" className="text-slate-300 hover:text-white transition-colors">
                Technology
              </Link>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login"
              className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/register"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <div className="flex flex-col space-y-3">
              <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="#whats-new" className="text-slate-300 hover:text-white transition-colors">
                What's New
              </Link>
              <Link href="#user-guide" className="text-slate-300 hover:text-white transition-colors">
                Guide
              </Link>
              <Link href="#dashboard-preview" className="text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="#how-we-calculate" className="text-slate-300 hover:text-white transition-colors">
                Technology
              </Link>
            </div>
            <div className="flex flex-col space-y-3 pt-4 border-t border-slate-800">
              <Link 
                href="/login"
                className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-800 hover:border-slate-500 hover:text-white transition-all text-center"
              >
                Sign In
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all transform hover:scale-105 text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
