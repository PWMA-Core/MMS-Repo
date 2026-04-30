-- Foundation for Phase 4 renewal + OPT flows.
-- Tables are created now so relationships and types are stable; business
-- logic (reminders, bulk renewals, OPT auto-fill) lands in Phase 4.

SET search_path = public, extensions;

-- Renewal period config. One row per calendar year.
CREATE TABLE renewal_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL UNIQUE,
    opens_at DATE NOT NULL,
    closes_at DATE NOT NULL,
    opt_hours_required INTEGER NOT NULL DEFAULT 10,
    late_penalty_cpwp NUMERIC(10, 2) NOT NULL DEFAULT 500,
    late_penalty_cpwpa NUMERIC(10, 2) NOT NULL DEFAULT 250,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE renewal_periods IS
    'Configures the renewal window and OPT requirement per calendar year. Reference values (10 hours, penalties) seeded per project reference-data.';

-- OPT (On-going Professional Training) hours per profile per year.
CREATE TABLE opt_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    source TEXT NOT NULL DEFAULT 'event'
        CHECK (source IN ('event', 'e_learning', 'manual_admin', 'migrated')),
    hours NUMERIC(5, 2) NOT NULL,
    event_id UUID,
    certificate_storage_path TEXT,
    granted_by UUID REFERENCES profiles(id),
    note TEXT,
    recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_opt_records_profile_year ON opt_records(profile_id, year);
CREATE INDEX idx_opt_records_source ON opt_records(source);

COMMENT ON TABLE opt_records IS
    'Per-member OPT hour ledger. Auto-filled from events in Phase 4; admin override path supported via source=manual_admin.';
COMMENT ON COLUMN opt_records.source IS
    'event: from WF4 attendance+quiz pass. e_learning: 70% pass per design spec. manual_admin: PWMA admin override with reason. migrated: legacy import.';

-- Renewal submissions tie back to applications.application_kind = 'renewal'.
-- This view surfaces the derived data for dashboards.
CREATE OR REPLACE VIEW renewal_status_by_member AS
SELECT
    p.id AS profile_id,
    p.legal_name,
    p.email,
    p.role,
    rp.year AS period_year,
    COALESCE(SUM(orr.hours), 0) AS opt_hours_recorded,
    rp.opt_hours_required,
    CASE
        WHEN COALESCE(SUM(orr.hours), 0) >= rp.opt_hours_required THEN 'fulfilled'
        ELSE 'pending'
    END AS opt_status
FROM profiles p
CROSS JOIN renewal_periods rp
LEFT JOIN opt_records orr
    ON orr.profile_id = p.id AND orr.year = rp.year
WHERE p.role IN ('individual_member', 'member_firm_admin')
GROUP BY p.id, p.legal_name, p.email, p.role, rp.year, rp.opt_hours_required;

COMMENT ON VIEW renewal_status_by_member IS
    'OPT fulfilment snapshot per (member, renewal year). Feeds member dashboard and firm admin consolidated view.';

ALTER TABLE renewal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "renewal_periods_public_read" ON renewal_periods
    FOR SELECT USING (true);
CREATE POLICY "renewal_periods_admin_all" ON renewal_periods
    FOR ALL USING (auth_is_pwma_admin());

CREATE POLICY "opt_records_self_read" ON opt_records
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY "opt_records_admin_all" ON opt_records
    FOR ALL USING (auth_is_pwma_admin());
