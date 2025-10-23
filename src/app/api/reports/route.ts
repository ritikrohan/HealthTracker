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
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') || '50'

    let query = supabaseClient
      .from('health_reports')
      .select(`
        *,
        health_documents (
          file_name,
          upload_date,
          document_type
        )
      `)
      .eq('user_id', user.id)
      .order('test_date', { ascending: false })
      .limit(parseInt(limit))

    if (category) {
      query = query.eq('test_category', category)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }

    return NextResponse.json({ reports })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
