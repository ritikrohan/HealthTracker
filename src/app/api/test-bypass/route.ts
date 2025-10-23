import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // This endpoint bypasses authentication for testing
    return NextResponse.json({
      success: true,
      message: 'Test bypass endpoint working',
      timestamp: new Date().toISOString(),
      authenticated: false,
      note: 'This endpoint bypasses authentication for testing purposes'
    })
    
  } catch (error) {
    console.error('Test bypass error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'Test bypass POST endpoint working',
      receivedData: body,
      timestamp: new Date().toISOString(),
      authenticated: false,
      note: 'This endpoint bypasses authentication for testing purposes'
    })
    
  } catch (error) {
    console.error('Test bypass POST error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


