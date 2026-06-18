from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_root_returns_running_message():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend is running"}
