import os

from analyzer.repository_utils import (
    authenticated_clone_url,
    explain_clone_error,
    normalize_repo_url,
)


def test_normalize_github_shorthand():
    assert (
        normalize_repo_url("github.com/shallyvarshney239-ai/slopify")
        == "https://github.com/shallyvarshney239-ai/slopify"
    )


def test_authenticated_clone_url_injects_token(monkeypatch):
    monkeypatch.setenv("GITHUB_TOKEN", "secret_token")
    url = authenticated_clone_url("https://github.com/shallyvarshney239-ai/slopify")
    assert url == "https://x-access-token:secret_token@github.com/shallyvarshney239-ai/slopify.git"


def test_authenticated_clone_url_without_token():
    os.environ.pop("GITHUB_TOKEN", None)
    url = authenticated_clone_url("https://github.com/expressjs/morgan")
    assert url == "https://github.com/expressjs/morgan"


def test_explain_private_repo_error():
    err = Exception(
        "fatal: could not read Username for 'https://github.com': No such device or address"
    )
    msg = explain_clone_error(err, "https://github.com/org/private-repo")
    assert "private" in msg.lower() or "GITHUB_TOKEN" in msg
