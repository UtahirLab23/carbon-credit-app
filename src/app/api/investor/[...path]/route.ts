'use server';
/**
 * GET /api/investor/[...path]
 *
 * Fully server-side reverse proxy for all Blackstone QMS investor-api endpoints.
 * Token lifecycle (expiry, refresh, 401-retry) is handled by the shared
 * tokenManager — this route just proxies the request.
 *
 * Example mappings:
 *   /api/investor/projects              → /investor-api/projects
 *   /api/investor/projects/xyz/wells    → /investor-api/projects/xyz/wells
 */
import { NextResponse } from 'next/server';
import { blackstoneFetch } from '@/lib/blackstone/tokenManager';

const BLACKSTONE_API_BASE =
  'https://iqdminvbtviipxahwuhb.supabase.co/functions/v1/investor-api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const upstreamUrl = `${BLACKSTONE_API_BASE}/${path.join('/')}`;

  try {
    const upstream = await blackstoneFetch(upstreamUrl);
    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[investor/proxy]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
