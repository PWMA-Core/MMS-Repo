-- Notification log. The SPA enqueues; a server-side worker (Supabase Edge
-- Function) drains and sends via M365 SMTP. The row records intent and
-- delivery status. RLS lets admins read all and members read their own;
-- inserts are unrestricted to support anonymous flows (email verify
-- pre-approval).

SET search_path = public, extensions;

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email CITEXT NOT NULL,
    to_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    template_key TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    status TEXT NOT NULL DEFAULT 'queued'
        CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'skipped')),
    provider TEXT NOT NULL DEFAULT 'm365',
    provider_message_id TEXT,
    error_message TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    queued_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_to_profile ON notifications(to_profile_id);
CREATE INDEX idx_notifications_template ON notifications(template_key);
CREATE INDEX idx_notifications_queued_at ON notifications(queued_at);

CREATE TRIGGER notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_self_read" ON notifications
    FOR SELECT USING (
        to_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );
CREATE POLICY "notifications_self_insert" ON notifications
    FOR INSERT WITH CHECK (
        to_profile_id IS NULL
        OR to_profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );
CREATE POLICY "notifications_admin_all" ON notifications
    FOR ALL USING (auth_is_pwma_admin());

COMMENT ON TABLE notifications IS
    'Outbound email queue and log. Client enqueues (status=queued); server worker drains, sends via M365, updates status. payload JSON carries template variables.';
COMMENT ON COLUMN notifications.template_key IS
    'Corresponds to src/lib/email/templates/*. Examples: registration_received, account_approved, profile_change_approved.';
COMMENT ON COLUMN notifications.status IS
    'queued -> sending -> sent|failed. skipped is used when the worker opts out (e.g., duplicate idempotency key).';
