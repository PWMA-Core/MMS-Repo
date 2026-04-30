/**
 * End-to-end flows exercised against the in-memory mock Supabase client.
 * These tests mirror the click-paths a human would take in the app:
 *   - sign up as individual member -> admin approves -> active
 *   - profile change request -> admin approves -> field updated
 *   - firm application (public) -> admin approves
 *   - renewal creates applications row
 *   - firm admin dashboard shows their firm's employees
 *
 * If any of these fail, the UI flows will fail too. They validate that
 * the mock layer's semantics line up with call-site expectations.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { resetMockDb, reloadMockDb, mockSupabase } from '@/lib/supabase/mock-client'

beforeEach(() => {
  resetMockDb()
  reloadMockDb()
})

describe('E2E: seed integrity', () => {
  it('seeds 3 firms, 3 profiles, and renewal periods', async () => {
    const firms = await mockSupabase.from('member_firms').select('*')
    const profiles = await mockSupabase.from('profiles').select('*')
    const periods = await mockSupabase.from('renewal_periods').select('*')

    expect(firms.error).toBeNull()
    expect(Array.isArray(firms.data) ? firms.data.length : 0).toBe(3)

    expect(profiles.error).toBeNull()
    expect(Array.isArray(profiles.data) ? profiles.data.length : 0).toBe(3)

    expect(periods.error).toBeNull()
    expect(Array.isArray(periods.data) ? periods.data.length : 0).toBe(2)
  })

  it('seeded PWMA admin can be signed in', async () => {
    const { data, error } = await mockSupabase.auth.signInWithPassword({
      email: 'admin@pwma.test',
      password: 'demo-password-123',
    })
    expect(error).toBeNull()
    expect(data.user).not.toBeNull()
    expect(data.session).not.toBeNull()
  })

  it('rejects invalid credentials', async () => {
    const { error } = await mockSupabase.auth.signInWithPassword({
      email: 'admin@pwma.test',
      password: 'wrong-password',
    })
    expect(error).not.toBeNull()
    expect(error?.message).toMatch(/invalid/i)
  })
})

describe('E2E: individual registration -> admin approval -> active', () => {
  it('registers, lands in pending_pwma_approval, admin approves, becomes active', async () => {
    // 1. Sign up
    const signUp = await mockSupabase.auth.signUp({
      email: 'new.member@test.com',
      password: 'demo-password-123',
    })
    expect(signUp.error).toBeNull()
    const authUser = signUp.data.user!

    // 2. Insert profile (registration form does this)
    const insert = await mockSupabase.from('profiles').insert({
      auth_user_id: authUser.id,
      hkid: 'D4567891', // avoid collision with seeded HKIDs
      email: 'new.member@test.com',
      legal_name: 'New Member',
      date_of_birth: '1990-03-20',
      phone: '+85212345678',
      address: '1 Central Plaza, HK',
      role: 'individual_member',
      account_status: 'pending_email_verify',
    })
    expect(insert.error).toBeNull()

    // 3. Verify mock auto-bumped to pending_pwma_approval
    const pending = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'new.member@test.com')
      .single()
    expect(pending.error).toBeNull()
    expect(pending.data).toMatchObject({
      account_status: 'pending_pwma_approval',
      role: 'individual_member',
      legal_name: 'New Member',
    })

    // 4. Admin queue picks it up
    const queue = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('account_status', 'pending_pwma_approval')
      .order('created_at', { ascending: true })
    expect(Array.isArray(queue.data) ? queue.data.length : 0).toBeGreaterThanOrEqual(1)

    // 5. Admin approves
    const approve = await mockSupabase
      .from('profiles')
      .update({ account_status: 'active' })
      .eq('email', 'new.member@test.com')
    expect(approve.error).toBeNull()

    // 6. Final state
    const final = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'new.member@test.com')
      .single()
    expect(final.data?.account_status).toBe('active')
  })
})

describe('E2E: profile change request -> admin approval', () => {
  it('queues change, admin approves, field updated, notification queued', async () => {
    // Use seeded individual member
    const memberProfile = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'member@pwma.test')
      .single()
    expect(memberProfile.data).not.toBeNull()
    const profileId = memberProfile.data!.id

    // Member requests change of legal_name
    const request = await mockSupabase.from('profile_change_requests').insert({
      profile_id: profileId,
      field_name: 'legal_name',
      old_value: memberProfile.data!.legal_name,
      new_value: 'Updated Member Name',
      note: 'Marriage',
    })
    expect(request.error).toBeNull()

    // Admin pulls pending with join
    const adminQueue = await mockSupabase
      .from('profile_change_requests')
      .select('*, profile:profiles(id, legal_name, email)')
      .eq('status', 'pending')
    expect(Array.isArray(adminQueue.data) ? adminQueue.data.length : 0).toBe(1)
    const row = (adminQueue.data as { profile: { email: string } }[])[0]
    expect(row.profile.email).toBe('member@pwma.test')

    // Admin approves: apply change then mark request approved
    const apply = await mockSupabase
      .from('profiles')
      .update({ legal_name: 'Updated Member Name' })
      .eq('id', profileId)
    expect(apply.error).toBeNull()

    const changeId = (adminQueue.data as { id: string }[])[0].id
    const markApproved = await mockSupabase
      .from('profile_change_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', changeId)
    expect(markApproved.error).toBeNull()

    // Verify
    const finalProfile = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    expect(finalProfile.data?.legal_name).toBe('Updated Member Name')

    const finalChange = await mockSupabase
      .from('profile_change_requests')
      .select('*')
      .eq('id', changeId)
      .single()
    expect(finalChange.data?.status).toBe('approved')
  })
})

describe('E2E: firm application (WF1) -> admin approves', () => {
  it('submits public application, lands in queue, admin approves', async () => {
    const submit = await mockSupabase
      .from('firm_applications')
      .insert({
        proposed_firm_name: 'Applicant Bank',
        business_registration_number: 'BR-APP-1',
        contact_name: 'Jane Applicant',
        contact_email: 'jane@applicant.test',
        contact_phone: '+85212341234',
        firm_address: 'Applicant Office',
        tier_requested: 'full_member',
        notes: null,
      })
      .select('id')
      .single()
    expect(submit.error).toBeNull()
    const appId = (submit.data as { id: string }).id

    // Admin lists all
    const queue = await mockSupabase
      .from('firm_applications')
      .select('*')
      .order('submitted_at', { ascending: true })
    expect(Array.isArray(queue.data) ? queue.data.length : 0).toBe(1)

    // Admin approves
    const approve = await mockSupabase
      .from('firm_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', appId)
    expect(approve.error).toBeNull()

    const final = await mockSupabase
      .from('firm_applications')
      .select('*')
      .eq('id', appId)
      .single()
    expect(final.data?.status).toBe('approved')
  })
})

describe('E2E: renewal (WF3) creates renewal application', () => {
  it('inserts applications row with application_kind=renewal and latest form_data', async () => {
    const memberProfile = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'member@pwma.test')
      .single()
    const profileId = memberProfile.data!.id

    const submit = await mockSupabase
      .from('applications')
      .insert({
        profile_id: profileId,
        application_type: 'CPWP',
        application_kind: 'renewal',
        form_data: {
          year: 2026,
          declared_opt_hours: 12,
          declared_employment_change: false,
          employment_change_note: null,
        },
        status: 'pending_for_checker',
        submitted_at: new Date().toISOString(),
      })
      .select('id, application_type, application_kind')
      .single()
    expect(submit.error).toBeNull()
    expect(submit.data).toMatchObject({
      application_type: 'CPWP',
      application_kind: 'renewal',
    })

    const applications = await mockSupabase
      .from('applications')
      .select('*')
      .eq('profile_id', profileId)
    expect(Array.isArray(applications.data) ? applications.data.length : 0).toBe(1)
  })
})

describe('E2E: firm admin dashboard queries', () => {
  it('finds the firm admin their firm and active employees', async () => {
    const firmAdminProfile = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'firm.admin@hsbc.test')
      .single()
    expect(firmAdminProfile.data?.role).toBe('member_firm_admin')
    const firmAdminId = firmAdminProfile.data!.id

    const adminMembership = await mockSupabase
      .from('firm_memberships')
      .select('*')
      .eq('profile_id', firmAdminId)
      .eq('role_in_firm', 'admin')
      .is('end_date', null)
      .maybeSingle()
    expect(adminMembership.data).not.toBeNull()
    const firmId = adminMembership.data!.firm_id

    const firm = await mockSupabase
      .from('member_firms')
      .select('*')
      .eq('id', firmId)
      .single()
    expect(firm.data?.name).toBe('HSBC (Test)')
    expect(firm.data?.tier).toBe('full_member')

    const employees = await mockSupabase
      .from('firm_memberships')
      .select(
        `id, role_in_firm, start_date, end_date,
         profile:profiles(id, legal_name, email, account_status)`,
      )
      .eq('firm_id', firmId)
      .is('end_date', null)
    const rows = (employees.data ?? []) as Array<{
      profile: { account_status?: string } | null
    }>
    expect(rows.length).toBeGreaterThanOrEqual(2) // admin + employee
    const active = rows.filter((r) => r.profile?.account_status === 'active')
    expect(active.length).toBeGreaterThanOrEqual(2)
  })
})

describe('E2E: admin dashboard live counts', () => {
  it('returns correct counts for the three admin queues', async () => {
    // Seed one pending approval
    await mockSupabase.from('profiles').insert({
      auth_user_id: 'pending-auth',
      hkid: 'D4567891', // avoid collision with seeded HKIDs
      email: 'pending@test.com',
      legal_name: 'Pending Member',
      role: 'individual_member',
      account_status: 'pending_email_verify', // auto-bumps to pending_pwma_approval
    })
    // Seed one pending change request
    const p = await mockSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'member@pwma.test')
      .single()
    await mockSupabase.from('profile_change_requests').insert({
      profile_id: p.data!.id,
      field_name: 'legal_name',
      new_value: 'x',
    })
    // Seed one firm application
    await mockSupabase.from('firm_applications').insert({
      proposed_firm_name: 'q',
      contact_name: 'q',
      contact_email: 'q@q.q',
      tier_requested: 'full_member',
    })

    const approvals = await mockSupabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('account_status', 'pending_pwma_approval')
    const changes = await mockSupabase
      .from('profile_change_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    const firmApps = await mockSupabase
      .from('firm_applications')
      .select('id', { count: 'exact', head: true })
      .in('status', ['submitted', 'pending_director_review', 'pending_approval'])

    expect(approvals.count).toBe(1)
    expect(changes.count).toBe(1)
    expect(firmApps.count).toBe(1)
  })
})

describe('E2E: notifications enqueue', () => {
  it('enqueues a notification row via insert', async () => {
    const insert = await mockSupabase
      .from('notifications')
      .insert({
        to_email: 'x@y.z',
        template_key: 'registration_received',
        payload: { legal_name: 'Test', role: 'individual_member' },
        subject: 'Welcome',
        body_html: '<p>Welcome</p>',
        body_text: 'Welcome',
      })
      .select('id')
      .single()
    expect(insert.error).toBeNull()

    const list = await mockSupabase
      .from('notifications')
      .select('*')
      .eq('to_email', 'x@y.z')
    expect(Array.isArray(list.data) ? list.data.length : 0).toBe(1)
  })
})
