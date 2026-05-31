"""Analyze GitHub pull requests for hollow descriptions and low-engagement commits."""
import os
import re
from typing import Any, Callable, Dict, List, Optional

import httpx

from analyzer.github_urls import parse_pr_url
from analyzer.repository_fetcher import fetch_repo
from analyzer.cognitive_scorer import score_repo

BOILERPLATE_PHRASES = [
    "this pr", "this pull request", "as discussed", "various fixes",
    "minor changes", "small fix", "updated", "cleanup", "wip",
    "see description", "see above", "misc",
]
HOLLOW_REVIEW_PATTERNS = re.compile(
    r"^(lgtm|looks good|ship it|approved|nice|great work|\+1|ok|okay)\.?!?$",
    re.IGNORECASE,
)


def _headers() -> Dict[str, str]:
    token = os.getenv("GITHUB_TOKEN")
    h = {"Accept": "application/vnd.github+json", "User-Agent": "slopify-hackathon"}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


async def _github_get(client: httpx.AsyncClient, url: str) -> Any:
    resp = await client.get(url, headers=_headers(), timeout=30.0)
    resp.raise_for_status()
    return resp.json()


def build_diff_summary(files: List[Dict[str, Any]]) -> str:
    parts = []
    for f in files[:25]:
        parts.append(f"{f.get('filename', '?')} (+{f.get('additions', 0)}/-{f.get('deletions', 0)})")
    return "Files changed: " + "; ".join(parts)


def score_description_density(body: str) -> float:
    if not body or not body.strip():
        return 0.0
    text = body.strip()
    words = text.split()
    if not words:
        return 0.0
    lower = text.lower()
    boilerplate_hits = sum(1 for p in BOILERPLATE_PHRASES if p in lower)
    unique_ratio = len(set(w.lower() for w in words)) / len(words)
    length_score = min(len(words) / 40.0, 1.0)
    density = unique_ratio * 0.5 + length_score * 0.5 - boilerplate_hits * 0.1
    return round(max(0.0, min(density, 1.0)), 3)


def embed_texts(texts: List[str]) -> List[List[float]]:
    from analyzer.semantic_signals import MODEL

    vectors = MODEL.encode(texts, batch_size=8, show_progress_bar=False)
    return [v.tolist() for v in vectors]


def cosine_sim(a: List[float], b: List[float]) -> float:
    import numpy as np

    va, vb = np.array(a), np.array(b)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


def score_diff_restatement(body: str, diff_summary: str) -> float:
    if not body.strip() or not diff_summary.strip():
        return 0.0
    try:
        embs = embed_texts([body[:2000], diff_summary[:2000]])
        return round(max(0.0, cosine_sim(embs[0], embs[1])), 3)
    except Exception:
        return 0.0


def analyze_reviews(reviews: List[Dict[str, Any]], diff_summary: str) -> List[Dict[str, Any]]:
    flagged = []
    diff_emb = None
    try:
        if diff_summary.strip():
            diff_emb = embed_texts([diff_summary[:2000]])[0]
    except Exception:
        diff_emb = None

    for rev in reviews:
        body = (rev.get("body") or "").strip()
        if not body:
            continue
        reasons = []
        if HOLLOW_REVIEW_PATTERNS.match(body.strip()):
            reasons.append("hollow_pattern")
        if len(body.split()) < 8:
            reasons.append("too_short")
        if diff_emb is not None:
            try:
                rev_emb = embed_texts([body[:1000]])[0]
                if cosine_sim(rev_emb, diff_emb) > 0.85 and len(body.split()) < 30:
                    reasons.append("diff_restatement")
            except Exception:
                pass
        if reasons:
            flagged.append({
                "author": rev.get("user", {}).get("login", "unknown"),
                "body_preview": body[:200],
                "reasons": reasons,
            })
    return flagged


def pr_flags(density: float, restatement: float, hollow_reviews: int) -> List[str]:
    flags = []
    if density < 0.25 and restatement > 0.75:
        flags.append("hollow_description")
    elif density < 0.2:
        flags.append("low_description_density")
    if restatement > 0.82:
        flags.append("diff_restatement")
    if hollow_reviews >= 2:
        flags.append("hollow_reviews")
    return flags


async def analyze_pull_request(
    pr_url: str,
    progress_cb: Optional[Callable[[int, str], None]] = None,
    max_commits: int = 50,
    skip_commit_analysis: bool = False,
) -> Dict[str, Any]:
    owner, repo, number = parse_pr_url(pr_url)

    async with httpx.AsyncClient() as client:
        pr = await _github_get(client, f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}")
        files = await _github_get(
            client, f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}/files"
        )
        reviews = await _github_get(
            client, f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}/reviews"
        )
        comments = await _github_get(
            client, f"https://api.github.com/repos/{owner}/{repo}/pulls/{number}/comments"
        )

    body = pr.get("body") or ""
    title = pr.get("title") or ""
    diff_summary = build_diff_summary(files if isinstance(files, list) else [])

    if progress_cb:
        progress_cb(30, "scoring_description")

    density = score_description_density(f"{title}\n{body}")
    restatement = score_diff_restatement(body, diff_summary)

    review_bodies = []
    for r in reviews if isinstance(reviews, list) else []:
        if r.get("body"):
            review_bodies.append(r)
    for c in comments if isinstance(comments, list) else []:
        if c.get("body"):
            review_bodies.append({"body": c["body"], "user": c.get("user", {})})

    hollow = analyze_reviews(review_bodies, diff_summary)
    flags = pr_flags(density, restatement, len(hollow))

    repo_url = f"https://github.com/{owner}/{repo}"
    commit_analysis = None
    mean_commit_score = None
    risky_commits = []

    if not skip_commit_analysis:
        if progress_cb:
            progress_cb(50, "analyzing_commits")

        try:
            repo_data = await fetch_repo(repo_url, max_commits=max_commits, progress_cb=progress_cb)
            commit_analysis = await score_repo(repo_data, progress_cb=progress_cb)
            scores = [c["cognitive_score"] for c in commit_analysis.get("commits", [])]
            if scores:
                mean_commit_score = round(sum(scores) / len(scores), 3)
                risky = sorted(commit_analysis["commits"], key=lambda c: c["cognitive_score"])[:3]
                risky_commits = [
                    {
                        "sha": c["sha"],
                        "message": c["message"][:100],
                        "score": c["cognitive_score"],
                        "flags": c.get("flags", []),
                    }
                    for c in risky
                ]
        except Exception as exc:
            commit_analysis = {"error": str(exc)}

    suggested_questions = []
    if "hollow_description" in flags:
        suggested_questions.append("What specific behavior changed and how was it verified?")
    if mean_commit_score is not None and mean_commit_score < 0.35:
        suggested_questions.append("Which commits in this PR were manually reviewed line-by-line?")
    if hollow:
        suggested_questions.append("Do review comments reference concrete risks or only restate the diff?")

    return {
        "pr_url": pr_url,
        "repo": f"{owner}/{repo}",
        "pr_number": number,
        "title": title,
        "description_density": density,
        "diff_restatement_score": restatement,
        "flags": flags,
        "hollow_reviews": hollow,
        "mean_commit_score": mean_commit_score,
        "risky_commits": risky_commits,
        "suggested_review_questions": suggested_questions,
        "commit_analysis_summary": (
            commit_analysis.get("summary") if isinstance(commit_analysis, dict) else None
        ),
        "verdict": (
            "needs_review" if flags or (mean_commit_score is not None and mean_commit_score < 0.35)
            else "acceptable"
        ),
    }
