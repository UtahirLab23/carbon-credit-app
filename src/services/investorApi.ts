/**
 * Blackstone QMS Investor API — Client Service Layer
 *
 * All requests go through our own Next.js API routes (/api/investor/...).
 * The server routes handle token acquisition using env-var credentials.
 * The browser sends NO secrets and NO bearer tokens.
 */

import type {
  ApiInvestorUpdate,
  ApiProject,
  ApiReport,
  ApiWell,
} from '../types/api';

const API_BASE = '/api/investor';

// ─── Generic GET helper ───────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API error (${res.status}): ${text}`);
  }

  const json = await res.json();
  // Blackstone wraps all responses in { success: true, data: ... }
  return (json?.data ?? json) as T;
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
