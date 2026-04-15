'use server';
/**
 * POST /api/investor/token
 *
 * Thin wrapper — delegates to the shared tokenManager.
 * Kept for manual testing/debugging only.
 * All production routes use tokenManager directly.
 */
import { NextResponse } from 'next/server';
import { getBlackstoneToken, invalidateToken } from '@/lib/blackstone/tokenManager';

export async function POST(request: Request) {
  try {
    // Optional: ?force=1 to force a fresh mint (for debugging)
    const { searchParams } = new URL(request.url);
    if (searchParams.get('force') === '1') {
      invalidateToken();
    }

    const access_token = await getBlackstoneToken();
    return NextResponse.json({ access_token });
  } catch (err) {
    console.error('[investor/token]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
