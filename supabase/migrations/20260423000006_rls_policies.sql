-- Enable RLS on every table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Helper: is caller a PWMA admin?
CREATE OR REPLACE FUNCTION auth_is_pwma_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE auth_user_id = auth.uid()
          AND role = 'pwma_admin'
          AND account_status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: is caller a firm admin for the given firm?
CREATE OR REPLACE FUNCTION auth_is_firm_admin(target_firm_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM firm_memberships fm
        JOIN profiles p ON p.id = fm.profile_id
        WHERE p.auth_user_id = auth.uid()
          AND fm.firm_id = target_firm_id
          AND fm.role_in_firm = 'admin'
          AND fm.end_date IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles
CREATE POLICY "profiles_self_read" ON profiles
    FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "profiles_admin_read_all" ON profiles
    FOR SELECT USING (auth_is_pwma_admin());
CREATE POLICY "profiles_self_update" ON profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "profiles_admin_update_all" ON profiles
    FOR UPDATE USING (auth_is_pwma_admin());
-- Note: critical field protection is enforced at app layer via profile_change_requests
-- because RLS cannot efficiently block specific column updates in a single policy.

-- Member firms
CREATE POLICY "member_firms_public_read_active" ON member_firms
    FOR SELECT USING (status = 'active');
CREATE POLICY "member_firms_admin_all" ON member_firms
    FOR ALL USING (auth_is_pwma_admin());

-- Firm memberships
CREATE POLICY "firm_memberships_self_read" ON firm_memberships
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "firm_memberships_firm_admin_read" ON firm_memberships
    FOR SELECT USING (auth_is_firm_admin(firm_id));
CREATE POLICY "firm_memberships_admin_all" ON firm_memberships
    FOR ALL USING (auth_is_pwma_admin());

-- Profile change requests
CREATE POLICY "profile_change_requests_self_insert" ON profile_change_requests
    FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "profile_change_requests_self_read" ON profile_change_requests
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "profile_change_requests_admin_all" ON profile_change_requests
    FOR ALL USING (auth_is_pwma_admin());

-- Applications
CREATE POLICY "applications_self_read" ON applications
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "applications_self_insert" ON applications
    FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "applications_admin_all" ON applications
    FOR ALL USING (auth_is_pwma_admin());

-- Application status history
CREATE POLICY "application_status_history_self_read" ON application_status_history
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications
            WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
    );
CREATE POLICY "application_status_history_admin_all" ON application_status_history
    FOR ALL USING (auth_is_pwma_admin());

-- Application documents
CREATE POLICY "application_documents_self_read" ON application_documents
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications
            WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
    );
CREATE POLICY "application_documents_self_insert" ON application_documents
    FOR INSERT WITH CHECK (
        application_id IN (
            SELECT id FROM applications
            WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
    );
CREATE POLICY "application_documents_admin_all" ON application_documents
    FOR ALL USING (auth_is_pwma_admin());
