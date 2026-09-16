import pytest
from starlette.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """
    Test client fixture for testing FastAPI endpoints.
    """
    with TestClient(app) as c:
        yield c
