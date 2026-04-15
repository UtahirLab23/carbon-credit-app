'use server';
/**
 * GET /api/investor/dashboard
 *
 * Single server-side route that fetches all dashboard data in parallel:
 *   - projects list
 *   - wells for the first project
 *   - latest investor update for the first project
 *
 * Returns: { project, wells, latestUpdate }
 *
 * Token lifecycle is handled by the shared tokenManager — automatic refresh
 * before expiry and 401-retry are both covered there.
 */
import { NextResponse } from 'next/server';
import { blackstoneFetch } from '@/lib/blackstone/tokenManager';

const BLACKSTONE_API_BASE =
  'https://iqdminvbtviipxahwuhb.supabase.co/functions/v1/investor-api';

async function bGet(path: string) {
  const res = await blackstoneFetch(`${BLACKSTONE_API_BASE}${path}`);
  if (!res.ok) throw new Error(`Upstream ${path} failed (${res.status})`);
  const json = await res.json();
  return json?.data ?? json;
}

export async function GET() {
  try {
    // Step 1: fetch projects
    const projects = await bGet('/projects');
    const project = Array.isArray(projects) ? projects[0] : projects;

    if (!project?.id) {
      return NextResponse.json({ error: 'No projects found for these credentials.' }, { status: 404 });
    }

    // Step 2: fetch wells + latest update IN PARALLEL (biggest time saving)
    const [wells, latestUpdate] = await Promise.all([
      bGet(`/projects/${project.id}/wells`),
      bGet(`/projects/${project.id}/updates/latest`).catch(() => null),
    ]);

    return NextResponse.json({
      project,
      wells: Array.isArray(wells) ? wells : [],
      latestUpdate: latestUpdate ?? null,
    });
  } catch (err) {
    console.error('[investor/dashboard]', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
