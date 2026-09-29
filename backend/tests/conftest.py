import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["JWT_SECRET"] = "test-secret-key-that-is-at-least-32-bytes"

import pytest
from fastapi.testclient import TestClient

from app.db import Base, engine
from app.main import app


@pytest.fixture()
def client():
    Base.metadata.drop_all(engine)
    with TestClient(app) as c:  # runs lifespan: create tables, seed, load model
        yield c
    Base.metadata.drop_all(engine)


@pytest.fixture()
def auth_headers(client):
    res = client.post("/api/auth/register", json={"email": "lucy@example.com", "password": "password123"})
    return {"Authorization": f"Bearer {res.json()['access_token']}"}
