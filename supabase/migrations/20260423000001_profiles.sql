-- Extensions required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Generic updated_at trigger helper (used by several tables)
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles: unified identity across platform
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    hkid CITEXT UNIQUE NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    legal_name TEXT NOT NULL,
    date_of_birth DATE,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'individual_member'
        CHECK (role IN ('pwma_admin', 'member_firm_admin', 'individual_member', 'guest')),
    account_status TEXT NOT NULL DEFAULT 'pending_email_verify'
        CHECK (account_status IN ('pending_email_verify', 'pending_pwma_approval', 'active', 'suspended')),
    lifecycle_state TEXT
        CHECK (lifecycle_state IS NULL OR lifecycle_state IN ('employee', 'unemployed', 'general_public')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_hkid ON profiles(hkid);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_account_status ON profiles(account_status);

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE profiles IS
    'Unified profile table. One record per person across the whole platform.';
COMMENT ON COLUMN profiles.hkid IS
    'HK ID. UNIQUE constraint; not PRIMARY KEY so the primary key can stay a surrogate UUID.';
COMMENT ON COLUMN profiles.legal_name IS
    'Critical field. Users cannot edit directly; changes go through profile_change_requests.';
COMMENT ON COLUMN profiles.date_of_birth IS
    'Critical field. Users cannot edit directly; changes go through profile_change_requests.';
COMMENT ON COLUMN profiles.role IS
    'Four application roles. Internal PWMA staff map to pwma_admin.';
COMMENT ON COLUMN profiles.account_status IS
    'Registration lifecycle: pending_email_verify -> pending_pwma_approval -> active.';
COMMENT ON COLUMN profiles.lifecycle_state IS
    'Employment status transitions: employee, unemployed, general_public. Nullable for non-individual profiles.';
