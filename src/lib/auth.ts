import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createClientFromRequest(request: NextRequest) {
  let supabaseAccessToken = ''

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseAccessToken = cookiesToSet.find(({ name }) => name === 'sb-access-token')?.value ?? ''
        },
      },
    }
  )

  return { supabase, supabaseAccessToken }
}

export async function updateSession(request: NextRequest) {
  const { supabase, supabaseAccessToken } = await createClientFromRequest(request)

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user ||
    (supabaseAccessToken && Date.now() / 1000 > JSON.parse(atob(supabaseAccessToken.split('.')[1])).exp)
  ) {
    // no user or potentially expired access token, so we should clear the session
    const response = NextResponse.next({
      request,
    })

    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')

    return response
  }

  // IMPORTANT: You *must* return the response from the middleware, or else the
  // request will not be properly handled and you may get into a redirect loop.

  return NextResponse.next({
    request,
  })
}

