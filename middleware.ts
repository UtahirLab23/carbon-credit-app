import { NextResponse, type NextRequest } from 'next/server';

// ─── Route permission map ─────────────────────────────────────────────────────
const ROLE_REQUIRED: Record<string, Array<'Admin' | 'Manager' | 'Viewer'>> = {
  '/users': ['Admin', 'Manager'],
};

/** Decode a JWT payload without verifying the signature (Edge-safe, no network call). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    // Edge runtime supports atob
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute   = pathname.startsWith('/login');
  const isPublicRoute = pathname.startsWith('/accept-invite') || pathname.startsWith('/api/');

  if (isPublicRoute) return NextResponse.next();

  // Find the Supabase access token cookie (format: sb-<project-ref>-auth-token)
  const tokenCookie = request.cookies.getAll().find(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  // No session → redirect to login
  if (!tokenCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in → skip login page
  if (tokenCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Role-based access control (decode JWT, no network call) ─────────────────
  if (tokenCookie) {
    let accessToken = tokenCookie.value;

    // The cookie value may be a JSON array: ["access_token","refresh_token"]
    try {
      const parsed = JSON.parse(accessToken);
      if (Array.isArray(parsed)) accessToken = parsed[0] as string;
    } catch {
      // not JSON — use as-is
    }

    const payload = decodeJwtPayload(accessToken);
    const userRole = (
      (payload?.user_metadata as Record<string, unknown>)?.role ??
      (payload?.app_metadata as Record<string, unknown>)?.role ??
      'Viewer'
    ) as string;

    // Check expiry
    const exp = payload?.exp as number | undefined;
    if (exp && Date.now() / 1000 > exp) {
      // Token expired — redirect to login
      if (!isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    for (const [route, allowedRoles] of Object.entries(ROLE_REQUIRED)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole as 'Admin' | 'Manager' | 'Viewer')) {
          const url = new URL('/dashboard', request.url);
          url.searchParams.set('forbidden', route.replace('/', ''));
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
