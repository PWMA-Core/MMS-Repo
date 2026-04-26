import { Outlet, isRouteErrorResponse, useRouteError, Link } from 'react-router-dom'
import { useSessionSync } from '@/hooks/use-session'
import { Toaster } from '@/components/ui/sonner'

export function Root() {
  useSessionSync()
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  )
}

export function RootErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : 'Unknown error'

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="mb-2 text-2xl font-semibold">Something went wrong</h1>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <Link to="/" className="text-sm underline underline-offset-4">
          Go home
        </Link>
      </div>
    </div>
  )
}
