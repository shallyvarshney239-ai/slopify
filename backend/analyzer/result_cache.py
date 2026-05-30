import os
import tempfile

import diskcache as dc

DEFAULT_CACHE_DIR = os.path.join(tempfile.gettempdir(), "slopify_cache")
CACHE_DIR = os.getenv("SLOPIFY_CACHE_DIR", DEFAULT_CACHE_DIR)
cache = dc.Cache(CACHE_DIR)

PRELOADED_REPOS = {
    "https://github.com/expressjs/morgan": "morgan",
    "https://github.com/expressjs/cors": "cors",
    "https://github.com/sindresorhus/ora": "ora",
}


def get_cached(repo_url: str, max_commits: int = 200):
    key = normalize_key(repo_url, max_commits)
    return cache.get(key, None)


def set_cached(repo_url: str, result: dict, max_commits: int = 200):
    key = normalize_key(repo_url, max_commits)
    cache.set(key, result, expire=3600 * 24)


def normalize_url(url: str) -> str:
    return url.rstrip("/").lower().replace(".git", "")


def normalize_key(url: str, max_commits: int) -> str:
    return f"{normalize_url(url)}::commits={max_commits}"
