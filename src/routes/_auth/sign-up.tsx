import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Choose the registration path that matches you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild variant="outline">
            <Link to="/register/individual">Individual member</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register/guest">Guest (events only)</Link>
          </Button>
          <p className="text-muted-foreground pt-3 text-center text-sm">
            Applying on behalf of a firm?{' '}
            <Link to="/apply-firm" className="underline underline-offset-4">
              Submit a firm application
            </Link>
          </p>
          <p className="text-muted-foreground pt-1 text-center text-sm">
            Already a member?{' '}
            <Link to="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
