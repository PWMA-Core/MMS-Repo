CREATE TABLE member_firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    business_registration_number TEXT UNIQUE,
    tier TEXT NOT NULL DEFAULT 'pending'
        CHECK (tier IN ('full_member', 'associate_member', 'pending')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'suspended')),
    address TEXT,
    contact_email CITEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_member_firms_status ON member_firms(status);
CREATE INDEX idx_member_firms_tier ON member_firms(tier);

CREATE TRIGGER member_firms_updated_at
    BEFORE UPDATE ON member_firms
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE member_firms IS
    'Member firms (typically banks) affiliated with PWMA.';
COMMENT ON COLUMN member_firms.tier IS
    'Full Member or Associate Member tier, used in eligibility checks.';
