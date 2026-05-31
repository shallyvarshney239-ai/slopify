import os
import re
from typing import Tuple
from urllib.parse import urlparse

import httpx

from analyzer.repository_utils import normalize_repo_url

_GITHUB_HOSTS = {"github.com", "www.github.com"}
_OWNER_REPO_RE = re.compile(r"^[\w.-]+$")


class RepoValidationError(Exception):
    """User-facing repository validation failure."""

    def __init__(self, message: str, code: str = "invalid_repo"):
        self.message = message
        self.code = code
        super().__init__(message)


def parse_github_repo(url: str) -> Tuple[str, str]:
    """Return (owner, repo) from a GitHub URL or raise RepoValidationError."""
    try:
        normalized = normalize_repo_url(url)
    except ValueError as exc:
        raise RepoValidationError(str(exc), "invalid_url") from exc

    if normalized.startswith("git@github.com:"):
        path = normalized.split(":", 1)[-1]
        parts = [p for p in path.replace(".git", "").split("/") if p]
    else:
        parsed = urlparse(normalized)
        host = parsed.netloc.lower()
        if host not in _GITHUB_HOSTS:
            raise RepoValidationError(
                "Only GitHub repositories are supported. "
                "Use a link like github.com/owner/repo (example: github.com/expressjs/morgan).",
                "not_github",
            )
        parts = [p for p in parsed.path.strip("/").split("/") if p]

    if len(parts) < 2:
        raise RepoValidationError(
            "That does not look like a valid GitHub repository URL. "
            "Use owner/repo or github.com/owner/repo (example: expressjs/morgan).",
            "invalid_format",
        )

    owner, repo = parts[0], parts[1].replace(".git", "")
    if not _OWNER_REPO_RE.match(owner) or not _OWNER_REPO_RE.match(repo):
        raise RepoValidationError(
            "Repository owner or name contains invalid characters. "
            "Check the URL for typos.",
            "invalid_format",
        )

    return owner, repo


def _github_headers() -> dict:
    token = (os.getenv("GITHUB_TOKEN") or "").strip()
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "slopify-api",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _message_for_github_status(
    status_code: int, owner: str, repo: str, has_token: bool
) -> RepoValidationError:
    slug = f"{owner}/{repo}"

    if status_code == 404:
        if has_token:
            return RepoValidationError(
                f"Repository '{slug}' does not exist or your token cannot access it. "
                "Double-check the owner and repository name for typos.",
                "not_found",
            )
        return RepoValidationError(
            f"Repository '{slug}' was not found on GitHub. "
            "Check spelling (owner/repo), or set GITHUB_TOKEN on the API server if the repo is private.",
            "not_found",
        )

    if status_code == 403:
        return RepoValidationError(
            f"GitHub denied access to '{slug}'. "
            "The repository may be private, or API rate limits may be exceeded. "
            "Try again later or configure GITHUB_TOKEN on the server.",
            "forbidden",
        )

    if status_code == 301:
        return RepoValidationError(
            f"Repository '{slug}' moved or was renamed. Open it on GitHub and paste the current URL.",
            "moved",
        )

    return RepoValidationError(
        f"Could not verify repository '{slug}' (GitHub returned {status_code}). Try again shortly.",
        "github_error",
    )


async def ensure_github_repo_accessible(repo_url: str) -> Tuple[str, str]:
    """Verify the repo exists (or is accessible) via GitHub API before cloning."""
    owner, repo = parse_github_repo(repo_url)
    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    has_token = bool((os.getenv("GITHUB_TOKEN") or "").strip())

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                api_url,
                headers=_github_headers(),
                timeout=20.0,
                follow_redirects=True,
            )
        except httpx.RequestError as exc:
            raise RepoValidationError(
                "Could not reach GitHub to verify the repository. Check your connection and try again.",
                "network",
            ) from exc

    if resp.status_code == 200:
        return owner, repo

    raise _message_for_github_status(resp.status_code, owner, repo, has_token)
