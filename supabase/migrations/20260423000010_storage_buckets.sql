-- Supabase Storage buckets for documents. Buckets are private; access is
-- gated by signed URLs generated server-side at read time.
-- This migration is idempotent across local and remote Supabase.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    (
        'application-documents',
        'application-documents',
        false,
        5242880, -- 5 MB per design spec
        ARRAY[
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/png',
            'image/jpeg'
        ]
    ),
    (
        'profile-avatars',
        'profile-avatars',
        false,
        2097152, -- 2 MB
        ARRAY['image/png', 'image/jpeg', 'image/webp']
    ),
    (
        'firm-application-attachments',
        'firm-application-attachments',
        false,
        5242880,
        ARRAY[
            'application/pdf',
            'image/png',
            'image/jpeg'
        ]
    )
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only authenticated users can insert; owners + admins can read.
-- Object paths follow the pattern:
--   application-documents/{profile_id}/{application_id}/{filename}
--   profile-avatars/{profile_id}/{filename}
--   firm-application-attachments/{firm_application_id}/{filename}
-- The first path segment is the resource owner id used for ownership checks.

CREATE POLICY "storage_application_documents_owner_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'application-documents'
        AND (split_part(name, '/', 1))::uuid IN (
            SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "storage_application_documents_admin_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'application-documents'
        AND auth_is_pwma_admin()
    );

CREATE POLICY "storage_application_documents_owner_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'application-documents'
        AND (split_part(name, '/', 1))::uuid IN (
            SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "storage_profile_avatars_owner_all" ON storage.objects
    FOR ALL TO authenticated
    USING (
        bucket_id = 'profile-avatars'
        AND (split_part(name, '/', 1))::uuid IN (
            SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        bucket_id = 'profile-avatars'
        AND (split_part(name, '/', 1))::uuid IN (
            SELECT id FROM profiles WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "storage_firm_application_attachments_public_insert" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'firm-application-attachments');

CREATE POLICY "storage_firm_application_attachments_admin_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'firm-application-attachments'
        AND auth_is_pwma_admin()
    );
