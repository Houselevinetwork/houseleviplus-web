import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page through
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Allow Next.js internals and API routes through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check for admin token cookie
  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};