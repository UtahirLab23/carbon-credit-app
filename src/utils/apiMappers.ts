/**
 * Maps Blackstone QMS ApiWell objects to the internal CreditRecord shape
 * so that live API data can be displayed in the same CreditsTable component.
 */
import type { ApiWell } from '@/types/api';
import type { CreditRecord } from '@/types';

/**
 * Derive a traffic-light status from the well's measurement_status / status field.
 *  - "sampling" or "active"           → green  (Credits Issued)
 *  - "pending" or "processing"        → yellow (Credit Certification)
 *  - everything else (idle, error …)  → red    (Operations In Progress)
 */
export function wellStatus(well: ApiWell): CreditRecord['status'] {
  const s = (well.measurement_status ?? well.status ?? '').toLowerCase();
  if (s.includes('sampling') || s.includes('active') || s.includes('issued')) return 'green';
  if (s.includes('pending') || s.includes('processing') || s.includes('certif')) return 'yellow';
  return 'red';
}

export function wellToRecord(well: ApiWell, index: number): CreditRecord {
  const credits = well.credit_count ?? 0;
  const marketValue = well.est_dollar_value ?? credits * 25; // fallback: $25/credit
  // progress: % of a nominal 100K credits target, capped at 100
  const progress = Math.min(100, Math.round((credits / 100_000) * 100));

  return {
    id: well.api_number ?? `well-${index}`,
    name: well.well_name,
    field: well.measurement_window_display ?? '—',
    credits,
    progress,
    marketValue,
    status: wellStatus(well),
    lastUpdated: well.sample_end_time
      ? new Date(well.sample_end_time).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
}
