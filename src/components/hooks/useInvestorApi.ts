/**
 * React hooks for the Blackstone QMS Investor API.
 * Each hook returns { data, loading, error, refetch }.
 * They automatically skip the fetch when no credentials are configured.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  fetchLatestUpdate,
  fetchProjects,
  fetchReports,
  fetchWells,
  hasCredentials,
} from '@/services/investorApi';
import type { ApiInvestorUpdate, ApiProject, ApiReport, ApiWell } from '@/types/api';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useApiCall<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    if (!hasCredentials()) return;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const result = await fetcher();
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
}

/** Returns all projects assigned to the current credential. */
export function useProjects(): AsyncState<ApiProject[]> {
  return useApiCall(() => fetchProjects());
}

/** Returns investor-visible well summaries for a project. */
export function useWells(projectId: string | null): AsyncState<ApiWell[]> {
  return useApiCall(
    () => {
      if (!projectId) return Promise.resolve([]);
      return fetchWells(projectId);
    },
    [projectId]
  );
}

/** Returns published reports for a project. */
export function useReports(projectId: string | null): AsyncState<ApiReport[]> {
  return useApiCall(
    () => {
      if (!projectId) return Promise.resolve([]);
      return fetchReports(projectId);
    },
    [projectId]
  );
}

/** Returns the latest published investor update for a project. */
export function useLatestUpdate(projectId: string | null): AsyncState<ApiInvestorUpdate> {
  return useApiCall(
    () => {
      if (!projectId) return Promise.reject(new Error('No project selected'));
      return fetchLatestUpdate(projectId);
    },
    [projectId]
  );
}
