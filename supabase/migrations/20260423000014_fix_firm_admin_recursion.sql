-- Fix B-005 followup: the previous migration's policy caused infinite RLS
-- recursion (profiles → firm_memberships → profiles).
--
-- Wrap the cross-table check in a SECURITY DEFINER function so the inner
-- queries bypass RLS, breaking the cycle.

DROP POLICY IF EXISTS "profiles_firm_admin_read" ON profiles;

CREATE OR REPLACE FUNCTION auth_can_read_firm_member(target_profile_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql STABLE AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM firm_memberships target_fm
        JOIN firm_memberships admin_fm ON admin_fm.firm_id = target_fm.firm_id
        JOIN profiles admin_p ON admin_p.id = admin_fm.profile_id
        WHERE target_fm.profile_id = target_profile_id
          AND target_fm.end_date IS NULL
          AND admin_p.auth_user_id = auth.uid()
          AND admin_fm.role_in_firm = 'admin'
          AND admin_fm.end_date IS NULL
    );
END;
$$;

CREATE POLICY "profiles_firm_admin_read" ON profiles
    FOR SELECT USING (auth_can_read_firm_member(profiles.id));

COMMENT ON FUNCTION auth_can_read_firm_member IS
    'Returns true when the current auth.uid() admins a firm that target_profile_id is a member of. SECURITY DEFINER so the joins bypass RLS and avoid the infinite recursion that direct EXISTS in a policy would cause.';
