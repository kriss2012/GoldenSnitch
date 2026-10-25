"""Base contract for esports live data providers (PRD-PROV-001).
Enforces uniform capabilities, rate limits, provenance tracking, and error handling.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
import time

class ProviderCapability(BaseModel):
    game: str
    can_search: bool = True
    can_fetch_matches: bool = True
    can_fetch_statistics: bool = True
    supported_metrics: List[str]
    unsupported_metrics: List[str]
    rate_limit_rpm: int = 60
    attribution: str

class ExternalMatch(BaseModel):
    match_id: str
    tournament: str
    map_name: str
    opponent: str
    score: str
    result: str
    date: str
    kills: int
    deaths: int
    assists: int
    combat_score: float
    rating: float
    raw_metrics: Dict[str, Any] = Field(default_factory=dict)

class ExternalPlayer(BaseModel):
    provider_name: str
    external_id: str
    handle: str
    game: str
    primary_role: str
    region: Optional[str] = "Global"
    current_team: Optional[str] = None
    rank_tier: Optional[str] = None
    matches_played: int = 0
    metrics: Dict[str, float] = Field(default_factory=dict)
    provenance: str = "official_api"
    freshness: str = "current"
    last_updated: float = Field(default_factory=time.time)
    profile_url: Optional[str] = None

class BaseEsportsProvider(ABC):
    def __init__(self, name: str, api_key: Optional[str] = None):
        self.name = name
        self.api_key = api_key

    @abstractmethod
    def capabilities(self) -> List[ProviderCapability]:
        """Returns the capabilities and supported metrics for each game."""
        pass

    @abstractmethod
    async def search_players(self, query: str, game: str) -> List[ExternalPlayer]:
        """Searches players across the provider's live index."""
        pass

    @abstractmethod
    async def get_player(self, external_id: str, game: str) -> Optional[ExternalPlayer]:
        """Fetches comprehensive player identity and metrics by external ID."""
        pass

    @abstractmethod
    async def get_matches(self, external_id: str, game: str, limit: int = 20) -> List[ExternalMatch]:
        """Fetches recent competitive matches for the player."""
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Returns health status, latency, and rate-limit headroom."""
        pass
