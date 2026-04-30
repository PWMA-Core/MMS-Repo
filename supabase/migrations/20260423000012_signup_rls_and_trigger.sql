SET search_path = public, extensions;

-- Fix sign-up RLS so members can create their own profile.
--
-- Bug found in QA: client-side `from('profiles').insert(...)` after
-- `auth.signUp` failed with "new row violates row-level security policy
-- for table 'profiles'". The original RLS file (20260423000006) defined
-- SELECT/UPDATE policies but no INSERT policy, so even an authenticated
-- caller could not insert their own profile. Worse, when email
-- confirmation is enabled, signUp returns no session, so auth.uid() is
-- NULL during the immediate follow-up insert.
--
-- Fix is two-part:
--   1) INSERT policy that lets a caller insert a profile bound to their
--      own auth.uid(). This is the path used after email confirmation,
--      e.g. completing a profile from the verify callback.
--   2) Trigger on auth.users that auto-creates the profile from
--      raw_user_meta_data passed via signUp options.data. This is the
--      path used during initial sign-up (no session yet). It runs as
--      SECURITY DEFINER so it bypasses RLS.

-- Part 1: self-insert RLS policy
CREATE POLICY "profiles_self_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Part 2: auth.users -> profiles trigger
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    -- Only create a profile when sign-up metadata includes hkid. This
    -- skips admin-created auth users, magic-link logins for existing
    -- profiles, and any auth row that already has a matching profile
    -- (ON CONFLICT below).
    IF NEW.raw_user_meta_data ? 'hkid' THEN
        INSERT INTO public.profiles (
            auth_user_id, email, hkid, legal_name, date_of_birth,
            phone, address, role, account_status
        ) VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'hkid',
            COALESCE(NEW.raw_user_meta_data->>'legal_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::date,
            NEW.raw_user_meta_data->>'phone',
            NULLIF(NEW.raw_user_meta_data->>'address', ''),
            COALESCE(NEW.raw_user_meta_data->>'role', 'individual_member'),
            'pending_pwma_approval'
        )
        ON CONFLICT (auth_user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

COMMENT ON FUNCTION public.handle_new_auth_user IS
    'Auto-create profiles row from raw_user_meta_data on auth.users insert. Triggered by member sign-up flows that pass hkid + legal_name + dob + phone + role via supabase.auth.signUp options.data.';
