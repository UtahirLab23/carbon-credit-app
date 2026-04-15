/**
 * Maps Blackstone QMS ApiWell objects to the internal CreditRecord shape.
 *
 * Real status values observed from the API:
 *   "sampling"      → yellow  (Credit Certification — actively being sampled)
 *   "ready_to_cap"  → green   (Credits Issued — measurement complete, ready to cap)
 *   "data_complete" → green   (Credits Issued — data collection finished)
 *   anything else   → red     (Operations In Progress)
 */
import type { ApiWell } from '@/types/api';
import type { CreditRecord } from '@/types';

export function wellStatus(well: ApiWell): CreditRecord['status'] {
  const s = (well.status ?? '').toLowerCase();
  if (s === 'ready_to_cap' || s === 'data_complete' || s.includes('complet') || s.includes('issued')) return 'green';
  if (s === 'sampling' || s.includes('pending') || s.includes('certif') || s.includes('processing')) return 'yellow';
  return 'red';
}

export function wellToRecord(well: ApiWell, index: number): CreditRecord {
  const credits = well.credit_count ?? 0;
  const marketValue = well.est_dollar_value ?? credits * 18;
  // progress: % of a nominal 100K credits target, capped at 100
  const progress = Math.min(100, Math.round((credits / 100_000) * 100));

  // Use county + state as the "field" label if measurement_window_display is null
  const field =
    well.measurement_window_display ??
    [well.county, well.state].filter(Boolean).join(', ') ??
    '—';

  return {
    id: well.api_number ?? `well-${index}`,
    name: well.well_name,
    field,
    credits,
    progress,
    marketValue,
    status: wellStatus(well),
    lastUpdated: well.sample_end_time
      ? new Date(well.sample_end_time).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
}
