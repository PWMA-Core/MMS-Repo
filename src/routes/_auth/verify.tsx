import { Link } from 'react-router-dom'

export function VerifyPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">Almost there</div>
        <h1 className="title-large">Check your email</h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          We sent a verification link to your inbox. Click it to confirm your account,
          then wait for PWMA to approve your registration.
        </p>
      </div>

      <div className="border-foreground/15 mb-6 rounded-2xl border p-5">
        <div className="flex items-start gap-3">
          <span className="status-square status-hatched mt-1.5" />
          <div className="flex-1">
            <p className="mb-1 text-sm font-medium">No email yet?</p>
            <p className="text-foreground/65 text-xs leading-relaxed">
              Check your spam folder. If still nothing after a minute, try signing in
              again to trigger a resend prompt.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm">
        <Link
          to="/sign-in"
          className="text-foreground/65 hover:text-foreground underline underline-offset-4"
        >
          Back to sign-in
        </Link>
      </p>
    </div>
  )
}
