import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RegistrationIndividualForm } from '@/components/forms/registration-individual-form'

export function RegisterIndividualPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Register as individual member</CardTitle>
          <CardDescription>
            For CPWP or CPWPA applicants. HKID, legal name, and email are
            required and verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationIndividualForm />
        </CardContent>
      </Card>
    </div>
  )
}
