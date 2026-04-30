import { RegistrationGuestForm } from '@/components/forms/registration-guest-form'
import { Tr } from '@/components/ui/tr'

export function RegisterGuestPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Events only" zh="只限活動" />
        </div>
        <h1 className="title-large">
          <Tr en="Guest registration" zh="訪客註冊" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          <Tr
            en="Limited access for event registration. You can convert to full member later. HKID is optional at this stage."
            zh="只可參加活動，往後可升級為正式會員。此階段 HKID 為選填。"
          />
        </p>
      </div>

      <RegistrationGuestForm />
    </div>
  )
}
