import pytest
from starlette.testclient import TestClient
from app.main import app


def test_cors_preflight_allowed_origins():
    client = TestClient(app)

    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://life-sync-gmurari2006s-projects.vercel.app",
        "https://life-sync-git-master-gmurari2006s-projects.vercel.app",
    ]

    for origin in allowed_origins:
        response = client.options(
            "/api/v1/ai/cases/LS-2026-003",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "accept,content-type",
            },
        )
        assert response.status_code == 200, f"Failed for allowed origin: {origin}"
        assert response.headers.get("access-control-allow-origin") == origin


def test_cors_preflight_disallowed_origins():
    client = TestClient(app)

    disallowed_origins = [
        "https://malicious-site.com",
        "https://random-attacker.vercel.app",
        "http://localhost:4000",
    ]

    for origin in disallowed_origins:
        response = client.options(
            "/api/v1/ai/cases/LS-2026-003",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "accept,content-type",
            },
        )
        assert response.status_code == 400, f"Expected 400 for disallowed origin: {origin}"
        assert "Disallowed CORS origin" in response.text
