import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <section className="container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        PWMA Membership Management System
      </h1>
      <p className="max-w-2xl text-muted-foreground">
        Register for CPWP or CPWPA certification, manage your member profile,
        and track applications. The unified portal for the Private Wealth
        Management Association of Hong Kong.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/sign-up">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </div>
    </section>
  )
}
