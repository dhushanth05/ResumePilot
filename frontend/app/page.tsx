import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import MetricsSection from '@/components/landing/MetricsSection'
import ProblemSection from '@/components/landing/ProblemSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PricingSection from '@/components/landing/PricingSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import WhatsNewSection from '@/components/landing/WhatsNewSection'
import UserGuideSection from '@/components/landing/UserGuideSection'
import InsideDashboardSection from '@/components/landing/InsideDashboardSection'
import HowWeCalculateSection from '@/components/landing/HowWeCalculateSection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <ProblemSection />
      <WhatsNewSection />
      <InsideDashboardSection />
      <HowWeCalculateSection />
      <UserGuideSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}

