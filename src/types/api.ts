// ─── Blackstone QMS Investor API — Type Contracts ────────────────────────────

export interface ApiCredentials {
  clientId: string;
  clientSecret: string;
}

export interface TokenResponse {
  success: boolean;
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // seconds (1800 = 30 min)
  scope: string;
  projects: string[];
}

export interface BrandSettings {
  primary_color?: string;
  logo_url?: string;
  [key: string]: unknown;
}

export interface ApiProject {
  id: string;
  name: string;
  slug: string;
  client_name: string;
  brand_settings: BrandSettings;
  investor_update_mode: string;
}

export interface ApiWell {
  id: string;
  well_name: string;
  api_number: string | null;
  /** Real status values: "sampling" | "ready_to_cap" | "data_complete" */
  status: string;
  sort_order: number;
  data_points: number;
  avg_kg_hr: number;
  credit_count: number;
  est_dollar_value: number | null; // null when financial fields are masked
  measurement_status: string;
  measurement_window_display: string | null;
  currently_monitoring: boolean;
  sample_start_time: string | null;
  sample_end_time: string | null;
  last_qualifying_reading_at: string | null;
  county: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiReport {
  id: string;
  title: string;
  published_at: string;
  summary?: string;
  project?: ApiProject;
}

export interface ApiInvestorUpdate {
  id: string;
  project_id: string;
  report_id: string | null;
  note: string | null;
  well_count: number;
  total_kg_hr: number;
  /** Total credits across all wells in this update */
  total_credits: number;
  /** Total estimated dollar value across all wells */
  total_value: number | null;
  published_at: string;
  report?: ApiReport;
}

// ─── Internal token cache ─────────────────────────────────────────────────────
export interface TokenCache {
  accessToken: string;
  expiresAt: number; // Date.now() ms timestamp
}
