import { RegistrationIndividualForm } from '@/components/forms/registration-individual-form'

export function RegisterIndividualPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-10">
        <div className="label-small mb-3">Step 1 of 3</div>
        <h1 className="title-large">Individual member</h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          For CPWP or CPWPA applicants. HKID, legal name, and email are required and
          verified.
        </p>
      </div>

      <RegistrationIndividualForm />
    </div>
  )
}
