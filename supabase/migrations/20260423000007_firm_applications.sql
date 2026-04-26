-- WF1: Member Firm application records.
-- Captured online for audit rather than the previous PDF-by-email path.
-- Director sign-off chain currently modelled as 3-sequential, pending
-- stakeholder clarification.

CREATE TABLE firm_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID REFERENCES member_firms(id) ON DELETE SET NULL,
    proposed_firm_name TEXT NOT NULL,
    business_registration_number TEXT,
    contact_name TEXT NOT NULL,
    contact_email CITEXT NOT NULL,
    contact_phone TEXT,
    firm_address TEXT,
    tier_requested TEXT NOT NULL DEFAULT 'full_member'
        CHECK (tier_requested IN ('full_member', 'associate_member')),
    status TEXT NOT NULL DEFAULT 'submitted'
        CHECK (status IN (
            'submitted',
            'pending_director_review',
            'pending_approval',
            'approved',
            'rejected',
            'withdrawn'
        )),
    submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    director_signoffs JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_firm_applications_status ON firm_applications(status);
CREATE INDEX idx_firm_applications_email ON firm_applications(contact_email);

CREATE TRIGGER firm_applications_updated_at
    BEFORE UPDATE ON firm_applications
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE firm_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "firm_applications_public_insert" ON firm_applications
    FOR INSERT WITH CHECK (true);
CREATE POLICY "firm_applications_admin_all" ON firm_applications
    FOR ALL USING (auth_is_pwma_admin());

COMMENT ON TABLE firm_applications IS
    'Intake records for prospective member firms. WF1 flow. Director sign-off chain captured in director_signoffs JSONB (order, name, signed_at, signature_ref).';
COMMENT ON COLUMN firm_applications.director_signoffs IS
    'Ordered list of director sign-off entries. Shape: [{order:int, name:str, signed_at:timestamp, signature_ref:str}]. Chain length assumed 3, pending stakeholder confirmation.';
