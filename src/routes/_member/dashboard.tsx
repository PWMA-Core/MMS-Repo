import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentProfile } from '@/hooks/use-user'

export function MemberDashboardPage() {
  const { data: profile, isLoading } = useCurrentProfile()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome{profile?.legal_name ? `, ${profile.legal_name}` : ''}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account status</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : profile?.account_status ?? 'Unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {profile?.account_status === 'pending_pwma_approval'
              ? 'Your account is awaiting PWMA admin approval. You will be notified by email.'
              : 'Your account is active.'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              CPWP and CPWPA application management.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No applications yet.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
