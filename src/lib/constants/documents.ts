/**
 * Document upload constraints per design spec.
 * 5 MB limit. PDF / Excel / Word / PNG / JPEG accepted. PDF preferred for
 * printable / scanned records.
 */

export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
] as const

export type AllowedDocumentMime = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number]

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.xls',
  '.xlsx',
  '.doc',
  '.docx',
  '.png',
  '.jpg',
  '.jpeg',
] as const

export const DOCUMENT_ACCEPT_ATTRIBUTE = ALLOWED_DOCUMENT_EXTENSIONS.join(',')

export const DOCUMENT_TYPES = [
  'exam_result',
  'employment_letter',
  'declaration',
  'opt_certificate',
  'identity_proof',
  'firm_business_registration',
  'firm_director_signoff',
  'other',
] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  exam_result: 'Exam result',
  employment_letter: 'Employment letter',
  declaration: 'Declaration form',
  opt_certificate: 'OPT certificate',
  identity_proof: 'Identity proof',
  firm_business_registration: 'Firm business registration',
  firm_director_signoff: 'Director sign-off',
  other: 'Other',
}
