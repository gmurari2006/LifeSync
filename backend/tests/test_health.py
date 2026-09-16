def test_root_endpoint(client):
    """
    Test GET / identifies the LifeSync backend.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "LifeSync"
    assert "LifeSync Emergency Coordination Backend is running." in data["message"]
    assert "version" in data
    assert data["health_url"] == "/health"
    assert data["docs_url"] == "/docs"


def test_health_endpoint(client):
    """
    Test GET /health returns healthy status.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data
    assert "environment" in data


def test_api_v1_health_endpoint(client):
    """
    Test GET /api/v1/health returns healthy status via v1 router.
    """
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data
    assert "environment" in data
