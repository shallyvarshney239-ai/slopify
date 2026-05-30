"""Shared GitHub URL parsing for repositories and pull requests."""
import re
from typing import Tuple

_PR_URL_RE = re.compile(
    r"^https?://(?:www\.)?github\.com/([^/]+)/([^/]+)/pull/(\d+)/?$",
    re.IGNORECASE,
)


def parse_pr_url(pr_url: str) -> Tuple[str, str, int]:
    """Parse https://github.com/owner/repo/pull/123"""
    pr_url = (pr_url or "").strip().rstrip("/")
    if pr_url.startswith("github.com/"):
        pr_url = f"https://{pr_url}"
    m = _PR_URL_RE.match(pr_url)
    if not m:
        raise ValueError(
            f"Invalid GitHub PR URL: {pr_url}. "
            "Use https://github.com/owner/repo/pull/123"
        )
    return m.group(1), m.group(2), int(m.group(3))


def canonical_pr_url(owner: str, repo: str, number: int) -> str:
    return f"https://github.com/{owner}/{repo}/pull/{number}"
