from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_prs_validate_invalid_url(client):
    res = client.get("/prs/validate", params={"pr_url": "not-a-url"})
    assert res.status_code == 400


def test_prs_validate_ok(client):
    with patch(
        "main.ensure_pull_request_accessible",
        new_callable=AsyncMock,
        return_value=("expressjs", "morgan", 1, "https://github.com/expressjs/morgan/pull/1"),
    ):
        res = client.get(
            "/prs/validate",
            params={"pr_url": "https://github.com/expressjs/morgan/pull/1"},
        )
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["full_name"] == "expressjs/morgan#1"
