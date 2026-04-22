import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegistrationFirmAdminForm } from '@/components/forms/registration-firm-admin-form'

export function RegisterFirmAdminPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Register as firm admin</CardTitle>
          <CardDescription>
            Create your firm, then your admin profile. Firm admins manage
            employee memberships and can submit bulk applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationFirmAdminForm />
        </CardContent>
      </Card>
    </div>
  )
}
