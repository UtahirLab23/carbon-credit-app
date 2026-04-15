/**
 * Blackstone QMS — Server-Side Token Manager
 *
 * Single module that owns the token cache so all API routes share ONE token
 * instead of each minting their own independently.
 *
 * Token lifecycle (from Blackstone API):
 *   expires_in = 1800 seconds (30 minutes)
 *
 * Strategy:
 *   - Cache the token in module-level state (shared within the same Node process)
 *   - Proactively refresh 2 minutes before expiry (not just 60s) to avoid
 *     edge cases where a slow API call starts with a valid token but the token
 *     expires before the upstream responds
 *   - On upstream 401: clear cache and retry ONCE with a fresh token
 *   - Thread-safe: a single in-flight refresh promise is reused to prevent
 *     concurrent requests from all minting tokens simultaneously
 */

const BLACKSTONE_TOKEN_URL =
  'https://iqdminvbtviipxahwuhb.supabase.co/functions/v1/investor-api-token';

// ─── Token cache ──────────────────────────────────────────────────────────────

let _token: string | null = null;
let _expiresAt = 0; // Date.now() ms
let _inflightRefresh: Promise<string> | null = null; // deduplicate concurrent refreshes

/** How many ms before expiry to proactively refresh (2 minutes) */
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function mintToken(): Promise<string> {
  const clientId = process.env.BLACKSTONE_CLIENT_ID;
  const clientSecret = process.env.BLACKSTONE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Blackstone credentials missing. Set BLACKSTONE_CLIENT_ID and BLACKSTONE_CLIENT_SECRET in .env.local'
    );
  }

  const res = await fetch(BLACKSTONE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Blackstone token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  if (!data?.access_token) {
    throw new Error('Blackstone token response missing access_token field');
  }

  const expiresIn: number = data.expires_in ?? 1800; // default 30 min
  _token = data.access_token as string;
  _expiresAt = Date.now() + expiresIn * 1000;

  const expiresInMin = Math.round(expiresIn / 60);
  console.log(`[tokenManager] New token minted. Expires in ${expiresInMin} min (at ${new Date(_expiresAt).toISOString()})`);

  return _token;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a valid Blackstone bearer token.
 * - Returns the cached token if it's still fresh (> 2 min remaining)
 * - Deduplicates concurrent refresh calls — only one HTTP request is made
 *   even if multiple API routes call this simultaneously
 */
export async function getBlackstoneToken(): Promise<string> {
  // Cache hit — token is still fresh
  if (_token && Date.now() < _expiresAt - REFRESH_BUFFER_MS) {
    return _token;
  }

  // Deduplicate: if a refresh is already in flight, wait for it
  if (_inflightRefresh) {
    return _inflightRefresh;
  }

  // Start a new refresh, store the promise so concurrent callers reuse it
  _inflightRefresh = mintToken().finally(() => {
    _inflightRefresh = null;
  });

  return _inflightRefresh;
}

/**
 * Clears the token cache, forcing a fresh mint on the next call.
 * Called automatically when an upstream API returns 401.
 */
export function invalidateToken(): void {
  console.log('[tokenManager] Token invalidated — will re-mint on next request');
  _token = null;
  _expiresAt = 0;
  _inflightRefresh = null;
}

/**
 * Fetches a Blackstone API endpoint with automatic 401 retry.
 *
 * On first 401:  invalidates cache → mints fresh token → retries ONCE
 * On second 401: throws, so the caller returns a proper error response
 *
 * @param url     Full upstream URL
 * @param attempt Internal — which attempt this is (1 or 2)
 */
export async function blackstoneFetch(url: string, attempt = 1): Promise<Response> {
  const token = await getBlackstoneToken();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (res.status === 401 && attempt === 1) {
    console.warn(`[tokenManager] 401 on ${url} — invalidating token and retrying`);
    invalidateToken();
    return blackstoneFetch(url, 2);
  }

  return res;
}
