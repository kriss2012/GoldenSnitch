/**
 * ScoutIQ — Live Rankings & IGL Intelligence API Client (Phase 4)
 */

import { api } from './apiClient';

export interface RankedPlayer {
  rank: number;
  player_id: string;
  handle: string;
  role: string;
  evaluated_role: string;
  overall_score: number;
  final_lb: number;
  confidence: number;
  sample_maps: number;
  sub_scores: Record<string, number>;
  risk_flags: string[];
  team: string;
  team_id?: string;
  tier: string;
  region: string;
  team_elo: number;
  contract: {
    salary: number;
    buyout: number;
    status: string;
  };
}

export interface RankingsResponse {
  game: string;
  role: string;
  preset?: string;
  total: number;
  limit: number;
  offset: number;
  rankings: RankedPlayer[];
}

export interface IglRadarItem {
  metric: string;
  value: number;
  peer: number;
  weight: number;
}

export interface IglBreakdown {
  player_id: string;
  igl_score: number;
  final_lb: number;
  confidence: number;
  sample_maps: number;
  sample_rounds: number;
  radar: IglRadarItem[];
  raw_metrics: Record<string, number>;
  side_splits: {
    attack_win_rate: number;
    defense_win_rate: number;
    call_win_delta_attack: number;
    call_win_delta_defense: number;
  };
  adaptation_profile: {
    mid_round_switch_rate: number;
    mid_round_win_rate: number;
    default_plan_win_rate: number;
  };
  economy_conversion: {
    force_buy_win_rate: number;
    eco_round_conversion: number;
    thrifty_rate: number;
    efficiency_rating: number;
  };
  risk_flags: string[];
}

export interface IglDecision {
  round_id: string;
  map_name: string;
  round_number: number;
  call_type: string;
  description: string;
  round_type: string;
  won: boolean;
  p_before: number;
  p_after: number;
  wpa_delta: number;
  significance: string;
}

export interface IglDecisionsResponse {
  player_id: string;
  total_calls: number;
  timeline: IglDecision[];
}

export const rankingsService = {
  async getRankings(params: {
    game?: string;
    role?: string;
    preset?: string;
    custom_weights?: Record<string, number>;
    min_maps?: number;
    tier?: string;
    region?: string;
    availability?: string;
    max_buyout?: number;
    sort_by?: string;
    order?: string;
    limit?: number;
    offset?: number;
  }): Promise<RankingsResponse> {
    if (params.custom_weights) {
      return api.post<RankingsResponse>('/api/rankings', params);
    }
    const query = new URLSearchParams();
    if (params.game) query.set('game', params.game);
    if (params.role && params.role !== 'All') query.set('role', params.role);
    if (params.preset) query.set('preset', params.preset);
    if (params.min_maps !== undefined) query.set('min_maps', String(params.min_maps));
    if (params.tier && params.tier !== 'All') query.set('tier', params.tier);
    if (params.region && params.region !== 'All') query.set('region', params.region);
    if (params.availability && params.availability !== 'All') query.set('availability', params.availability);
    if (params.max_buyout !== undefined) query.set('max_buyout', String(params.max_buyout));
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.order) query.set('order', params.order);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.offset !== undefined) query.set('offset', String(params.offset));

    return api.get<RankingsResponse>(`/api/rankings?${query.toString()}`);
  },

  async getIglBreakdown(playerId: string, game = 'valorant'): Promise<IglBreakdown> {
    return api.get<IglBreakdown>(`/api/igl/${playerId}/breakdown?game=${game}`);
  },

  async getIglDecisions(playerId: string, limit = 30): Promise<IglDecisionsResponse> {
    return api.get<IglDecisionsResponse>(`/api/igl/${playerId}/decisions?limit=${limit}`);
  }
};
