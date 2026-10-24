import warnings; warnings.filterwarnings("ignore")
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("SCOUTGRID_DB", str(tmp_path / "t.db"))
    from app import db, seed
    c = db.connect(); seed.seed(c); c.close()
    from app.main import app
    return TestClient(app)

@pytest.fixture
def empty_client(tmp_path, monkeypatch):
    monkeypatch.setenv("SCOUTGRID_DB", str(tmp_path / "e.db"))
    from app.main import app
    return TestClient(app)

def pid(client, name):
    return next(p["id"] for g in ("TAC", "ARENA") for p in client.get("/api/players", params={"game": g, "limit": 200}).json()["items"] if p["name"] == name)
