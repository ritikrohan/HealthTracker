import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserFromRequest } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseClient = await createServerSupabaseClient()

    const { searchParams } = new URL(request.url)
    const testName = searchParams.get('testName')

    let query = supabaseClient
      .from('test_comparisons')
      .select(`
        *,
        current_report:health_reports!current_report_id (
          test_date,
          results,
          ai_summary
        ),
        previous_report:health_reports!previous_report_id (
          test_date,
          results
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (testName) {
      query = query.eq('test_name', testName)
    }

    const { data: comparisons, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch comparisons' }, { status: 500 })
    }

    return NextResponse.json({ comparisons })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
