/**
 * Supabase-generated types placeholder.
 *
 * When Supabase is connected to a live project, regenerate via:
 *   npm run supabase:types
 *
 * Until then, this stub mirrors the 6 migrations hand-typed.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          auth_user_id: string | null
          hkid: string
          email: string
          legal_name: string
          date_of_birth: string | null
          phone: string | null
          address: string | null
          role: 'pwma_admin' | 'member_firm_admin' | 'individual_member' | 'guest'
          account_status:
            | 'pending_email_verify'
            | 'pending_pwma_approval'
            | 'active'
            | 'suspended'
          lifecycle_state: 'employee' | 'unemployed' | 'general_public' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          hkid: string
          email: string
          legal_name: string
          date_of_birth?: string | null
          phone?: string | null
          address?: string | null
          role?:
            | 'pwma_admin'
            | 'member_firm_admin'
            | 'individual_member'
            | 'guest'
          account_status?:
            | 'pending_email_verify'
            | 'pending_pwma_approval'
            | 'active'
            | 'suspended'
          lifecycle_state?: 'employee' | 'unemployed' | 'general_public' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          hkid?: string
          email?: string
          legal_name?: string
          date_of_birth?: string | null
          phone?: string | null
          address?: string | null
          role?:
            | 'pwma_admin'
            | 'member_firm_admin'
            | 'individual_member'
            | 'guest'
          account_status?:
            | 'pending_email_verify'
            | 'pending_pwma_approval'
            | 'active'
            | 'suspended'
          lifecycle_state?: 'employee' | 'unemployed' | 'general_public' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_firms: {
        Row: {
          id: string
          name: string
          business_registration_number: string | null
          tier: 'full_member' | 'associate_member' | 'pending'
          status: 'pending' | 'active' | 'suspended'
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          business_registration_number?: string | null
          tier?: 'full_member' | 'associate_member' | 'pending'
          status?: 'pending' | 'active' | 'suspended'
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_registration_number?: string | null
          tier?: 'full_member' | 'associate_member' | 'pending'
          status?: 'pending' | 'active' | 'suspended'
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      firm_memberships: {
        Row: {
          id: string
          profile_id: string
          firm_id: string
          role_in_firm: 'admin' | 'employee'
          start_date: string
          end_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          firm_id: string
          role_in_firm?: 'admin' | 'employee'
          start_date?: string
          end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          firm_id?: string
          role_in_firm?: 'admin' | 'employee'
          start_date?: string
          end_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      profile_change_requests: {
        Row: {
          id: string
          profile_id: string
          field_name: 'legal_name' | 'date_of_birth' | 'hkid' | 'email'
          old_value: string | null
          new_value: string
          status: 'pending' | 'approved' | 'rejected'
          requested_at: string
          reviewed_by: string | null
          reviewed_at: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          field_name: 'legal_name' | 'date_of_birth' | 'hkid' | 'email'
          old_value?: string | null
          new_value: string
          status?: 'pending' | 'approved' | 'rejected'
          requested_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          field_name?: 'legal_name' | 'date_of_birth' | 'hkid' | 'email'
          old_value?: string | null
          new_value?: string
          status?: 'pending' | 'approved' | 'rejected'
          requested_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          profile_id: string
          application_type: 'CPWP' | 'CPWPA'
          application_kind: 'new' | 'renewal'
          form_data: Json
          status: string
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          application_type: 'CPWP' | 'CPWPA'
          application_kind?: 'new' | 'renewal'
          form_data?: Json
          status?: string
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          application_type?: 'CPWP' | 'CPWPA'
          application_kind?: 'new' | 'renewal'
          form_data?: Json
          status?: string
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      application_status_history: {
        Row: {
          id: string
          application_id: string
          from_status: string | null
          to_status: string
          changed_by: string | null
          note: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          application_id: string
          from_status?: string | null
          to_status: string
          changed_by?: string | null
          note?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          from_status?: string | null
          to_status?: string
          changed_by?: string | null
          note?: string | null
          changed_at?: string
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          id: string
          application_id: string
          document_type: string
          storage_path: string
          original_filename: string | null
          file_size_bytes: number | null
          mime_type: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          application_id: string
          document_type: string
          storage_path: string
          original_filename?: string | null
          file_size_bytes?: number | null
          mime_type?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          document_type?: string
          storage_path?: string
          original_filename?: string | null
          file_size_bytes?: number | null
          mime_type?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      auth_is_pwma_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      auth_is_firm_admin: {
        Args: { target_firm_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
