/**
 * Blackstone QMS Investor API — Service Layer
 *
 * Handles:
 *  - Bearer token acquisition & in-memory caching (30-min lifetime)
 *  - All read endpoints defined in the API guide
 *
 * ⚠️  In production, token requests should go through YOUR backend proxy so
 *     the client_secret never ships in browser-side JavaScript.
 *     For this demo app the calls are made directly from the browser.
 */

import type {
  ApiCredentials,
  ApiInvestorUpdate,
  ApiProject,
  ApiReport,
  ApiWell,
  TokenCache,
  TokenResponse,
} from '../types/api';

const FUNCTIONS_HOST = 'https://iqdminvbtviipxahwuhb.supabase.co/functions/v1';
const TOKEN_ENDPOINT = `${FUNCTIONS_HOST}/investor-api-token`;
const API_BASE = `${FUNCTIONS_HOST}/investor-api`;

// ─── In-memory token cache (per browser session) ──────────────────────────────
let _tokenCache: TokenCache | null = null;
let _credentials: ApiCredentials | null = null;

/** Call this once when the user provides credentials (e.g. settings dialog). */
export function setCredentials(creds: ApiCredentials): void {
  _credentials = creds;
  _tokenCache = null; // invalidate any cached token
}

export function clearCredentials(): void {
  _credentials = null;
  _tokenCache = null;
}

export function hasCredentials(): boolean {
  return _credentials !== null;
}

// ─── Token management ─────────────────────────────────────────────────────────

/** Returns a valid bearer token, requesting a new one if expired or missing. */
async function getBearerToken(): Promise<string> {
  if (!_credentials) {
    throw new Error('API credentials not configured. Call setCredentials() first.');
  }

  // Return cached token if still valid (with 60s buffer before expiry)
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: _credentials.clientId,
    client_secret: _credentials.clientSecret,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Token request failed (${res.status}): ${text}`);
  }

  const data: TokenResponse = await res.json();
  if (!data.success || !data.access_token) {
    throw new Error('Invalid token response from server.');
  }

  _tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return _tokenCache.accessToken;
}

// ─── Generic authenticated GET ────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const token = await getBearerToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public API methods ───────────────────────────────────────────────────────

/** GET /investor-api/projects — list all projects assigned to the credential */
export async function fetchProjects(): Promise<ApiProject[]> {
  return apiGet<ApiProject[]>('/projects');
}

/** GET /investor-api/projects/{projectId} — get one assigned project */
export async function fetchProject(projectId: string): Promise<ApiProject> {
  return apiGet<ApiProject>(`/projects/${projectId}`);
}

/** GET /investor-api/projects/{projectId}/wells — investor-visible well summaries */
export async function fetchWells(projectId: string): Promise<ApiWell[]> {
  return apiGet<ApiWell[]>(`/projects/${projectId}/wells`);
}

/** GET /investor-api/projects/{projectId}/reports — published report summaries */
export async function fetchReports(projectId: string): Promise<ApiReport[]> {
  return apiGet<ApiReport[]>(`/projects/${projectId}/reports`);
}

/** GET /investor-api/projects/{projectId}/updates/latest — latest published update */
export async function fetchLatestUpdate(projectId: string): Promise<ApiInvestorUpdate> {
  return apiGet<ApiInvestorUpdate>(`/projects/${projectId}/updates/latest`);
}
