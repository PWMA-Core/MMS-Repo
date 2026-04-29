import { RegistrationGuestForm } from '@/components/forms/registration-guest-form'

export function RegisterGuestPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-10">
        <div className="label-small mb-3">Events only</div>
        <h1 className="title-large">Guest registration</h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          Limited access for event registration. You can convert to full member later.
          HKID is optional at this stage.
        </p>
      </div>

      <RegistrationGuestForm />
    </div>
  )
}
