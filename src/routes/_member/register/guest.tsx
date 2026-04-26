import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegistrationGuestForm } from '@/components/forms/registration-guest-form'

export function RegisterGuestPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Register as guest</CardTitle>
          <CardDescription>
            Limited access for event registration. You can convert to full
            member later. HKID is optional at this stage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationGuestForm />
        </CardContent>
      </Card>
    </div>
  )
}
