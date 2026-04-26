CREATE TABLE firm_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES member_firms(id) ON DELETE RESTRICT,
    role_in_firm TEXT NOT NULL DEFAULT 'employee'
        CHECK (role_in_firm IN ('admin', 'employee')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_firm_memberships_profile ON firm_memberships(profile_id);
CREATE INDEX idx_firm_memberships_firm ON firm_memberships(firm_id);
CREATE INDEX idx_firm_memberships_active ON firm_memberships(profile_id) WHERE end_date IS NULL;

-- A profile can only hold one active role in a given firm at a time
CREATE UNIQUE INDEX idx_firm_memberships_unique_active
    ON firm_memberships(profile_id, firm_id) WHERE end_date IS NULL;

COMMENT ON TABLE firm_memberships IS
    'Time-bounded membership of a profile in a firm. Supports employment transitions (employee -> unemployed -> new firm).';
