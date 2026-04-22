import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Access your PWMA member account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sign-in form coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
