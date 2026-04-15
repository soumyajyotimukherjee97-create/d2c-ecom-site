import { NextResponse, type NextRequest } from 'next/server'
import { updateSession, isStaff } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = new Set<string>(['/login'])

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Public routes (only /login for now) — redirect authed staff into the console.
  if (PUBLIC_PATHS.has(pathname)) {
    if (user && isStaff(user)) {
      const dashboard = request.nextUrl.clone()
      dashboard.pathname = '/dashboard'
      dashboard.search = ''
      return NextResponse.redirect(dashboard)
    }
    return response
  }

  // Everything else requires a signed-in staff user.
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`
    return NextResponse.redirect(loginUrl)
  }

  if (!isStaff(user)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = '?error=unauthorized'
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|txt)$).*)',
  ],
}
