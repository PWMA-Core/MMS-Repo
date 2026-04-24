import { describe, expect, it } from 'vitest'
import { mapAuthError, isUnverifiedEmailError } from '@/lib/auth/error-messages'

describe('mapAuthError', () => {
  it('maps Email not confirmed to email_not_confirmed code', () => {
    const r = mapAuthError(new Error('Email not confirmed'))
    expect(r.code).toBe('email_not_confirmed')
    expect(r.message).toMatch(/verify your email/i)
  })

  it('maps Invalid login credentials to invalid_credentials', () => {
    const r = mapAuthError(new Error('Invalid login credentials'))
    expect(r.code).toBe('invalid_credentials')
    expect(r.message).toMatch(/wrong email or password/i)
  })

  it('maps User already registered to user_already_exists', () => {
    const r = mapAuthError(new Error('User already registered'))
    expect(r.code).toBe('user_already_exists')
    expect(r.message).toMatch(/already registered/i)
  })

  it('maps duplicate hkid to duplicate_hkid', () => {
    const r = mapAuthError(
      new Error('duplicate key value violates unique constraint "profiles_hkid_key"'),
    )
    expect(r.code).toBe('duplicate_hkid')
    expect(r.message).toMatch(/HKID already registered/i)
  })

  it('maps duplicate email to duplicate_email', () => {
    const r = mapAuthError(
      new Error('duplicate key value violates unique constraint "profiles_email_key"'),
    )
    expect(r.code).toBe('duplicate_email')
    expect(r.message).toMatch(/already registered/i)
  })

  it('maps email rate limit to rate_limited', () => {
    const r = mapAuthError(new Error('email rate limit exceeded'))
    expect(r.code).toBe('rate_limited')
    expect(r.message).toMatch(/too many attempts/i)
  })

  it('maps weak password to weak_password', () => {
    const r = mapAuthError(new Error('Password should be at least 6 characters'))
    expect(r.code).toBe('weak_password')
    expect(r.message).toMatch(/too weak/i)
  })

  it('maps expired token to otp_expired', () => {
    const r = mapAuthError(new Error('Email link has expired'))
    expect(r.code).toBe('otp_expired')
    expect(r.message).toMatch(/expired/i)
  })

  it('falls back to unknown with raw message', () => {
    const r = mapAuthError(new Error('something obscure happened'))
    expect(r.code).toBe('unknown')
    expect(r.message).toBe('something obscure happened')
  })

  it('handles null/undefined gracefully', () => {
    expect(mapAuthError(null).code).toBe('unknown')
    expect(mapAuthError(undefined).code).toBe('unknown')
    expect(mapAuthError(null).message).toMatch(/something went wrong/i)
  })

  it('handles non-Error inputs', () => {
    const r = mapAuthError('Email not confirmed')
    expect(r.code).toBe('email_not_confirmed')
  })
})

describe('isUnverifiedEmailError', () => {
  it('returns true for Email not confirmed', () => {
    expect(isUnverifiedEmailError(new Error('Email not confirmed'))).toBe(true)
  })

  it('returns false for invalid credentials', () => {
    expect(isUnverifiedEmailError(new Error('Invalid login credentials'))).toBe(false)
  })
})
