"""Validate GitHub pull request URLs via the GitHub API before analysis."""
import os
from typing import Tuple

import httpx

from analyzer.github_urls import canonical_pr_url, parse_pr_url
from analyzer.repository_validation import RepoValidationError, _github_headers, _message_for_github_status


def _message_for_pr_status(
    status_code: int, owner: str, repo: str, number: int, has_token: bool
) -> RepoValidationError:
    slug = f"{owner}/{repo}#{number}"
    if status_code == 404:
        if has_token:
            return RepoValidationError(
                f"Pull request '{slug}' does not exist or your token cannot access it. "
                "Check the PR number and repository.",
                "not_found",
            )
        return RepoValidationError(
            f"Pull request '{slug}' was not found on GitHub. "
            "Verify the URL or set GITHUB_TOKEN on the API server for private repos.",
            "not_found",
        )
    if status_code == 403:
        return RepoValidationError(
            f"GitHub denied access to '{slug}'. "
            "The PR may be private, or API rate limits may be exceeded.",
            "forbidden",
        )
    return RepoValidationError(
        f"Could not verify pull request '{slug}' (GitHub returned {status_code}).",
        "github_error",
    )


async def ensure_pull_request_accessible(pr_url: str) -> Tuple[str, str, int, str]:
    """Verify the PR exists via GitHub API. Returns owner, repo, number, normalized_url."""
    try:
        owner, repo, number = parse_pr_url(pr_url)
    except ValueError as exc:
        raise RepoValidationError(str(exc), "invalid_url") from exc

    api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}"
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
                "Could not reach GitHub to verify the pull request. Try again shortly.",
                "network",
            ) from exc

    if resp.status_code == 200:
        return owner, repo, number, canonical_pr_url(owner, repo, number)

    raise _message_for_pr_status(resp.status_code, owner, repo, number, has_token)
