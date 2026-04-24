-- Fix B-005: firm admin cannot read profiles of employees in their firm.
--
-- The firm-admin consolidated view (/firm/employees) joins firm_memberships
-- to profiles. Firm admin can read firm_memberships for their firm via
-- firm_memberships_firm_admin_read, but cannot read the joined profiles
-- because the only profiles SELECT policies are:
--   - profiles_self_read (own profile)
--   - profiles_admin_read_all (PWMA admin)
-- So embedded profile data comes back NULL for everyone except the firm admin
-- themselves, breaking the consolidated view.
--
-- Fix: add a SELECT policy that lets a firm admin read profiles of any member
-- whose active firm_memberships row points at a firm they admin.
--
-- Uses the existing auth_is_firm_admin(target_firm_id) helper.

CREATE POLICY "profiles_firm_admin_read" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM firm_memberships fm
            WHERE fm.profile_id = profiles.id
              AND fm.end_date IS NULL
              AND auth_is_firm_admin(fm.firm_id)
        )
    );

COMMENT ON POLICY "profiles_firm_admin_read" ON profiles IS
    'Lets a member_firm_admin SELECT profiles of any active employee linked to a firm they administer. Required for /firm/dashboard and /firm/employees consolidated views (SOW 2.09).';
