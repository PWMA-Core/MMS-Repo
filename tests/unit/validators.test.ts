import { describe, it, expect } from 'vitest'
import {
  registerIndividualSchema,
  registerFirmAdminSchema,
  registerGuestSchema,
} from '@/lib/validators/registration'
import { signInSchema, signUpSchema } from '@/lib/validators/auth'
import { profileChangeRequestSchema } from '@/lib/validators/profile'

const validIndividual = {
  hkid: 'A1234563',
  legal_name: 'Test Member',
  date_of_birth: '1990-01-01',
  email: 'test@example.com',
  phone: '+85212345678',
  address: '1 Central Plaza, HK',
  password: 'secret123',
  confirm_password: 'secret123',
}

describe('registerIndividualSchema', () => {
  it('accepts a valid registration', () => {
    expect(registerIndividualSchema.safeParse(validIndividual).success).toBe(
      true
    )
  })

  it('rejects invalid HKID', () => {
    const r = registerIndividualSchema.safeParse({
      ...validIndividual,
      hkid: 'A1234567',
    })
    expect(r.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const r = registerIndividualSchema.safeParse({
      ...validIndividual,
      email: 'not-an-email',
    })
    expect(r.success).toBe(false)
  })

  it('rejects missing legal_name', () => {
    const r = registerIndividualSchema.safeParse({
      ...validIndividual,
      legal_name: '',
    })
    expect(r.success).toBe(false)
  })

  it('rejects malformed DOB', () => {
    const r = registerIndividualSchema.safeParse({
      ...validIndividual,
      date_of_birth: '01/01/1990',
    })
    expect(r.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const r = registerIndividualSchema.safeParse({
      ...validIndividual,
      confirm_password: 'different',
    })
    expect(r.success).toBe(false)
  })

  it('rejects short password', () => {
    const r = registerIndividualSchema.safeParse({
      ...validIndividual,
      password: 'short',
      confirm_password: 'short',
    })
    expect(r.success).toBe(false)
  })
})

describe('registerFirmAdminSchema', () => {
  const validFirm = {
    firm_name: 'HSBC',
    business_registration_number: 'BR12345',
    firm_contact_email: 'contact@hsbc.com',
    firm_contact_phone: '+85229999999',
    firm_address: '1 Queens Road',
    ...validIndividual,
  }

  it('accepts a valid firm admin registration', () => {
    expect(registerFirmAdminSchema.safeParse(validFirm).success).toBe(true)
  })

  it('rejects missing firm name', () => {
    const r = registerFirmAdminSchema.safeParse({ ...validFirm, firm_name: '' })
    expect(r.success).toBe(false)
  })
})

describe('registerGuestSchema', () => {
  it('accepts guest without HKID', () => {
    const input = {
      legal_name: 'Guest User',
      email: 'guest@example.com',
      phone: '+85212345678',
      password: 'secret123',
      confirm_password: 'secret123',
    }
    expect(registerGuestSchema.safeParse(input).success).toBe(true)
  })

  it('rejects mismatched passwords for guest', () => {
    const input = {
      legal_name: 'Guest',
      email: 'guest@example.com',
      phone: '+85212345678',
      password: 'secret123',
      confirm_password: 'other',
    }
    expect(registerGuestSchema.safeParse(input).success).toBe(false)
  })
})

describe('auth schemas', () => {
  it('signInSchema accepts valid credentials', () => {
    expect(
      signInSchema.safeParse({ email: 'a@b.com', password: 'x' }).success
    ).toBe(true)
  })

  it('signInSchema rejects invalid email', () => {
    expect(
      signInSchema.safeParse({ email: 'bad', password: 'x' }).success
    ).toBe(false)
  })

  it('signUpSchema enforces password confirmation', () => {
    expect(
      signUpSchema.safeParse({
        email: 'a@b.com',
        password: 'secret123',
        confirmPassword: 'different',
      }).success
    ).toBe(false)
  })
})

describe('profileChangeRequestSchema', () => {
  it('accepts valid critical field change request', () => {
    const r = profileChangeRequestSchema.safeParse({
      field_name: 'legal_name',
      new_value: 'New Name',
    })
    expect(r.success).toBe(true)
  })

  it('rejects non-critical field name', () => {
    const r = profileChangeRequestSchema.safeParse({
      field_name: 'phone',
      new_value: '+85212345678',
    })
    expect(r.success).toBe(false)
  })

  it('rejects empty new_value', () => {
    const r = profileChangeRequestSchema.safeParse({
      field_name: 'email',
      new_value: '',
    })
    expect(r.success).toBe(false)
  })
})
