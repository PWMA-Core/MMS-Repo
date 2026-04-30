import { z } from 'zod'
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  DOCUMENT_TYPES,
} from '@/lib/constants/documents'

const allowedMimes: readonly string[] = ALLOWED_DOCUMENT_MIME_TYPES

export function isAllowedDocumentMime(mime: string): boolean {
  return allowedMimes.includes(mime)
}

export function isAllowedDocumentSize(bytes: number): boolean {
  return bytes > 0 && bytes <= MAX_DOCUMENT_SIZE_BYTES
}

export const documentFileSchema = z
  .custom<File>((f) => f instanceof File, { message: 'A file is required' })
  .refine((f) => isAllowedDocumentSize(f.size), {
    message: 'File must be 5 MB or smaller',
  })
  .refine((f) => isAllowedDocumentMime(f.type), {
    message: 'Allowed types: PDF, Excel, Word, PNG, JPEG',
  })

export const documentUploadSchema = z.object({
  document_type: z.enum(DOCUMENT_TYPES),
  file: documentFileSchema,
})
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
