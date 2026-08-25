import { createFileRoute } from '@tanstack/react-router'
import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { Shelters } from '@/components/landing/Shelters'
import { Features } from '@/components/landing/Features'
import { Compliance } from '@/components/landing/Compliance'
import { Mission } from '@/components/landing/Mission'
import { ContactSection } from '@/components/landing/ContactSection'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRedirectLoggedInUser } from '@/hooks/useRedirectLoggedInUser'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const isRedirectingToPanel = useRedirectLoggedInUser()

  if (isRedirectingToPanel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <Hero />
        <Shelters />
        <Features />
        <Compliance />
        <Mission />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  )
}
