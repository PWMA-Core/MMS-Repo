export type AuthErrorCode =
  | 'email_not_confirmed'
  | 'invalid_credentials'
  | 'user_already_exists'
  | 'rate_limited'
  | 'weak_password'
  | 'duplicate_hkid'
  | 'duplicate_email'
  | 'otp_expired'
  | 'unknown'

export type FriendlyAuthError = {
  code: AuthErrorCode
  message: string
}

export function mapAuthError(error: unknown): FriendlyAuthError {
  const raw = error instanceof Error ? error.message : String(error ?? '')
  const msg = raw.toLowerCase()

  if (msg.includes('email not confirmed')) {
    return {
      code: 'email_not_confirmed',
      message:
        'Please verify your email before signing in. Check your inbox or use Resend below.',
    }
  }
  if (msg.includes('invalid login credentials')) {
    return {
      code: 'invalid_credentials',
      message: 'Wrong email or password. Try again or use Forgot password.',
    }
  }
  if (msg.includes('user already registered') || msg.includes('user_already_exists')) {
    return {
      code: 'user_already_exists',
      message: 'This email is already registered. Sign in or use Forgot password.',
    }
  }
  if (msg.includes('duplicate') && msg.includes('hkid')) {
    return {
      code: 'duplicate_hkid',
      message: 'HKID already registered. Sign in or contact support.',
    }
  }
  if (msg.includes('duplicate') && msg.includes('email')) {
    return {
      code: 'duplicate_email',
      message: 'Email already registered. Sign in or use Forgot password.',
    }
  }
  if (msg.includes('rate limit')) {
    return {
      code: 'rate_limited',
      message: 'Too many attempts. Please wait a moment and try again.',
    }
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return {
      code: 'weak_password',
      message:
        'Password is too weak. Use at least 8 characters with a mix of letters and numbers.',
    }
  }
  if (
    msg.includes('expired') ||
    msg.includes('invalid token') ||
    msg.includes('otp_expired')
  ) {
    return {
      code: 'otp_expired',
      message: 'Verification link expired. Please request a new one.',
    }
  }

  return {
    code: 'unknown',
    message: raw || 'Something went wrong. Please try again.',
  }
}

export function isUnverifiedEmailError(error: unknown): boolean {
  return mapAuthError(error).code === 'email_not_confirmed'
}
