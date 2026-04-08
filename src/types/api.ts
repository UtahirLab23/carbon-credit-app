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
  well_name: string;
  api_number: string | null;
  status: string;
  data_points: number;
  avg_kg_hr: number;
  measurement_status: string;
  measurement_window_display: string;
  sample_start_time: string | null;
  sample_end_time: string | null;
  credit_count: number;
  est_dollar_value: number | null; // null when financial fields are masked
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
  published_at: string;
  title?: string;
  report?: ApiReport;
  aggregate_totals?: {
    total_credits: number;
    total_est_dollar_value: number | null;
  };
}

// ─── Internal token cache ─────────────────────────────────────────────────────
export interface TokenCache {
  accessToken: string;
  expiresAt: number; // Date.now() ms timestamp
}
