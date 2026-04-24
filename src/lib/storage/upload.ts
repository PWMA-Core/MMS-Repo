import { supabase } from '@/lib/supabase/client'
import {
  MAX_DOCUMENT_SIZE_BYTES,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from '@/lib/constants/documents'

const allowedMimes: readonly string[] = ALLOWED_DOCUMENT_MIME_TYPES

interface UploadInput {
  bucket: 'application-documents' | 'profile-avatars' | 'firm-application-attachments'
  path: string
  file: File
  upsert?: boolean
}

interface UploadResult {
  ok: boolean
  storage_path?: string
  error?: string
}

export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  if (input.file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { ok: false, error: 'File must be 5 MB or smaller' }
  }
  if (!allowedMimes.includes(input.file.type)) {
    return { ok: false, error: 'File type not allowed' }
  }
  const { data, error } = await supabase.storage
    .from(input.bucket)
    .upload(input.path, input.file, {
      upsert: input.upsert ?? false,
      contentType: input.file.type,
    })
  if (error) return { ok: false, error: error.message }
  return { ok: true, storage_path: data.path }
}

/**
 * Stable object-path convention: owner-id as first segment so RLS can gate
 * reads with (split_part(name,'/',1))::uuid = caller's profile id.
 */
export function buildApplicationDocumentPath(
  profileId: string,
  applicationId: string,
  filename: string,
): string {
  return `${profileId}/${applicationId}/${Date.now()}-${sanitize(filename)}`
}

export function buildProfileAvatarPath(profileId: string, filename: string): string {
  return `${profileId}/${sanitize(filename)}`
}

export function buildFirmApplicationAttachmentPath(
  firmApplicationId: string,
  filename: string,
): string {
  return `${firmApplicationId}/${Date.now()}-${sanitize(filename)}`
}

function sanitize(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_')
}
