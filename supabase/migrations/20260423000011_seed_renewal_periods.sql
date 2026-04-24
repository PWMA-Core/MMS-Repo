-- Seed current + next renewal period. Safe for local + remote.

INSERT INTO renewal_periods (year, opens_at, closes_at, opt_hours_required, late_penalty_cpwp, late_penalty_cpwpa)
VALUES
    (2026, '2026-01-01', '2026-12-31', 10, 500, 250),
    (2027, '2027-01-01', '2027-12-31', 10, 500, 250)
ON CONFLICT (year) DO NOTHING;
