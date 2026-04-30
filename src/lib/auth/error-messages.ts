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
  messageZh: string
}

export function mapAuthError(error: unknown): FriendlyAuthError {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message ?? '')
        : String(error ?? '')
  const msg = raw.toLowerCase()

  if (msg.includes('email not confirmed')) {
    return {
      code: 'email_not_confirmed',
      message:
        'Please verify your email before signing in. Check your inbox or use Resend below.',
      messageZh: '請先核實電郵後再登入。查閱收件箱或按下方「重新發送」。',
    }
  }
  if (msg.includes('invalid login credentials')) {
    return {
      code: 'invalid_credentials',
      message: 'Wrong email or password. Try again or use Forgot password.',
      messageZh: '電郵或密碼錯誤。請再試或使用「忘記密碼」。',
    }
  }
  if (msg.includes('user already registered') || msg.includes('user_already_exists')) {
    return {
      code: 'user_already_exists',
      message: 'This email is already registered. Sign in or use Forgot password.',
      messageZh: '此電郵已註冊。請登入或使用「忘記密碼」。',
    }
  }
  if (msg.includes('duplicate') && msg.includes('hkid')) {
    return {
      code: 'duplicate_hkid',
      message: 'HKID already registered. Sign in or contact support.',
      messageZh: '此 HKID 已註冊。請登入或聯絡支援。',
    }
  }
  if (msg.includes('duplicate') && msg.includes('email')) {
    return {
      code: 'duplicate_email',
      message: 'Email already registered. Sign in or use Forgot password.',
      messageZh: '此電郵已註冊。請登入或使用「忘記密碼」。',
    }
  }
  if (msg.includes('rate limit')) {
    return {
      code: 'rate_limited',
      message: 'Too many attempts. Please wait a moment and try again.',
      messageZh: '嘗試次數過多。請稍候再試。',
    }
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return {
      code: 'weak_password',
      message:
        'Password is too weak. Use at least 8 characters with a mix of letters and numbers.',
      messageZh: '密碼強度不足。請使用至少 8 個字元，包含字母同數字。',
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
      messageZh: '核實連結已過期。請重新申請。',
    }
  }

  return {
    code: 'unknown',
    message: raw || 'Something went wrong. Please try again.',
    messageZh: raw || '發生錯誤，請再試。',
  }
}

export function isUnverifiedEmailError(error: unknown): boolean {
  return mapAuthError(error).code === 'email_not_confirmed'
}
