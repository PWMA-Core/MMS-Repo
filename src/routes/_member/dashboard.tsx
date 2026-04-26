import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCurrentProfile } from '@/hooks/use-user'
import { ACCOUNT_STATUS_LABELS } from '@/lib/constants/account-statuses'

export function MemberDashboardPage() {
  const { data: profile, isLoading } = useCurrentProfile()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome{profile?.legal_name ? `, ${profile.legal_name}` : ''}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account status</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : profile?.account_status
                  ? ACCOUNT_STATUS_LABELS[profile.account_status]
                  : 'Unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {profile?.account_status === 'pending_pwma_approval'
              ? 'Your account is awaiting PWMA admin approval. You will be notified by email.'
              : 'Your account is active.'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>CPWP and CPWPA application management.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            No applications yet.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annual renewal</CardTitle>
            <CardDescription>Confirm profile and file renewal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link to="/renewal">Start renewal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
