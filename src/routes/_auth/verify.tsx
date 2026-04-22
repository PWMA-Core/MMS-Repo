import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function VerifyPage() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to your inbox. Click it to confirm your
            account, then wait for PWMA to approve your registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t get the email? Check your spam folder, or resend after
            one minute.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
