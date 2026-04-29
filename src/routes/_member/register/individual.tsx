import { RegistrationIndividualForm } from '@/components/forms/registration-individual-form'
import { Tr } from '@/components/ui/tr'

export function RegisterIndividualPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Step 1 of 3" zh="第 1 步 / 共 3 步" />
        </div>
        <h1 className="title-large">
          <Tr en="Individual member" zh="個人會員" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          <Tr
            en="For CPWP or CPWPA applicants. HKID, legal name, and email are required and verified."
            zh="供 CPWP 或 CPWPA 申請人使用。HKID、法定全名同電郵為必填並會核實。"
          />
        </p>
      </div>

      <RegistrationIndividualForm />
    </div>
  )
}
