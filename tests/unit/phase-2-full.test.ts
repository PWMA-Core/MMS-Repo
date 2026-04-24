import { describe, it, expect } from 'vitest'
import { firmApplicationSchema } from '@/lib/validators/firm-application'
import { renewalFormSchema, renewalProfileConfirmSchema } from '@/lib/validators/renewal'
import {
  isAllowedDocumentMime,
  isAllowedDocumentSize,
  formatFileSize,
  documentUploadSchema,
} from '@/lib/validators/documents'
import {
  MAX_DOCUMENT_SIZE_BYTES,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from '@/lib/constants/documents'
import {
  buildApplicationDocumentPath,
  buildProfileAvatarPath,
  buildFirmApplicationAttachmentPath,
} from '@/lib/storage/upload'
import { renderEmail } from '@/lib/email/templates'
import { emailTemplates } from '@/lib/email/templates'
import { NOTIFICATION_TEMPLATE_KEYS } from '@/lib/constants/notifications'

describe('firmApplicationSchema', () => {
  const valid = {
    proposed_firm_name: 'Test Bank',
    business_registration_number: 'BR1234',
    contact_name: 'Jane Doe',
    contact_email: 'jane@test.com',
    contact_phone: '+85212345678',
    firm_address: '1 Central',
    tier_requested: 'full_member' as const,
    notes: '',
  }

  it('accepts a valid firm application', () => {
    expect(firmApplicationSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing BR number', () => {
    expect(
      firmApplicationSchema.safeParse({
        ...valid,
        business_registration_number: '',
      }).success,
    ).toBe(false)
  })

  it('rejects invalid tier_requested', () => {
    const r = firmApplicationSchema.safeParse({
      ...valid,
      tier_requested: 'gold' as unknown as 'full_member',
    })
    expect(r.success).toBe(false)
  })
})

describe('renewal schemas', () => {
  it('renewalProfileConfirmSchema requires profile confirmation', () => {
    expect(
      renewalProfileConfirmSchema.safeParse({
        profile_still_correct: false,
        firm_still_correct: false,
        lifecycle_state: 'employee',
      }).success,
    ).toBe(false)
  })

  it('renewalProfileConfirmSchema accepts when confirmed', () => {
    expect(
      renewalProfileConfirmSchema.safeParse({
        profile_still_correct: true,
        firm_still_correct: true,
        lifecycle_state: 'employee',
      }).success,
    ).toBe(true)
  })

  it('renewalFormSchema accepts a CPWP renewal', () => {
    expect(
      renewalFormSchema.safeParse({
        year: 2026,
        application_type: 'CPWP',
        declared_opt_hours: 12,
        declared_employment_change: false,
        employment_change_note: '',
      }).success,
    ).toBe(true)
  })

  it('renewalFormSchema rejects negative OPT hours', () => {
    expect(
      renewalFormSchema.safeParse({
        year: 2026,
        application_type: 'CPWPA',
        declared_opt_hours: -1,
        declared_employment_change: false,
      }).success,
    ).toBe(false)
  })

  it('renewalFormSchema caps OPT hours at 200', () => {
    expect(
      renewalFormSchema.safeParse({
        year: 2026,
        application_type: 'CPWPA',
        declared_opt_hours: 500,
        declared_employment_change: false,
      }).success,
    ).toBe(false)
  })
})

describe('document helpers', () => {
  it('isAllowedDocumentMime accepts every declared MIME', () => {
    for (const mime of ALLOWED_DOCUMENT_MIME_TYPES) {
      expect(isAllowedDocumentMime(mime)).toBe(true)
    }
  })

  it('isAllowedDocumentMime rejects random types', () => {
    expect(isAllowedDocumentMime('text/plain')).toBe(false)
    expect(isAllowedDocumentMime('application/zip')).toBe(false)
  })

  it('isAllowedDocumentSize enforces 5 MB', () => {
    expect(isAllowedDocumentSize(MAX_DOCUMENT_SIZE_BYTES)).toBe(true)
    expect(isAllowedDocumentSize(MAX_DOCUMENT_SIZE_BYTES + 1)).toBe(false)
    expect(isAllowedDocumentSize(0)).toBe(false)
  })

  it('formatFileSize renders human-readable output', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB')
  })

  it('documentUploadSchema accepts a valid input', () => {
    const file = new File([new Uint8Array(1024)], 'exam.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(file, 'size', { value: 1024 })
    const r = documentUploadSchema.safeParse({
      document_type: 'exam_result',
      file,
    })
    expect(r.success).toBe(true)
  })

  it('documentUploadSchema rejects oversize files', () => {
    const file = new File([new Uint8Array(1024)], 'big.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(file, 'size', { value: MAX_DOCUMENT_SIZE_BYTES + 1 })
    const r = documentUploadSchema.safeParse({
      document_type: 'exam_result',
      file,
    })
    expect(r.success).toBe(false)
  })
})

describe('storage path builders', () => {
  it('puts owner id first for RLS matching', () => {
    expect(buildApplicationDocumentPath('p1', 'a1', 'hello world.pdf')).toMatch(
      /^p1\/a1\/\d+-hello_world\.pdf$/,
    )
  })

  it('sanitises special chars in filenames', () => {
    expect(buildProfileAvatarPath('p1', 'Face?.png')).toBe('p1/Face_.png')
  })

  it('builds firm attachment path scoped to application id', () => {
    expect(buildFirmApplicationAttachmentPath('fa1', 'br.pdf')).toMatch(
      /^fa1\/\d+-br\.pdf$/,
    )
  })
})

describe('email template registry', () => {
  it('has a renderer for every declared template key', () => {
    for (const key of NOTIFICATION_TEMPLATE_KEYS) {
      expect(emailTemplates[key]).toBeDefined()
    }
  })

  it('registration_received renders with legal name', () => {
    const out = renderEmail('registration_received', {
      legal_name: 'Test User',
      role: 'individual_member',
    })
    expect(out.subject).toContain('PWMA')
    expect(out.html).toContain('Test User')
    expect(out.text).toContain('Test User')
  })

  it('account_approved includes dashboard URL', () => {
    const out = renderEmail('account_approved', {
      legal_name: 'Test',
      dashboard_url: 'https://mms.test/dashboard',
    })
    expect(out.html).toContain('https://mms.test/dashboard')
  })

  it('application_status_update humanises statuses', () => {
    const out = renderEmail('application_status_update', {
      legal_name: 'Test',
      application_type: 'CPWP',
      application_kind: 'renewal',
      from_status: 'pending_for_checker',
      to_status: 'recommended_for_approval',
    })
    expect(out.subject).toContain('recommended for approval')
  })

  it('escapes html in payload values', () => {
    const out = renderEmail('profile_change_submitted', {
      legal_name: '<script>bad</script>',
      field_name: 'legal_name',
      new_value: 'Evil <img>',
    })
    expect(out.html).not.toContain('<script>bad</script>')
    expect(out.html).toContain('&lt;script&gt;')
  })
})
