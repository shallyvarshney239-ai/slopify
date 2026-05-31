import asyncio
import sys

sys.path.insert(0, ".")

from analyzer.repository_fetcher import fetch_repo
from analyzer.cognitive_scorer import score_repo
from analyzer.result_cache import set_cached

REPOS = [
    "https://github.com/expressjs/morgan",
    "https://github.com/expressjs/cors",
    "https://github.com/sindresorhus/ora",
]


async def precache():
    for url in REPOS:
        print(f"Fetching {url}...")
        try:
            repo_data = await fetch_repo(url, max_commits=300)
            print(f"  Scoring {len(repo_data['commits'])} commits...")
            result = await score_repo(repo_data)
            set_cached(url, result)
            print(f"  Cached. Mean score: {result['summary']['mean_cognitive_score']}")
        except Exception as exc:
            print(f"  ERROR: {exc}")


if __name__ == "__main__":
    asyncio.run(precache())
