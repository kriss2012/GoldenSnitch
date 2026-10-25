"""
ScoutIQ — Game Configuration Loader & Validator
Loads versioned game and role configurations from YAML files.
Validates weight sums, metric schemas, role definitions, and style dimensions.
"""

from __future__ import annotations
import os
from pathlib import Path
from typing import Dict, List, Optional
import yaml
from pydantic import BaseModel, Field, field_validator


class RoleConfig(BaseModel):
    id: str
    name: str
    description: str
    min_samples_maps: int = 15
    is_shotcaller_eligible: bool = False
    weights: Dict[str, float]
    weight_presets: Optional[Dict[str, Dict[str, float]]] = None

    @field_validator("weights")
    @classmethod
    def validate_weights_sum(cls, v: Dict[str, float]) -> Dict[str, float]:
        total = sum(v.values())
        if abs(total - 1.0) > 1e-7:
            raise ValueError(f"Role metric weights must sum to 1.0 (got {total:.6f})")
        return v


class GameConfig(BaseModel):
    game_id: str
    name: str
    config_version: str
    data_type: str = "round_based"  # "round_based" or "event_based"
    default_roster_size: int = 5
    peak_age_range: List[int] = Field(default_factory=lambda: [20, 25])
    roles: List[RoleConfig]
    agent_pool: Optional[Dict[str, List[str]]] = None
    champion_pools: Optional[Dict[str, List[str]]] = None
    hero_pools: Optional[Dict[str, List[str]]] = None
    maps_pool: Optional[List[str]] = None
    style_dimensions: List[str] = Field(default_factory=lambda: [
        "aggression", "entry_rate", "risk_taking", "utility_reliance",
        "economy_discipline", "adaptability", "lurk_tendency",
        "comms_load", "clutch_reliance", "pool_flexibility"
    ])

    def get_role(self, role_id: str) -> Optional[RoleConfig]:
        role_lookup = {r.id.lower(): r for r in self.roles}
        for r in self.roles:
            role_lookup[r.name.lower()] = r
            role_lookup[r.name.lower().replace("-", " ").replace("_", " ")] = r
        # Common aliases
        if role_id.lower() in ("entry fragger", "entry_fragger", "entry"):
            for r in self.roles:
                if r.id.lower() in ("entry", "entry fragger"):
                    return r
        if role_id.lower() in ("in-game leader", "in game leader", "igl"):
            for r in self.roles:
                if r.id.lower() in ("igl", "in-game leader"):
                    return r
        return role_lookup.get(role_id.lower())


class ConfigLoader:
    """Singleton configuration loader for game configs."""
    _instance: Optional[ConfigLoader] = None
    _configs: Dict[str, GameConfig] = {}

    def __init__(self, configs_dir: Optional[Path] = None):
        self.configs_dir = configs_dir or self._find_configs_dir()
        self.reload()

    @classmethod
    def get_instance(cls) -> ConfigLoader:
        if cls._instance is None:
            cls._instance = ConfigLoader()
        return cls._instance

    def _find_configs_dir(self) -> Path:
        env_dir = os.getenv("SCOUTIQ_CONFIGS_DIR") or os.getenv("CONFIGS_DIR")
        if env_dir and Path(env_dir).exists():
            return Path(env_dir)

        # Try relative paths
        base_path = Path(__file__).resolve()
        candidates = [
            base_path.parents[3] / "configs" / "games",
            base_path.parents[2] / "configs" / "games",
            base_path.parents[1] / "configs" / "games",
            Path.cwd() / "configs" / "games",
        ]
        for c in candidates:
            if c.exists():
                return c
        return candidates[0]

    def reload(self) -> None:
        """Loads and validates all YAML configs in configs_dir."""
        self._configs.clear()
        if not self.configs_dir.exists():
            return

        for path in self.configs_dir.glob("*.yaml"):
            with open(path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            config = GameConfig(**data)
            self._configs[config.game_id.lower()] = config

    def get_game(self, game_id: str) -> Optional[GameConfig]:
        return self._configs.get(game_id.lower())

    def list_games(self) -> List[GameConfig]:
        return list(self._configs.values())

    def get_roles(self, game_id: str) -> List[RoleConfig]:
        game = self.get_game(game_id)
        return game.roles if game else []

    def get_role(self, game_id: str, role_id: str) -> Optional[RoleConfig]:
        game = self.get_game(game_id)
        return game.get_role(role_id) if game else None


# Module-level convenience functions
def get_game_config(game_id: str) -> Optional[GameConfig]:
    return ConfigLoader.get_instance().get_game(game_id)


def list_game_configs() -> List[GameConfig]:
    return ConfigLoader.get_instance().list_games()
