/**
 * useCreditsData — shared hook for all credit pages and the dashboard.
 *
 * Hits the single /api/investor/dashboard endpoint which fetches projects +
 * wells + latestUpdate in parallel server-side — one browser round-trip
 * instead of the old 3-step waterfall (projects → wells → update).
 *
 * Typical load time: ~800ms–1.2s (was 3–4s with the waterfall).
 */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { wellToRecord } from '@/utils/apiMappers';
import type { CreditRecord } from '@/types';
import type { ApiInvestorUpdate, ApiProject, ApiWell } from '@/types/api';

interface DashboardPayload {
  project: ApiProject;
  wells: ApiWell[];
  latestUpdate: ApiInvestorUpdate | null;
}

export interface CreditsData {
  all: CreditRecord[];
  red: CreditRecord[];
  yellow: CreditRecord[];
  green: CreditRecord[];
  /** True while the API call is in flight */
  loading: boolean;
  /** Non-null when the API returned an error */
  error: string | null;
  /** Always true — we only show live data */
  isLive: boolean;
  latestUpdate: ApiInvestorUpdate | null;
  projectId: string | null;
  stats: {
    activeWells: number;
    totalCredits: number;
    totalMarketValue: number;
    redCount: number;
    yellowCount: number;
    greenCount: number;
  };
}

export function useCreditsData(): CreditsData {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await fetch('/api/investor/dashboard', { cache: 'no-store' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `API error (${res.status})`);
        }
        const data: DashboardPayload = await res.json();
        setPayload(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { load(); }, [load]);

  const all: CreditRecord[] = useMemo(() => {
    if (!payload?.wells) return [];
    return payload.wells.map(wellToRecord);
  }, [payload]);

  const red    = useMemo(() => all.filter((r) => r.status === 'red'),    [all]);
  const yellow = useMemo(() => all.filter((r) => r.status === 'yellow'), [all]);
  const green  = useMemo(() => all.filter((r) => r.status === 'green'),  [all]);

  const latestUpdate = payload?.latestUpdate ?? null;

  const stats = useMemo(() => {
    const totalCredits =
      latestUpdate?.total_credits ??
      all.reduce((s, r) => s + r.credits, 0);
    const totalMarketValue =
      latestUpdate?.total_value ??
      all.reduce((s, r) => s + r.marketValue, 0);
    return {
      activeWells:     latestUpdate?.well_count ?? all.length,
      totalCredits,
      totalMarketValue,
      redCount:    red.length,
      yellowCount: yellow.length,
      greenCount:  green.length,
    };
  }, [all, red, yellow, green, latestUpdate]);

  return {
    all,
    red,
    yellow,
    green,
    loading,
    error,
    isLive: true,
    latestUpdate,
    projectId: payload?.project?.id ?? null,
    stats,
  };
}
