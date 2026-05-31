import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from analyzer.github_urls import parse_pr_url
from analyzer.pull_request_validation import ensure_pull_request_accessible
from analyzer.repository_validation import RepoValidationError


def test_parse_pr_url_valid():
    owner, repo, num = parse_pr_url("https://github.com/expressjs/morgan/pull/42")
    assert owner == "expressjs"
    assert repo == "morgan"
    assert num == 42


def test_parse_pr_url_invalid():
    with pytest.raises(ValueError, match="Invalid GitHub PR URL"):
        parse_pr_url("https://github.com/expressjs/morgan")


@pytest.mark.asyncio
async def test_ensure_pull_request_accessible_not_found():
    mock_resp = MagicMock()
    mock_resp.status_code = 404

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=None)

    with patch("analyzer.pull_request_validation.httpx.AsyncClient", return_value=mock_client):
        with pytest.raises(RepoValidationError) as exc:
            await ensure_pull_request_accessible(
                "https://github.com/expressjs/morgan/pull/999999"
            )
    assert exc.value.code == "not_found"


@pytest.mark.asyncio
async def test_ensure_pull_request_accessible_ok():
    mock_resp = MagicMock()
    mock_resp.status_code = 200

    mock_client = AsyncMock()
    mock_client.get = AsyncMock(return_value=mock_resp)
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=None)

    with patch("analyzer.pull_request_validation.httpx.AsyncClient", return_value=mock_client):
        owner, repo, number, url = await ensure_pull_request_accessible(
            "https://github.com/expressjs/morgan/pull/1"
        )
    assert owner == "expressjs"
    assert repo == "morgan"
    assert number == 1
    assert url == "https://github.com/expressjs/morgan/pull/1"
