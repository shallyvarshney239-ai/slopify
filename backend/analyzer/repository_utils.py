import os
import re
from urllib.parse import urlparse

_GITHUB_HOSTS = {"github.com", "www.github.com"}


def _repo_slug(repo_url: str) -> str:
    try:
        from analyzer.repository_validation import parse_github_repo

        owner, repo = parse_github_repo(repo_url)
        return f"{owner}/{repo}"
    except Exception:
        pass
    try:
        normalized = normalize_repo_url(repo_url)
        parts = urlparse(normalized).path.strip("/").split("/")
        if len(parts) >= 2:
            return f"{parts[0]}/{parts[1].replace('.git', '')}"
    except Exception:
        pass
    return "this repository"


def normalize_repo_url(url: str) -> str:
    """Ensure GitHub URLs are valid https clone targets."""
    url = (url or "").strip()
    if not url:
        raise ValueError("Repository URL is required")

    if url.startswith("github.com/"):
        return f"https://{url}"

    if not url.startswith(("http://", "https://", "git@")):
        path = url.lstrip("/")
        if "/" in path and " " not in path:
            return f"https://github.com/{path}"

    return url.rstrip("/")


def authenticated_clone_url(repo_url: str) -> str:
    """Inject GITHUB_TOKEN into https GitHub clone URLs when configured."""
    repo_url = normalize_repo_url(repo_url)
    token = (os.getenv("GITHUB_TOKEN") or "").strip()
    if not token:
        return repo_url

    if repo_url.startswith("git@github.com:"):
        path = repo_url.split(":", 1)[-1].replace(".git", "")
        return f"https://x-access-token:{token}@github.com/{path}.git"

    parsed = urlparse(repo_url)
    if parsed.netloc.lower() not in _GITHUB_HOSTS:
        return repo_url

    path = parsed.path or ""
    if not path.endswith(".git"):
        path = f"{path}.git" if path else ".git"

    return f"https://x-access-token:{token}@github.com{path}"


def _redact_secrets(text: str) -> str:
    token = (os.getenv("GITHUB_TOKEN") or "").strip()
    if token:
        text = text.replace(token, "***")
    text = re.sub(
        r"https://x-access-token:[^@\s]+@github\.com",
        "https://***@github.com",
        text,
    )
    return text


def explain_clone_error(exc: BaseException, repo_url: str) -> str:
    """Map git clone failures to actionable messages (no secrets in output)."""
    raw = _redact_secrets(str(exc))
    lower = raw.lower()

    if "could not read username" in lower or "authentication failed" in lower:
        if (os.getenv("GITHUB_TOKEN") or "").strip():
            return (
                "Git clone failed: GITHUB_TOKEN is set but was rejected. "
                "Use a classic PAT or fine-grained token with read access to this repository."
            )
        return (
            "This repository appears to be private (or requires authentication). "
            "Slopify only reads public repos unless you set GITHUB_TOKEN on the API server "
            "(Render/Railway env) with repo read scope, then redeploy."
        )

    if "repository not found" in lower or "remote repository not found" in lower:
        slug = _repo_slug(repo_url)
        return (
            f"Repository '{slug}' was not found on GitHub. "
            "Check owner/repo spelling, or configure GITHUB_TOKEN if the repo is private."
        )

    if "not found" in lower:
        return (
            "Repository not found or not accessible. Check the URL and spelling "
            "(example: github.com/expressjs/morgan)."
        )

    if "permission denied" in lower or "403" in lower:
        return (
            "Access denied for this repository. If it is private, configure GITHUB_TOKEN "
            "on the API server with permission to read this repo."
        )

    return _redact_secrets(f"Git clone failed for {normalize_repo_url(repo_url)}: {raw[:400]}")
