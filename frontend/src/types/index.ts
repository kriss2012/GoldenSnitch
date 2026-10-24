export type GameTitle = 'VALORANT' | 'Counter-Strike 2' | 'League of Legends' | 'Dota 2' | 'Apex Legends';

export type ConfidenceLevel = 'High confidence' | 'Medium confidence' | 'Low confidence';

export type AvailabilityStatus = 'Available' | 'Contracted' | 'On Bench' | 'Free Agent';

export type WatchlistStage = 
  | 'Discovered' 
  | 'Under review' 
  | 'Shortlisted' 
  | 'Contact planned' 
  | 'Trial requested' 
  | 'Decision pending' 
  | 'Signed' 
  | 'Archived';

export interface PerformanceFactor {
  name: string;
  weight: number; // 0 to 1 (sum to 1)
  score: number;  // 0 to 100
  rawValue?: number | string;
  benchmark?: number;
}

export interface MatchRecord {
  id: string;
  date: string;
  tournament: string;
  mapOrStage: string;
  opponent: string;
  result: 'W' | 'L';
  score: string;
  rating: number; // e.g. 1.24
  combatScore: number; // ACS, ADR, or KDA
  kills: number;
  deaths: number;
  assists: number;
  situationalEvent: string;
}

export interface Player {
  id: string;
  handle: string;
  realName: string;
  game: GameTitle;
  role: string;
  secondaryRoles?: string[];
  team?: string;
  nationality: string;
  region: string;
  age: number;
  talentIndex: number; // 0 to 100
  confidence: ConfidenceLevel;
  matchesPlayed: number;
  trend: number; // e.g. +4.2 or -2.1
  availability: AvailabilityStatus;
  salaryK?: number;
  buyoutUsd?: string;
  primaryStrength: string;
  keyConcern: string;
  factors: PerformanceFactor[];
  matchHistory: MatchRecord[];
  situational: {
    clutchRate: number; // %
    entrySuccess: number; // %
    shotcallingImpact: number; // 0-100
    midRoundAdaptability: number; // 0-100
    timeoutRecovery: number; // %
    ecoConversion: number; // %
  };
  scoutingNotes?: string;
  certifiedAnnotations?: {
    scout: string;
    role: string;
    date: string;
    rating: number;
    notes: string;
  }[];
  dataCompleteness: number; // %
  lastAnalyzed: string;
}

export interface RosterMember {
  playerId: string;
  slotRole: string;
  assignedAt: string;
}

export interface RosterVacancy {
  id: string;
  role: string;
  priority: 'High' | 'Medium' | 'Low';
  targetProfile?: Record<string, number>;
  status: 'Open' | 'Filled';
}

export interface Roster {
  id: string;
  name: string;
  game: GameTitle;
  tier: 'Tier 1' | 'Tier 2 Academy' | 'Challengers';
  members: RosterMember[];
  vacancies: RosterVacancy[];
  synergyScore: number;
  averageRating: number;
  trend: number;
  payrollK: number;
  payrollCapK: number;
  historyTrajectory: { month: string; rating: number }[];
}

export interface VacancyFilter {
  game: GameTitle;
  rosterId: string;
  role: string;
  region: string;
  availability: string;
  minMatches: number;
  desiredStrengths: string[];
  preferredPlaystyle: string;
  riskTolerance: 'Low' | 'Balanced' | 'High';
}

export interface RecommendationExplanation {
  candidateId: string;
  candidateName: string;
  role: string;
  fitScore: number;
  whyFit: string;
  topFactors: { name: string; score: number; benchmark: number }[];
  comparisonVersusAlternatives: {
    altName: string;
    altScore: number;
    differentialText: string;
  }[];
  keyRisks: string[];
  confidence: ConfidenceLevel;
  sampleSize: number;
  formulaVersion: string;
}

export interface WatchlistRecord {
  id: string;
  playerId: string;
  playerHandle: string;
  game: GameTitle;
  role: string;
  talentIndex: number;
  confidence: ConfidenceLevel;
  matches: number;
  stage: WatchlistStage;
  notes: string;
  priority: 'High' | 'Normal' | 'Low';
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  organization: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  resource_type?: string | null;
  resource_id?: string | null;
  is_read: number | boolean;
  created_at: string;
  read_at?: string | null;
}
