import { NextResponse } from 'next/server'

// Temporary hardcoded tokens (later connect to your API)
const VALID_TOKENS = [
  'admin-2024',
  'studio-access-123',
  'test-token-456'
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ valid: false, error: 'No token provided' }, { status: 400 })
  }

  const isValid = VALID_TOKENS.includes(token)

  if (isValid) {
    return NextResponse.json({ 
      valid: true, 
      user: { 
        name: 'Admin User',
        role: 'admin'
      }
    })
  }

  return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 })
}
