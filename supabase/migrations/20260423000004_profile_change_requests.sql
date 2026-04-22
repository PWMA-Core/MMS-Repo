CREATE TABLE profile_change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL
        CHECK (field_name IN ('legal_name', 'date_of_birth', 'hkid', 'email')),
    old_value TEXT,
    new_value TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_profile_change_requests_profile ON profile_change_requests(profile_id);
CREATE INDEX idx_profile_change_requests_status ON profile_change_requests(status);

COMMENT ON TABLE profile_change_requests IS
    'Admin-approval workflow for critical profile fields (legal_name, date_of_birth, hkid, email).';
