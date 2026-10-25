"""
Test Weights Integrity & Config Validation (Section 12.7)
Every YAML role config weights must sum to 1.0 +- 1e-9.
Every role must define >= 6 metrics.
"""

import pytest
from app.core.config_loader import list_game_configs, get_game_config


def test_yaml_configs_loaded():
    configs = list_game_configs()
    assert len(configs) >= 4, "Must load at least 4 game configs (Valorant, CS2, LoL, Dota 2)"
    game_ids = {c.game_id.lower() for c in configs}
    assert {"valorant", "cs2", "lol", "dota2"}.issubset(game_ids)


def test_every_role_weights_sum_to_one():
    for game in list_game_configs():
        assert len(game.roles) >= 5, f"Game {game.name} must define at least 5 roles"
        for role in game.roles:
            weight_sum = sum(role.weights.values())
            assert abs(weight_sum - 1.0) <= 1e-9, (
                f"Role {role.id} in {game.name} weights must sum to 1.0 (got {weight_sum})"
            )
            assert len(role.weights) >= 6, (
                f"Role {role.id} in {game.name} must define at least 6 metrics (got {len(role.weights)})"
            )


def test_weight_presets_sum_to_one():
    for game in list_game_configs():
        for role in game.roles:
            if role.weight_presets:
                for preset_name, weights in role.weight_presets.items():
                    weight_sum = sum(weights.values())
                    assert abs(weight_sum - 1.0) <= 1e-9, (
                        f"Preset '{preset_name}' for role {role.id} in {game.name} must sum to 1.0 (got {weight_sum})"
                    )


def test_game_style_dimensions():
    for game in list_game_configs():
        assert len(game.style_dimensions) >= 8, f"Game {game.name} must have at least 8 style dimensions"
        assert "aggression" in game.style_dimensions
        assert "adaptability" in game.style_dimensions
