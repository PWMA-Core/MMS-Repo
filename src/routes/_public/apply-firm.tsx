import { Link } from 'react-router-dom'
import { FirmApplicationForm } from '@/components/forms/firm-application-form'

export function ApplyFirmPage() {
  return (
    <section className="relative">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <div className="relative z-10 mx-auto max-w-[900px] px-8 py-16">
        <div className="mb-12">
          <div className="label-small mb-3">WF1 application</div>
          <h1 className="title-large mb-4">Apply as a member firm</h1>
          <p className="text-foreground/65 max-w-xl text-sm leading-relaxed">
            For firms that wish to join PWMA. Review by the Executive Committee takes 4 to
            6 weeks. Employees only need individual accounts once the firm is approved.
          </p>
        </div>

        <FirmApplicationForm />
      </div>
    </section>
  )
}

export function ApplyFirmThanksPage() {
  return (
    <section className="relative">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <div className="relative z-10 mx-auto max-w-xl px-8 py-32 text-center">
        <div className="mb-8 flex justify-center">
          <span className="status-square status-solid h-6 w-6" />
        </div>
        <div className="label-small mb-3">Submitted</div>
        <h1 className="title-large mb-4">Application received</h1>
        <p className="text-foreground/65 text-sm leading-relaxed">
          We have emailed a confirmation to your contact address. Our team will begin
          review and respond within 4 to 6 weeks.
        </p>
        <div className="pt-10">
          <Link to="/" className="nexus-pill-outline">
            <i className="ph ph-house" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}
