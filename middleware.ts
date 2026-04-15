import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ─── Route permission map ─────────────────────────────────────────────────────
// Routes not listed here are accessible to ANY authenticated user.
// Routes listed require the user's role to be in the allowed array.
const ROLE_REQUIRED: Record<string, Array<'Admin' | 'Manager' | 'Viewer'>> = {
  '/users': ['Admin', 'Manager'],
};

export async function middleware(request: NextRequest) {
  // Guard: if env vars are missing (e.g. Vercel deployment without env vars set),
  // skip middleware entirely rather than crashing with MIDDLEWARE_INVOCATION_FAILED.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const isAuthRoute   = pathname.startsWith('/login');
  const isPublicRoute = pathname.startsWith('/accept-invite') || pathname.startsWith('/api/');

  // Fast-path: no session cookie → redirect to login (no network call)
  const hasSessionCookie = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );
  if (!hasSessionCookie && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isPublicRoute) return NextResponse.next({ request });

  // Verify the session with Supabase (needed for role check too)
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → login page
  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in → skip login page
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Role-based access control ───────────────────────────────────────────────
  if (user) {
    const userRole = (user.user_metadata?.role ?? 'Viewer') as string;

    for (const [route, allowedRoles] of Object.entries(ROLE_REQUIRED)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole as 'Admin' | 'Manager' | 'Viewer')) {
          // Redirect to /dashboard with a query param so the UI can show a toast
          const url = new URL('/dashboard', request.url);
          url.searchParams.set('forbidden', route.replace('/', ''));
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static  (Next.js static assets)
     * - _next/image   (Next.js image optimiser)
     * - favicon.ico   (browser default)
     * - public files  (png, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
