import pytest
import httpx

from analyzer.repository_validation import (
    RepoValidationError,
    ensure_github_repo_accessible,
    parse_github_repo,
)


def test_parse_github_repo_shorthand():
    assert parse_github_repo("github.com/expressjs/morgan") == ("expressjs", "morgan")


def test_parse_invalid_single_segment():
    with pytest.raises(RepoValidationError) as exc:
        parse_github_repo("github.com/onlyowner")
    assert exc.value.code == "invalid_format"


def test_parse_not_github():
    with pytest.raises(RepoValidationError) as exc:
        parse_github_repo("https://gitlab.com/foo/bar")
    assert exc.value.code == "not_github"


def test_ensure_repo_not_found(monkeypatch):
    import asyncio

    async def mock_get(self, url, **kwargs):
        return httpx.Response(404, request=httpx.Request("GET", url))

    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    with pytest.raises(RepoValidationError) as exc:
        asyncio.run(
            ensure_github_repo_accessible(
                "https://github.com/no-such-user/zzz-repo-99999"
            )
        )
    assert exc.value.code == "not_found"
    assert "not found" in exc.value.message.lower()


def test_ensure_repo_exists(monkeypatch):
    import asyncio

    async def mock_get(self, url, **kwargs):
        return httpx.Response(
            200,
            json={"full_name": "expressjs/morgan"},
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    owner, repo = asyncio.run(
        ensure_github_repo_accessible("https://github.com/expressjs/morgan")
    )
    assert owner == "expressjs"
    assert repo == "morgan"
