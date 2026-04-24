/**
 * Dummy data for the DevNav overlay. Centralised so every form can opt in
 * with a single hook call. All values are syntactically valid per the zod
 * schemas: HKID passes checksum, emails are parseable, phones match the
 * regex, passwords are long enough.
 *
 * Remove this file (and the src/components/debug/ folder) to strip the
 * entire debug layer.
 */

import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type DemoRole = Profile['role']

export const DEMO_EMAIL = 'demo@pwma.test'
export const DEMO_PASSWORD = 'demo-password-123'
export const DEMO_HKID = 'A1234563' // passes the checksum in hkid validator
export const DEMO_FIRM_HKID = 'B2345670' // passes checksum for firm admin

export const DEMO_PROFILES: Record<DemoRole, Profile> = {
  pwma_admin: {
    id: 'demo-pwma-admin-00000000',
    auth_user_id: 'demo-user-00000000',
    hkid: 'Z9999999',
    email: 'admin@pwma.test',
    legal_name: 'Demo PWMA Admin',
    date_of_birth: '1980-01-01',
    phone: '+85229999999',
    address: 'PWMA Office, Central, HK',
    role: 'pwma_admin',
    account_status: 'active',
    lifecycle_state: 'employee',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  member_firm_admin: {
    id: 'demo-firm-admin-00000000',
    auth_user_id: 'demo-user-00000001',
    hkid: DEMO_FIRM_HKID,
    email: 'firm.admin@demo.test',
    legal_name: 'Demo Firm Admin',
    date_of_birth: '1985-06-15',
    phone: '+85228888888',
    address: 'Demo Bank HQ, Central, HK',
    role: 'member_firm_admin',
    account_status: 'active',
    lifecycle_state: 'employee',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  individual_member: {
    id: 'demo-individual-00000000',
    auth_user_id: 'demo-user-00000002',
    hkid: DEMO_HKID,
    email: DEMO_EMAIL,
    legal_name: 'Demo Individual Member',
    date_of_birth: '1990-03-20',
    phone: '+85212345678',
    address: '1 Central Plaza, HK',
    role: 'individual_member',
    account_status: 'active',
    lifecycle_state: 'employee',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  guest: {
    id: 'demo-guest-00000000',
    auth_user_id: 'demo-user-00000003',
    hkid: 'GUEST-demo',
    email: 'guest@demo.test',
    legal_name: 'Demo Guest',
    date_of_birth: null,
    phone: '+85211111111',
    address: null,
    role: 'guest',
    account_status: 'active',
    lifecycle_state: 'general_public',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

export const DEMO_REGISTRATION_INDIVIDUAL = {
  hkid: DEMO_HKID,
  legal_name: 'Test Individual Member',
  date_of_birth: '1990-03-20',
  email: DEMO_EMAIL,
  phone: '+85212345678',
  address: '1 Central Plaza, HK',
  password: DEMO_PASSWORD,
  confirm_password: DEMO_PASSWORD,
}

export const DEMO_REGISTRATION_FIRM_ADMIN = {
  firm_name: 'Demo Bank Ltd',
  business_registration_number: 'BR-DEMO-001',
  firm_contact_email: 'contact@demo-bank.test',
  firm_contact_phone: '+85228888888',
  firm_address: 'Demo Bank HQ, Central, HK',
  hkid: DEMO_FIRM_HKID,
  legal_name: 'Test Firm Admin',
  date_of_birth: '1985-06-15',
  email: 'firm.admin@demo-bank.test',
  phone: '+85228888888',
  password: DEMO_PASSWORD,
  confirm_password: DEMO_PASSWORD,
}

export const DEMO_REGISTRATION_GUEST = {
  legal_name: 'Test Guest',
  email: 'guest@demo.test',
  phone: '+85211111111',
  password: DEMO_PASSWORD,
  confirm_password: DEMO_PASSWORD,
}

export const DEMO_FIRM_APPLICATION = {
  proposed_firm_name: 'Demo Applicant Bank',
  business_registration_number: 'BR-APPLY-001',
  contact_name: 'Demo Contact',
  contact_email: 'contact@demo-applicant.test',
  contact_phone: '+85227777777',
  firm_address: 'Applicant Office, HK',
  tier_requested: 'full_member' as const,
  notes: 'Submitted via DevNav autofill.',
}

export const DEMO_SIGN_IN = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
}

export const DEMO_RESET = {
  email: DEMO_EMAIL,
}
