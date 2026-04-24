import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FirmApplicationForm } from '@/components/forms/firm-application-form'

export function ApplyFirmPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Apply to become a member firm</CardTitle>
          <CardDescription>
            For firms that wish to join PWMA. Review by the Executive Committee takes 4 to
            6 weeks. Employees only need individual accounts once the firm is approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FirmApplicationForm />
        </CardContent>
      </Card>
    </div>
  )
}

export function ApplyFirmThanksPage() {
  return (
    <div className="container mx-auto max-w-xl py-20 text-center">
      <h1 className="mb-3 text-2xl font-semibold">Application submitted</h1>
      <p className="text-muted-foreground text-sm">
        We have emailed a confirmation to your contact address. Our team will begin review
        and respond within 4 to 6 weeks.
      </p>
    </div>
  )
}
