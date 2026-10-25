/**
 * Esports Intelligence & Public Profile Services (PRD-GOLDEN-002)
 * Handles live telemetry feeds, public player dossiers, profile claims,
 * team organizations, and shared scouting reports.
 */
import { api } from './apiClient';

export interface DataSourceStatus {
  provider: string;
  status: string;
  api_key_configured: boolean;
  rate_limit_rpm: number;
  latency_ms: number;
  provenance: string;
  supported_titles: string[];
  last_verified: string;
  last_sync?: number;
}

export interface LiveSearchResult {
  id: string;
  name: string;
  game: string;
  role: string;
  matches_played: number;
  external_id?: string;
  provider?: string;
  origin: 'local_database' | 'live_provider';
  verified: number | boolean;
  is_verified?: boolean;
  is_claimed?: boolean;
  freshness?: string;
  confidence?: number;
  current_team?: string;
  region?: string;
  provenance?: any;
  metrics?: Record<string, any>;
  slug?: string;
}

export interface PublicPlayerProfile {
  id: string;
  player_id: string;
  name: string;
  handle: string;
  slug: string;
  game: string;
  role: string;
  matches_played: number;
  is_public: number;
  verified_badge: number;
  bio: string;
  social_links: Record<string, string>;
  claimed_by_user_id?: string;
  claimed_by_name?: string;
  metrics: Record<string, any>;
  provenance: Record<string, string>;
  external_identities?: Array<{
    id: string;
    provider_name: string;
    external_id: string;
    handle_at_source: string;
    verified: number;
    freshness_status: string;
  }>;
}

export interface ProfileClaim {
  id: string;
  player_id: string;
  player_handle: string;
  game: string;
  user_id: string;
  applicant_name: string;
  applicant_username: string;
  status: 'pending' | 'approved' | 'rejected';
  verification_method: string;
  verification_code: string;
  evidence_text: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tag: string;
  description: string;
  owner_id: string;
  created_at: string;
  members: Array<{
    membership_id: string;
    role: string;
    joined_at: string;
    user_id: string;
    name: string;
    username: string;
  }>;
}

export interface SharedReport {
  id: string;
  title: string;
  candidate_id: string;
  candidate_name: string;
  candidate_role: string;
  game: string;
  roster_id: number;
  share_token: string;
  is_public: number;
  is_revoked: number;
  expires_at?: string;
  created_at: string;
  author_name: string;
  payload: Record<string, any>;
}

export const esportsIntelligenceService = {
  // Data Sources & Live Providers
  getDataSourcesStatus: async (): Promise<{ sources: DataSourceStatus[]; timestamp: number }> => {
    return api.get('/api/v1/data-sources/status');
  },

  syncDataSource: async (providerId: string): Promise<any> => {
    return api.post(`/api/v1/data-sources/${providerId}/sync`);
  },

  liveSearchPlayers: async (query: string, game?: string): Promise<{
    query: string;
    game?: string;
    local_results: LiveSearchResult[];
    live_results: LiveSearchResult[];
    total_found: number;
  }> => {
    const params = new URLSearchParams({ q: query });
    if (game) params.append('game', game);
    return api.get(`/api/v1/players/search/live?${params.toString()}`);
  },

  // Public Profiles
  getPublicProfile: async (slugOrId: string): Promise<PublicPlayerProfile> => {
    return api.get(`/api/v1/public/players/${encodeURIComponent(slugOrId)}`);
  },

  updateOwnProfile: async (data: { bio?: string; social_links?: Record<string, string>; is_public?: number }) => {
    return api.patch('/api/v1/profile', data);
  },

  // Claims & Verification
  submitClaim: async (playerId: string, data: { verification_method: string; verification_code: string; evidence_text?: string }): Promise<{ claim_id: string; status: string; message: string }> => {
    return api.post(`/api/v1/players/${playerId}/claim`, data);
  },

  listClaims: async (status?: string): Promise<{ claims: ProfileClaim[]; total: number }> => {
    const q = status ? `?status=${status}` : '';
    return api.get(`/api/v1/claims${q}`);
  },

  reviewClaim: async (claimId: string, status: 'approved' | 'rejected', rejection_reason?: string) => {
    return api.patch(`/api/v1/claims/${claimId}`, { status, rejection_reason });
  },

  // Organizations & Teams
  createOrganization: async (data: { name: string; slug: string; tag: string; description?: string }): Promise<{ organization: Organization; message: string }> => {
    return api.post('/api/v1/organizations', data);
  },

  getOrganization: async (idOrSlug: string): Promise<Organization> => {
    return api.get(`/api/v1/organizations/${encodeURIComponent(idOrSlug)}`);
  },

  listUserOrganizations: async (): Promise<{ organizations: any[]; total: number }> => {
    return api.get('/api/v1/organizations');
  },

  inviteToOrganization: async (orgId: string, data: { email: string; role: string }): Promise<{ invitation_id: string; token: string; invite_url: string; email: string; role: string; expires_at: string; message: string }> => {
    return api.post(`/api/v1/organizations/${orgId}/invitations`, data);
  },

  getInvitation: async (token: string) => {
    return api.get(`/api/v1/invitations/${token}`);
  },

  acceptInvitation: async (token: string) => {
    return api.post(`/api/v1/invitations/${token}/accept`);
  },

  // Shared Reports
  createSharedReport: async (data: {
    title: string;
    candidate_id: string;
    roster_id: number;
    is_public?: number;
    expires_in_days?: number;
    payload?: any;
  }): Promise<{ report_id: string; share_token: string; share_url: string; expires_at: string; message: string }> => {
    return api.post('/api/v1/reports/share', data);
  },

  getPublicReport: async (shareToken: string): Promise<SharedReport> => {
    return api.get(`/api/v1/public/reports/${encodeURIComponent(shareToken)}`);
  },

  revokeSharedReport: async (shareToken: string) => {
    return api.delete(`/api/v1/reports/share/${encodeURIComponent(shareToken)}`);
  },

  // Data Correction & Disputes
  submitCorrectionRequest: async (
    playerId: string,
    data: { issue_type: string; field_name?: string; reported_value?: string; correct_value?: string; justification: string; evidence_url?: string }
  ): Promise<{ request_id: string; status: string; message: string }> => {
    return api.post(`/api/v1/players/${playerId}/correction-requests`, data);
  },
};
