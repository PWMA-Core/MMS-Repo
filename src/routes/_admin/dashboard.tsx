import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

export function AdminDashboardPage() {
  const pendingCounts = useQuery({
    queryKey: ['admin', 'dashboard-counts'],
    queryFn: async () => {
      const [approvals, changes, firmApps] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('account_status', 'pending_pwma_approval'),
        supabase
          .from('profile_change_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('firm_applications')
          .select('id', { count: 'exact', head: true })
          .in('status', ['submitted', 'pending_director_review', 'pending_approval']),
      ])
      return {
        approvals: approvals.count ?? 0,
        changes: changes.count ?? 0,
        firmApps: firmApps.count ?? 0,
      }
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">PWMA admin dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
            <CardDescription>
              {pendingCounts.data
                ? `${pendingCounts.data.approvals} awaiting review`
                : 'Pending member registrations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/approvals">Open queue</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile changes</CardTitle>
            <CardDescription>
              {pendingCounts.data
                ? `${pendingCounts.data.changes} awaiting review`
                : 'Critical-field change requests'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/profile-changes">Open queue</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Firm applications</CardTitle>
            <CardDescription>
              {pendingCounts.data
                ? `${pendingCounts.data.firmApps} active`
                : 'Member firm applications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/firm-applications">Open queue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
