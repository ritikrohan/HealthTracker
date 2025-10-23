import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserFromRequest } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getUserFromRequest(request)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseClient = await createServerSupabaseClient()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF and images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('health-documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('health-documents')
      .getPublicUrl(fileName)

    // Save document record to database
    const { data: documentData, error: documentError } = await supabaseClient
      .from('health_documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        document_type: documentType || 'other',
        status: 'processing'
      })
      .select()
      .single()

    if (documentError) {
      console.error('Database error:', documentError)
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      documentId: documentData.id,
      message: 'Document uploaded successfully.'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
