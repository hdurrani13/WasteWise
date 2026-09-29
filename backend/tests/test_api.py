ADDRESS = "10365 111 Street NW"


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_register_login_and_duplicate(client):
    body = {"email": "a@example.com", "password": "password123"}
    assert client.post("/api/auth/register", json=body).status_code == 201
    assert client.post("/api/auth/register", json=body).status_code == 409
    res = client.post("/api/auth/login", data={"username": "a@example.com", "password": "password123"})
    assert res.status_code == 200 and res.json()["access_token"]
    bad = client.post("/api/auth/login", data={"username": "a@example.com", "password": "wrong"})
    assert bad.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/me").status_code == 401


def test_guest_can_view_schedule_by_address(client):
    res = client.get("/api/schedule", params={"address": ADDRESS, "year": 2026, "month": 11})
    assert res.status_code == 200
    data = res.json()
    assert data["address"]["display"] == "10365 111 St NW"
    assert len(data["pickups"]) > 0


def test_same_address_always_gets_same_zone(client):
    a = client.get("/api/schedule/next", params={"address": ADDRESS}).json()
    b = client.get("/api/schedule/next", params={"address": "10365 111 st. nw"}).json()
    assert a["address"]["zone_name"] == b["address"]["zone_name"]


def test_schedule_filter_by_type(client):
    res = client.get("/api/schedule", params={"address": ADDRESS, "year": 2026, "month": 11, "types": ["recycling"]})
    assert {p["type"] for p in res.json()["pickups"]} == {"recycling"}


def test_invalid_address_rejected(client):
    res = client.get("/api/schedule/next", params={"address": "nowhere"})
    assert res.status_code == 422


def test_schedule_without_address_needs_one(client, auth_headers):
    res = client.get("/api/schedule/next", headers=auth_headers)
    assert res.status_code == 400


def test_saved_address_and_preferences(client, auth_headers):
    res = client.patch("/api/me", headers=auth_headers, json={"address": ADDRESS, "dark_mode": True, "language": "fr"})
    assert res.status_code == 200
    me = res.json()
    assert me["dark_mode"] is True and me["language"] == "fr"
    assert me["address"]["display"] == "10365 111 St NW"
    # Schedule now works without passing an address
    assert client.get("/api/schedule/next", headers=auth_headers).status_code == 200


def test_change_password(client, auth_headers):
    bad = client.post(
        "/api/me/password", headers=auth_headers, json={"current_password": "nope", "new_password": "newpassword1"}
    )
    assert bad.status_code == 400
    ok = client.post(
        "/api/me/password",
        headers=auth_headers,
        json={"current_password": "password123", "new_password": "newpassword1"},
    )
    assert ok.status_code == 204
    login = client.post("/api/auth/login", data={"username": "lucy@example.com", "password": "newpassword1"})
    assert login.status_code == 200


def test_item_search(client):
    res = client.get("/api/items", params={"q": "battery"})
    names = [i["name"] for i in res.json()]
    assert "battery" in names and "car battery" in names


def test_classify_uses_database_for_known_items(client):
    res = client.post("/api/items/classify", json={"text": "Pizza Box"}).json()
    assert res["source"] == "database" and res["bin"] == "compost"


def test_classify_falls_back_to_model(client):
    res = client.post("/api/items/classify", json={"text": "empty sparkling water can"}).json()
    assert res["source"] == "model"
    assert res["bin"] in {"recycling", "compost", "garbage", "hazardous", "ewaste"}
    assert 0 <= res["confidence"] <= 1


def test_activity_feed_has_announcements_and_is_idempotent(client, auth_headers):
    first = client.get("/api/activity", headers=auth_headers).json()
    second = client.get("/api/activity", headers=auth_headers).json()
    assert any(a["kind"] == "announcement" for a in first)
    assert len(first) == len(second)


def test_mark_activity_read(client, auth_headers):
    item = client.get("/api/activity", headers=auth_headers).json()[0]
    assert client.post(f"/api/activity/{item['id']}/read", headers=auth_headers).status_code == 204
    again = client.get("/api/activity", headers=auth_headers).json()
    assert next(a for a in again if a["id"] == item["id"])["read"] is True
