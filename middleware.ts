import { NextResponse } from 'next/server';

// Middleware is intentionally minimal — auth protection is handled
// client-side by AuthProvider and RoleGuard to avoid Edge runtime issues.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
