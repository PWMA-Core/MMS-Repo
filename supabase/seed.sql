-- Seed data for local dev only. NOT applied to production.
-- 3 member firms, 1 PWMA admin, 2 test members.

INSERT INTO member_firms (id, name, business_registration_number, tier, status)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'HSBC (Test)', 'BR12345678', 'full_member', 'active'),
    ('10000000-0000-0000-0000-000000000002', 'Standard Chartered (Test)', 'BR87654321', 'full_member', 'active'),
    ('10000000-0000-0000-0000-000000000003', 'Test Associate Firm', 'BR00000001', 'associate_member', 'active');

-- PWMA admin profile (manual auth_user_id, tie to seeded auth user if needed)
-- NOTE: auth_user_id must be set after creating matching user in Supabase Auth local.
-- Leave null for seed; update later via Studio.

INSERT INTO profiles (id, hkid, email, legal_name, role, account_status)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'A1234567', 'admin@pwma.test', 'PWMA Admin Test', 'pwma_admin', 'active'),
    ('20000000-0000-0000-0000-000000000002', 'B2345678', 'member1@test.com', 'Test Member One', 'individual_member', 'active'),
    ('20000000-0000-0000-0000-000000000003', 'C3456789', 'firm.admin@hsbc.test', 'Test Firm Admin', 'member_firm_admin', 'active');

INSERT INTO firm_memberships (profile_id, firm_id, role_in_firm)
VALUES
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'admin'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'employee');
