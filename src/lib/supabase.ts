import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Client-side createClient function for components
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface HealthDocument {
  id: string
  user_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  upload_date: string
  document_type: 'lab_report' | 'medical_record' | 'prescription' | 'other'
  status: 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface HealthReport {
  id: string
  user_id: string
  document_id: string
  test_name: string
  test_category: 'blood_work' | 'imaging' | 'vital_signs' | 'specialized' | 'other'
  test_date: string
  results: Record<string, any>
  ai_summary: string
  normal_ranges: Record<string, any>
  flagged_values: string[]
  recommendations: string[]
  created_at: string
  updated_at: string
}

export interface TestComparison {
  id: string
  user_id: string
  current_report_id: string
  previous_report_id: string
  test_name: string
  comparison_data: Record<string, any>
  trends: Record<string, 'improving' | 'stable' | 'declining'>
  created_at: string
}
