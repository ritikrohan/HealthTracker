import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    
    if (error) {
      return NextResponse.json({ 
        authenticated: false, 
        error: error.message,
        details: 'Auth session missing or invalid'
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No user found',
        details: 'User not authenticated'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      message: 'Authentication successful'
    })
    
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


