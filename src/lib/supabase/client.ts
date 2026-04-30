import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { mockSupabase, type MockSupabase } from './mock-client'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const MOCK_URLS = new Set<string>([
  '',
  'http://127.0.0.1:54321',
  'http://localhost:54321',
])

const shouldUseMock =
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  SUPABASE_ANON_KEY.includes('placeholder') ||
  MOCK_URLS.has(SUPABASE_URL)

if (shouldUseMock) {
  console.info(
    '[supabase] using in-memory mock client (no VITE_SUPABASE_URL configured). Data persists in localStorage. Flip env vars to a real project to switch.',
  )
}

/**
 * Exported as SupabaseClient<Database> for call-site type safety. When the
 * mock is active the runtime shape is MockSupabase, which implements the
 * methods the app actually uses. We cast once here so downstream files can
 * stay identical whether the backend is real or mocked.
 */
export const supabase: SupabaseClient<Database> = shouldUseMock
  ? (mockSupabase as unknown as SupabaseClient<Database>)
  : createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export const isMockSupabase = shouldUseMock

export type { MockSupabase }
