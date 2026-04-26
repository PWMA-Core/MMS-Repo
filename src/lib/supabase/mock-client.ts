/**
 * In-memory Supabase-compatible client, backed by localStorage so data
 * persists across page reloads. Activated automatically when
 * VITE_SUPABASE_URL is missing or is the placeholder default.
 *
 * Covers the subset of @supabase/supabase-js the app actually calls:
 *   auth: signUp, signInWithPassword, signOut, getSession,
 *         onAuthStateChange, resetPasswordForEmail
 *   postgrest: from(table).select|insert|update|delete, chained with
 *              eq/in/is/order/limit/maybeSingle/single, plus nested
 *              relations via `profile:profiles(...)` rewrite
 *   storage: from(bucket).upload(path, file)
 *
 * Not exhaustive. If a flow breaks, add the missing chain method here.
 */

import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type TableName = keyof Tables
type Row<T extends TableName> = Tables[T]['Row']

interface MockAuthUser {
  id: string
  email: string
  password: string
  created_at: string
  email_confirmed_at: string | null
}

interface MockStorageObject {
  bucket: string
  path: string
  filename: string
  size: number
  mime: string
  created_at: string
}

type MockDb = {
  [T in TableName]: Row<T>[]
} & {
  auth_users: MockAuthUser[]
  storage_objects: MockStorageObject[]
}

const DB_KEY = '__pwma_mock_db_v2__'
const SESSION_KEY = '__pwma_mock_session__'

function nowIso(): string {
  return new Date().toISOString()
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'mock-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function emptyDb(): MockDb {
  return {
    profiles: [],
    member_firms: [],
    firm_memberships: [],
    profile_change_requests: [],
    applications: [],
    application_status_history: [],
    application_documents: [],
    firm_applications: [],
    renewal_periods: [],
    opt_records: [],
    notifications: [],
    auth_users: [],
    storage_objects: [],
  }
}

function seedDb(): MockDb {
  const db = emptyDb()
  const createdAt = nowIso()
  // Seed firms matching supabase/seed.sql
  db.member_firms.push(
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'HSBC (Test)',
      business_registration_number: 'BR12345678',
      tier: 'full_member',
      status: 'active',
      address: null,
      contact_email: null,
      contact_phone: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Standard Chartered (Test)',
      business_registration_number: 'BR87654321',
      tier: 'full_member',
      status: 'active',
      address: null,
      contact_email: null,
      contact_phone: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      name: 'Test Associate Firm',
      business_registration_number: 'BR00000001',
      tier: 'associate_member',
      status: 'active',
      address: null,
      contact_email: null,
      contact_phone: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
  )
  // Seed renewal periods
  db.renewal_periods.push(
    {
      id: uuid(),
      year: 2026,
      opens_at: '2026-01-01',
      closes_at: '2026-12-31',
      opt_hours_required: 10,
      late_penalty_cpwp: 500,
      late_penalty_cpwpa: 250,
      created_at: createdAt,
    },
    {
      id: uuid(),
      year: 2027,
      opens_at: '2027-01-01',
      closes_at: '2027-12-31',
      opt_hours_required: 10,
      late_penalty_cpwp: 500,
      late_penalty_cpwpa: 250,
      created_at: createdAt,
    },
  )
  // Seed one PWMA admin + one active member + one firm admin so the
  // review queues have referable users and the firm dashboard has data.
  const adminAuthId = 'seed-auth-admin'
  const memberAuthId = 'seed-auth-member'
  const firmAdminAuthId = 'seed-auth-firm-admin'
  db.auth_users.push(
    {
      id: adminAuthId,
      email: 'admin@pwma.test',
      password: 'demo-password-123',
      created_at: createdAt,
      email_confirmed_at: createdAt,
    },
    {
      id: memberAuthId,
      email: 'member@pwma.test',
      password: 'demo-password-123',
      created_at: createdAt,
      email_confirmed_at: createdAt,
    },
    {
      id: firmAdminAuthId,
      email: 'firm.admin@hsbc.test',
      password: 'demo-password-123',
      created_at: createdAt,
      email_confirmed_at: createdAt,
    },
  )
  db.profiles.push(
    {
      id: 'seed-profile-admin',
      auth_user_id: adminAuthId,
      hkid: 'A1234563',
      email: 'admin@pwma.test',
      legal_name: 'Demo PWMA Admin',
      date_of_birth: '1980-01-01',
      phone: '+85229999999',
      address: 'PWMA Office, HK',
      role: 'pwma_admin',
      account_status: 'active',
      lifecycle_state: 'employee',
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: 'seed-profile-member',
      auth_user_id: memberAuthId,
      hkid: 'B2345670',
      email: 'member@pwma.test',
      legal_name: 'Demo Member',
      date_of_birth: '1990-05-05',
      phone: '+85212345678',
      address: '1 Central, HK',
      role: 'individual_member',
      account_status: 'active',
      lifecycle_state: 'employee',
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: 'seed-profile-firm-admin',
      auth_user_id: firmAdminAuthId,
      hkid: 'C3456780',
      email: 'firm.admin@hsbc.test',
      legal_name: 'Demo Firm Admin',
      date_of_birth: '1985-06-15',
      phone: '+85228888888',
      address: 'HSBC HQ, HK',
      role: 'member_firm_admin',
      account_status: 'active',
      lifecycle_state: 'employee',
      created_at: createdAt,
      updated_at: createdAt,
    },
  )
  db.firm_memberships.push(
    {
      id: uuid(),
      profile_id: 'seed-profile-firm-admin',
      firm_id: '10000000-0000-0000-0000-000000000001',
      role_in_firm: 'admin',
      start_date: '2024-01-01',
      end_date: null,
      created_at: createdAt,
    },
    {
      id: uuid(),
      profile_id: 'seed-profile-member',
      firm_id: '10000000-0000-0000-0000-000000000001',
      role_in_firm: 'employee',
      start_date: '2024-06-01',
      end_date: null,
      created_at: createdAt,
    },
  )
  return db
}

function loadDb(): MockDb {
  if (typeof window === 'undefined') return seedDb()
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      const seeded = seedDb()
      localStorage.setItem(DB_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw) as MockDb
  } catch {
    return seedDb()
  }
}

function saveDb(db: MockDb): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (err) {
    console.warn('[mock-supabase] saveDb failed', err)
  }
}

export function resetMockDb(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DB_KEY)
  localStorage.removeItem(SESSION_KEY)
}

let db: MockDb = loadDb()

function persist(): void {
  saveDb(db)
}

// ---------- Auth ----------

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'INITIAL_SESSION'

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void
const authListeners = new Set<AuthListener>()

function buildUser(u: MockAuthUser): User {
  return {
    id: u.id,
    email: u.email,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: {},
    created_at: u.created_at,
    updated_at: u.created_at,
    email_confirmed_at: u.email_confirmed_at ?? new Date().toISOString(),
    phone: '',
    confirmed_at: u.email_confirmed_at ?? new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    identities: [],
    factors: [],
    is_anonymous: false,
  } as unknown as User
}

function buildSession(user: User): Session {
  return {
    access_token: 'mock-access-' + user.id,
    refresh_token: 'mock-refresh-' + user.id,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  } as unknown as Session
}

function loadSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function saveSession(session: Session | null): void {
  if (typeof window === 'undefined') return
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

function notifyAuth(event: AuthChangeEvent, session: Session | null): void {
  for (const l of authListeners) l(event, session)
}

const auth = {
  async signUp({
    email,
    password,
  }: {
    email: string
    password: string
    options?: unknown
  }) {
    if (db.auth_users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return {
        data: { user: null, session: null },
        error: { message: 'User already registered', name: 'AuthError' },
      }
    }
    const user: MockAuthUser = {
      id: uuid(),
      email,
      password,
      created_at: nowIso(),
      email_confirmed_at: nowIso(), // auto-confirm in mock mode
    }
    db.auth_users.push(user)
    persist()
    const authUser = buildUser(user)
    const session = buildSession(authUser)
    saveSession(session)
    notifyAuth('SIGNED_IN', session)
    return { data: { user: authUser, session }, error: null }
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const user = db.auth_users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || user.password !== password) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', name: 'AuthError' },
      }
    }
    const authUser = buildUser(user)
    const session = buildSession(authUser)
    saveSession(session)
    notifyAuth('SIGNED_IN', session)
    return { data: { user: authUser, session }, error: null }
  },

  async signOut() {
    saveSession(null)
    notifyAuth('SIGNED_OUT', null)
    return { error: null }
  },

  async resetPasswordForEmail(email: string) {
    const user = db.auth_users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      // Supabase returns success to avoid user enumeration; mirror that.
      return { data: {}, error: null }
    }
    console.info(
      `[mock-supabase] reset-password link for ${email}: would dispatch via M365 worker in real mode.`,
    )
    return { data: {}, error: null }
  },

  async getSession() {
    return { data: { session: loadSession() }, error: null }
  },

  async getUser() {
    const session = loadSession()
    return { data: { user: session?.user ?? null }, error: null }
  },

  onAuthStateChange(listener: AuthListener) {
    authListeners.add(listener)
    // Fire initial event synchronously with current state
    const session = loadSession()
    queueMicrotask(() => listener('INITIAL_SESSION', session))
    return {
      data: {
        subscription: {
          id: uuid(),
          callback: listener,
          unsubscribe: () => authListeners.delete(listener),
        },
      },
    }
  },
}

// ---------- Postgrest ----------

interface Filter {
  kind: 'eq' | 'neq' | 'in' | 'is' | 'gte' | 'lte'
  column: string
  value: unknown
}

interface OrderClause {
  column: string
  ascending: boolean
  nullsFirst?: boolean
}

interface SelectOptions {
  count?: 'exact' | 'planned' | 'estimated'
  head?: boolean
}

function getValue(row: Record<string, unknown>, path: string): unknown {
  return row[path]
}

function applyFilters<T>(rows: T[], filters: Filter[]): T[] {
  return rows.filter((row) => {
    const r = row as unknown as Record<string, unknown>
    for (const f of filters) {
      const v = getValue(r, f.column)
      switch (f.kind) {
        case 'eq':
          if (v !== f.value) return false
          break
        case 'neq':
          if (v === f.value) return false
          break
        case 'in':
          if (!(f.value as unknown[]).includes(v)) return false
          break
        case 'is':
          if (f.value === null) {
            if (v !== null && v !== undefined) return false
          } else if (v !== f.value) {
            return false
          }
          break
        case 'gte':
          if (typeof v !== typeof f.value || (v as number) < (f.value as number))
            return false
          break
        case 'lte':
          if (typeof v !== typeof f.value || (v as number) > (f.value as number))
            return false
          break
      }
    }
    return true
  })
}

function applyOrder<T>(rows: T[], orders: OrderClause[]): T[] {
  if (orders.length === 0) return rows
  const copy = [...rows]
  copy.sort((a, b) => {
    for (const o of orders) {
      const av = (a as unknown as Record<string, unknown>)[o.column]
      const bv = (b as unknown as Record<string, unknown>)[o.column]
      if (av === bv) continue
      if (av === null || av === undefined) return o.nullsFirst ? -1 : 1
      if (bv === null || bv === undefined) return o.nullsFirst ? 1 : -1
      if ((av as number | string) < (bv as number | string)) return o.ascending ? -1 : 1
      if ((av as number | string) > (bv as number | string)) return o.ascending ? 1 : -1
    }
    return 0
  })
  return copy
}

/**
 * Expand relation tokens like `profile:profiles(id, legal_name)` in
 * select strings. For each expanded relation on a row, attach the joined
 * row from the referenced table using the column convention
 * `<relation>_id` (e.g., `profile_id` references `profiles`).
 */
function applyRelations<T>(rows: T[], selectString: string): T[] {
  const relationPattern = /(\w+)\s*:\s*(\w+)\s*\(([^)]*)\)/g
  const matches: Array<{ alias: string; relTable: TableName; fields: string[] }> = []
  let m: RegExpExecArray | null
  while ((m = relationPattern.exec(selectString)) !== null) {
    matches.push({
      alias: m[1]!,
      relTable: m[2]! as TableName,
      fields: m[3]!
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }
  if (matches.length === 0) return rows
  return rows.map((row) => {
    const r = { ...(row as Record<string, unknown>) }
    for (const mx of matches) {
      const fkColumn = `${mx.alias}_id`
      const fkValue = r[fkColumn]
      const relRows = db[mx.relTable] as Record<string, unknown>[]
      const related = relRows.find((rr) => rr.id === fkValue) ?? null
      if (!related) {
        r[mx.alias] = null
      } else if (mx.fields.length === 0) {
        r[mx.alias] = related
      } else {
        const subset: Record<string, unknown> = {}
        for (const f of mx.fields) subset[f] = related[f]
        r[mx.alias] = subset
      }
    }
    return r as unknown as T
  })
}

type Result<T> = {
  data: T | null
  error: { message: string } | null
  count?: number | null
}

class PostgrestBuilder<T> implements PromiseLike<Result<T>> {
  protected filters: Filter[] = []
  protected orders: OrderClause[] = []
  protected limitVal: number | null = null
  protected singleMode: 'none' | 'maybe' | 'required' = 'none'
  protected selectString = '*'
  protected selectOptions: SelectOptions = {}
  protected table: TableName
  protected mode: 'select' | 'insert' | 'update' | 'delete'
  protected payload: unknown

  constructor(
    table: TableName,
    mode: 'select' | 'insert' | 'update' | 'delete',
    payload?: unknown,
  ) {
    this.table = table
    this.mode = mode
    this.payload = payload
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ kind: 'eq', column, value })
    return this
  }
  neq(column: string, value: unknown): this {
    this.filters.push({ kind: 'neq', column, value })
    return this
  }
  in(column: string, values: unknown[]): this {
    this.filters.push({ kind: 'in', column, value: values })
    return this
  }
  is(column: string, value: unknown): this {
    this.filters.push({ kind: 'is', column, value })
    return this
  }
  gte(column: string, value: unknown): this {
    this.filters.push({ kind: 'gte', column, value })
    return this
  }
  lte(column: string, value: unknown): this {
    this.filters.push({ kind: 'lte', column, value })
    return this
  }
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this.orders.push({
      column,
      ascending: options?.ascending ?? true,
      nullsFirst: options?.nullsFirst,
    })
    return this
  }
  limit(n: number): this {
    this.limitVal = n
    return this
  }
  maybeSingle(): this {
    this.singleMode = 'maybe'
    return this
  }
  single(): this {
    this.singleMode = 'required'
    return this
  }
  select(columns = '*', options?: SelectOptions): this {
    this.selectString = columns
    if (options) this.selectOptions = options
    return this
  }

  protected executeSelect(): Result<T> {
    let rows = [...(db[this.table] as unknown as Record<string, unknown>[])]
    rows = applyFilters(rows, this.filters)
    rows = applyOrder(rows as Record<string, unknown>[], this.orders)
    if (this.limitVal !== null) rows = rows.slice(0, this.limitVal)
    rows = applyRelations(rows, this.selectString) as Record<string, unknown>[]
    if (this.selectOptions.head) {
      return {
        data: null,
        error: null,
        count: rows.length,
      }
    }
    if (this.singleMode === 'required') {
      if (rows.length !== 1) {
        return {
          data: null,
          error: {
            message:
              rows.length === 0
                ? 'Query returned no rows (mock)'
                : 'Query returned multiple rows (mock)',
          },
          count: rows.length,
        }
      }
      return { data: rows[0] as unknown as T, error: null, count: 1 }
    }
    if (this.singleMode === 'maybe') {
      return {
        data: (rows[0] ?? null) as unknown as T,
        error: null,
        count: rows.length,
      }
    }
    return {
      data: rows as unknown as T,
      error: null,
      count: rows.length,
    }
  }

  protected executeInsert(): Result<T> {
    const tableRows = db[this.table] as unknown as Record<string, unknown>[]
    const toInsert = Array.isArray(this.payload)
      ? (this.payload as Record<string, unknown>[])
      : [this.payload as Record<string, unknown>]
    const inserted: Record<string, unknown>[] = []
    const now = nowIso()
    for (const raw of toInsert) {
      const row = applyTableDefaults(this.table, { ...raw }, now)
      if (!row.id) row.id = uuid()
      if (!row.created_at) row.created_at = now
      if ('updated_at' in row || tableHasUpdatedAt(this.table)) {
        row.updated_at = now
      }
      // Enforce unique constraints we rely on
      if (this.table === 'profiles') {
        const existing = tableRows.find(
          (r) => r.email === row.email || r.hkid === row.hkid,
        )
        if (existing) {
          return {
            data: null,
            error: {
              message:
                existing.email === row.email
                  ? 'duplicate key value violates unique constraint: email'
                  : 'duplicate key value violates unique constraint: hkid',
            },
          }
        }
        // Mock mode auto-confirms email on signUp, so bump the freshly
        // inserted profile straight into the PWMA review queue. This
        // mirrors what a production trigger would do after email verify.
        if (row.account_status === 'pending_email_verify') {
          row.account_status = 'pending_pwma_approval'
        }
      }
      tableRows.push(row)
      inserted.push(row)
    }
    persist()
    if (this.singleMode === 'required' || this.singleMode === 'maybe') {
      return { data: inserted[0] as unknown as T, error: null }
    }
    return { data: inserted as unknown as T, error: null }
  }

  protected executeUpdate(): Result<T> {
    const rows = db[this.table] as unknown as Record<string, unknown>[]
    const targets = applyFilters(rows, this.filters)
    const patch = this.payload as Record<string, unknown>
    const now = nowIso()
    for (const target of targets) {
      Object.assign(target, patch)
      if (tableHasUpdatedAt(this.table)) target.updated_at = now
    }
    persist()
    if (this.singleMode === 'required' || this.singleMode === 'maybe') {
      return {
        data: (targets[0] ?? null) as unknown as T,
        error: null,
      }
    }
    return { data: targets as unknown as T, error: null }
  }

  protected executeDelete(): Result<T> {
    const rows = db[this.table] as unknown as Record<string, unknown>[]
    const removed: Record<string, unknown>[] = []
    for (let i = rows.length - 1; i >= 0; i--) {
      if (applyFilters([rows[i]!], this.filters).length > 0) {
        removed.push(rows.splice(i, 1)[0]!)
      }
    }
    persist()
    return { data: removed as unknown as T, error: null }
  }

  then<R1 = Result<T>, R2 = never>(
    onFulfilled?: ((value: Result<T>) => R1 | PromiseLike<R1>) | null | undefined,
    onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null | undefined,
  ): PromiseLike<R1 | R2> {
    try {
      let result: Result<T>
      switch (this.mode) {
        case 'select':
          result = this.executeSelect()
          break
        case 'insert':
          result = this.executeInsert()
          break
        case 'update':
          result = this.executeUpdate()
          break
        case 'delete':
          result = this.executeDelete()
          break
      }
      return Promise.resolve(result).then(onFulfilled, onRejected)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mock query error'
      return Promise.resolve({ data: null, error: { message } }).then(
        onFulfilled as never,
        onRejected,
      )
    }
  }
}

/**
 * Applies column defaults that the Postgres migrations set via DEFAULT
 * clauses. The real app omits these fields on insert and relies on the DB
 * to fill them; the mock needs to mirror that behaviour.
 */
function applyTableDefaults(
  table: TableName,
  row: Record<string, unknown>,
  now: string,
): Record<string, unknown> {
  switch (table) {
    case 'profiles':
      if (!row.role) row.role = 'individual_member'
      if (!row.account_status) row.account_status = 'pending_email_verify'
      break
    case 'member_firms':
      if (!row.tier) row.tier = 'pending'
      if (!row.status) row.status = 'pending'
      break
    case 'firm_memberships':
      if (!row.role_in_firm) row.role_in_firm = 'employee'
      if (!row.start_date) row.start_date = now.slice(0, 10)
      break
    case 'profile_change_requests':
      if (!row.status) row.status = 'pending'
      if (!row.requested_at) row.requested_at = now
      break
    case 'applications':
      if (!row.application_kind) row.application_kind = 'new'
      if (!row.status) row.status = 'pending_for_checker'
      if (!row.form_data) row.form_data = {}
      break
    case 'firm_applications':
      if (!row.tier_requested) row.tier_requested = 'full_member'
      if (!row.status) row.status = 'submitted'
      if (!row.submitted_at) row.submitted_at = now
      if (!row.director_signoffs) row.director_signoffs = []
      break
    case 'notifications':
      if (!row.status) row.status = 'queued'
      if (!row.provider) row.provider = 'm365'
      if (row.attempt_count == null) row.attempt_count = 0
      if (!row.queued_at) row.queued_at = now
      if (!row.payload) row.payload = {}
      break
    case 'opt_records':
      if (!row.source) row.source = 'event'
      if (!row.recorded_at) row.recorded_at = now
      break
  }
  return row
}

function tableHasUpdatedAt(table: TableName): boolean {
  // Tables in the migrations that have updated_at triggers
  return [
    'profiles',
    'member_firms',
    'applications',
    'firm_applications',
    'notifications',
  ].includes(table as string)
}

class InsertBuilder<T> extends PostgrestBuilder<T> {
  constructor(table: TableName, payload: unknown) {
    super(table, 'insert', payload)
  }
}

class UpdateBuilder<T> extends PostgrestBuilder<T> {
  constructor(table: TableName, payload: unknown) {
    super(table, 'update', payload)
  }
}

class DeleteBuilder<T> extends PostgrestBuilder<T> {
  constructor(table: TableName) {
    super(table, 'delete')
  }
}

class SelectBuilder<T> extends PostgrestBuilder<T> {
  constructor(table: TableName, columns: string, options?: SelectOptions) {
    super(table, 'select')
    this.selectString = columns
    if (options) this.selectOptions = options
  }
}

function fromTable(table: TableName) {
  return {
    select(columns?: string, options?: SelectOptions) {
      return new SelectBuilder(table, columns ?? '*', options)
    },
    insert(payload: unknown) {
      return new InsertBuilder(table, payload)
    },
    update(payload: unknown) {
      return new UpdateBuilder(table, payload)
    },
    delete() {
      return new DeleteBuilder(table)
    },
  }
}

// ---------- Storage ----------

const storage = {
  from(bucket: string) {
    return {
      async upload(path: string, file: File) {
        const obj: MockStorageObject = {
          bucket,
          path,
          filename: file.name,
          size: file.size,
          mime: file.type,
          created_at: nowIso(),
        }
        db.storage_objects.push(obj)
        persist()
        return { data: { path }, error: null }
      },
      async createSignedUrl(path: string) {
        const url = `mock://storage/${bucket}/${path}`
        return { data: { signedUrl: url }, error: null }
      },
      async download(path: string) {
        const obj = db.storage_objects.find((o) => o.bucket === bucket && o.path === path)
        if (!obj) return { data: null, error: { message: 'not found' } }
        const blob = new Blob([`mock content for ${obj.filename}`], {
          type: obj.mime,
        })
        return { data: blob, error: null }
      },
    }
  },
}

// ---------- Public client ----------

export interface MockSupabase {
  auth: typeof auth
  from: typeof fromTable
  storage: typeof storage
}

export const mockSupabase: MockSupabase = {
  auth,
  from: fromTable,
  storage,
}

/**
 * Reload the in-memory `db` reference from localStorage. Call after
 * `resetMockDb()` so subsequent queries see the fresh seed.
 */
export function reloadMockDb(): void {
  db = loadDb()
}
