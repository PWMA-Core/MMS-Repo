import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">PWMA admin dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
            <CardDescription>Pending member registrations</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            See Approvals tab.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile changes</CardTitle>
            <CardDescription>Critical-field change requests</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            See Profile changes tab.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>CPWP and CPWPA review queue</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming soon.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
