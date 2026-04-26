CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    application_type TEXT NOT NULL
        CHECK (application_type IN ('CPWP', 'CPWPA')),
    application_kind TEXT NOT NULL DEFAULT 'new'
        CHECK (application_kind IN ('new', 'renewal')),
    form_data JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending_for_checker',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_applications_profile ON applications(profile_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(application_type);

CREATE TRIGGER applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    note TEXT,
    changed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_application_status_history_application ON application_status_history(application_id);

CREATE TABLE application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_application_documents_application ON application_documents(application_id);

COMMENT ON TABLE applications IS
    'CPWP and CPWPA application records.';
COMMENT ON COLUMN applications.status IS
    'Application status. Default is pending_for_checker; see application-statuses constants for the full set.';
COMMENT ON TABLE application_documents IS
    'Supporting documents for an application. Max file size 5 MB. Allowed MIME: PDF, Excel, PNG, Word.';
