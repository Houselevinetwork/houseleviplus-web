import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  if (pathname.startsWith('/blocked') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  const token = searchParams.get('token') || request.cookies.get('studio_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/blocked', request.url))
  }
  const response = NextResponse.next()
  if (searchParams.get('token')) {
    response.cookies.set('studio_token', searchParams.get('token')!, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7
    })
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
}
