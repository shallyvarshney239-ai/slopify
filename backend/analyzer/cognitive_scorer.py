from typing import Any, Dict, List

import numpy as np
from scipy.stats import entropy as scipy_entropy

async def score_repo(repo_data: Dict[str, Any], progress_cb=None) -> Dict[str, Any]:
    commits = repo_data["commits"]
    if not commits:
        return {"error": "No commits found"}

    if progress_cb:
        progress_cb(60, "computing semantic signals")
    from analyzer.semantic_signals import compute_semantic_signals

    semantic_signals = compute_semantic_signals(commits, progress_cb=progress_cb)

    scored_commits = []
    for i, commit in enumerate(commits):
        diff = commit["diff"]
        sem = semantic_signals[i]

        score = compute_cognitive_score(diff, sem, commit)
        flags = detect_flags(diff, sem, commit, score)

        scored_commits.append({
            **commit,
            "cognitive_score": round(score, 3),
            "flags": flags,
            "semantic_novelty": sem["semantic_novelty"],
            "message_quality": sem["message_quality"],
        })

    scored_commits.sort(key=lambda x: x["unix_ts"])

    contributor_stats = compute_contributor_stats(scored_commits)
    collapse_events = detect_collapse_events(scored_commits)

    if progress_cb:
        progress_cb(90, "summarizing analysis")

    scores = [c["cognitive_score"] for c in scored_commits]
    summary = {
        "mean_cognitive_score": round(float(np.mean(scores)), 3),
        "median_cognitive_score": round(float(np.median(scores)), 3),
        "score_std": round(float(np.std(scores)), 3),
        "total_flags": sum(len(c["flags"]) for c in scored_commits),
        "paste_and_pray_count": sum(1 for c in scored_commits if "paste_and_pray" in c["flags"]),
        "rubber_stamp_count": sum(1 for c in scored_commits if "rubber_stamp" in c["flags"]),
        "test_desert_count": sum(1 for c in scored_commits if "test_desert" in c["flags"]),
        "high_engagement_pct": round(
            sum(1 for s in scores if s >= 0.65) / len(scores) * 100, 1
        ),
        "collapse_events": collapse_events,
    }

    era_split = compute_era_split(scored_commits)
    file_heatmap = compute_file_heatmap(scored_commits)

    return {
        "repo_url": repo_data["repo_url"],
        "repo_name": repo_data["repo_name"],
        "total_commits_analyzed": len(scored_commits),
        "summary": summary,
        "era_split": era_split,
        "file_heatmap": file_heatmap,
        "commits": scored_commits,
        "contributors": contributor_stats,
    }


def compute_cognitive_score(diff: Dict[str, Any], sem: Dict[str, Any], commit: Dict[str, Any]) -> float:
    additions = max(diff["total_additions"], 1)

    patch = diff.get("raw_patch_sample", "")
    tokens = patch.split()
    if tokens:
        token_counts = {}
        for token in tokens:
            token_counts[token] = token_counts.get(token, 0) + 1
        freqs = np.array(list(token_counts.values()), dtype=float)
        freqs /= freqs.sum()
        diff_entropy_raw = float(scipy_entropy(freqs))
        diff_entropy = min(diff_entropy_raw / 5.0, 1.0)
    else:
        diff_entropy = 0.3

    test_ratio = diff["test_files_changed"] / max(diff["files_changed_count"], 1)
    test_score = min(test_ratio * 2.0, 1.0)

    novelty = sem["semantic_novelty"]

    rename_score = min(diff["rename_count"] / max(diff["files_changed_count"], 1) * 3.0, 1.0)

    msg_quality = sem["message_quality"]

    comment_ratio = diff["comment_lines_added"] / additions
    comment_score = min(comment_ratio * 5.0, 1.0)

    bulk_penalty = 0.4 if diff["bulk_insertion_detected"] else 0.0

    raw_score = (
        diff_entropy * 0.20 +
        test_score * 0.20 +
        novelty * 0.15 +
        rename_score * 0.15 +
        msg_quality * 0.15 +
        comment_score * 0.10 +
        0.05
    )

    final_score = max(0.0, raw_score - bulk_penalty)
    return round(float(final_score), 4)


def detect_flags(diff: Dict[str, Any], sem: Dict[str, Any], commit: Dict[str, Any], score: float) -> List[str]:
    flags: List[str] = []

    if diff["bulk_insertion_detected"] and diff["test_files_changed"] == 0:
        flags.append("paste_and_pray")

    if score < 0.15:
        flags.append("rubber_stamp")

    if diff["total_additions"] > 50 and diff["test_files_changed"] == 0:
        flags.append("test_desert")

    if sem["message_quality"] < 0.15:
        flags.append("silent_commit")

    if diff["rename_count"] > 2:
        flags.append("deep_refactor")

    if diff["test_files_changed"] > 0 and diff["test_files_changed"] >= diff["files_changed_count"] * 0.4:
        flags.append("test_driven")

    return flags


def compute_contributor_stats(commits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    contrib: Dict[str, Any] = {}
    for commit in commits:
        author = commit["author"]
        if author not in contrib:
            contrib[author] = {
                "author": author,
                "commit_count": 0,
                "scores": [],
                "flags": [],
                "first_commit": commit["unix_ts"],
                "last_commit": commit["unix_ts"],
            }
        contrib[author]["commit_count"] += 1
        contrib[author]["scores"].append(commit["cognitive_score"])
        contrib[author]["flags"].extend(commit["flags"])
        contrib[author]["last_commit"] = commit["unix_ts"]

    result = []
    for author, data in contrib.items():
        scores = data["scores"]
        result.append({
            "author": author,
            "commit_count": data["commit_count"],
            "mean_score": round(float(np.mean(scores)), 3),
            "score_trend": compute_trend(scores),
            "paste_and_pray_pct": round(
                data["flags"].count("paste_and_pray") / len(scores) * 100, 1
            ),
            "rubber_stamp_pct": round(
                data["flags"].count("rubber_stamp") / len(scores) * 100, 1
            ),
            "first_commit": data["first_commit"],
            "last_commit": data["last_commit"],
        })

    return sorted(result, key=lambda x: x["commit_count"], reverse=True)


def compute_trend(scores: List[float]) -> str:
    if len(scores) < 4:
        return "insufficient_data"
    midpoint = len(scores) // 2
    first_half = np.mean(scores[:midpoint])
    second_half = np.mean(scores[midpoint:])
    delta = second_half - first_half
    if delta < -0.1:
        return "declining"
    if delta > 0.1:
        return "improving"
    return "stable"


def detect_collapse_events(commits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if len(commits) < 20:
        return []

    window = 10
    events = []
    scores = [c["cognitive_score"] for c in commits]
    timestamps = [c["unix_ts"] for c in commits]

    for i in range(window, len(scores) - window, window // 2):
        prior_mean = np.mean(scores[i - window:i])
        current_mean = np.mean(scores[i:i + window])
        drop = prior_mean - current_mean
        if drop > 0.20:
            events.append({
                "timestamp": timestamps[i],
                "commit_sha": commits[i]["sha"],
                "score_before": round(float(prior_mean), 3),
                "score_after": round(float(current_mean), 3),
                "drop_magnitude": round(float(drop), 3),
                "label": "Significant cognitive collapse detected",
            })

    return events


AI_ERA_CUTOFF = 1678752000


def compute_era_split(commits: List[Dict[str, Any]]) -> Dict[str, Any] | None:
    pre = [c for c in commits if c["unix_ts"] < AI_ERA_CUTOFF]
    post = [c for c in commits if c["unix_ts"] >= AI_ERA_CUTOFF]

    if len(pre) < 5 or len(post) < 5:
        return None

    pre_scores = [c["cognitive_score"] for c in pre]
    post_scores = [c["cognitive_score"] for c in post]

    pre_mean = float(np.mean(pre_scores))
    post_mean = float(np.mean(post_scores))
    delta = post_mean - pre_mean

    pre_paste = sum(1 for c in pre if "paste_and_pray" in c["flags"])
    post_paste = sum(1 for c in post if "paste_and_pray" in c["flags"])

    return {
        "pre_ai": {
            "commit_count": len(pre),
            "mean_score": round(pre_mean, 3),
            "paste_and_pray_count": pre_paste,
            "paste_and_pray_pct": round(pre_paste / len(pre) * 100, 1),
            "high_engagement_pct": round(sum(1 for s in pre_scores if s >= 0.65) / len(pre) * 100, 1),
        },
        "post_ai": {
            "commit_count": len(post),
            "mean_score": round(post_mean, 3),
            "paste_and_pray_count": post_paste,
            "paste_and_pray_pct": round(post_paste / len(post) * 100, 1),
            "high_engagement_pct": round(sum(1 for s in post_scores if s >= 0.65) / len(post) * 100, 1),
        },
        "delta": round(delta, 3),
        "delta_pct": round((delta / pre_mean) * 100, 1) if pre_mean > 0 else 0,
        "verdict": (
            "significant_decline" if delta < -0.15 else
            "moderate_decline" if delta < -0.05 else
            "stable" if abs(delta) <= 0.05 else
            "improvement"
        ),
    }


def compute_file_heatmap(commits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    file_stats: Dict[str, Dict[str, Any]] = {}

    for commit in commits:
        score = commit["cognitive_score"]
        for f in commit["diff"].get("files_changed", []):
            path = f.get("path") or "unknown"
            if path not in file_stats:
                file_stats[path] = {
                    "path": path,
                    "commit_count": 0,
                    "scores": [],
                    "paste_and_pray_hits": 0,
                }
            file_stats[path]["commit_count"] += 1
            file_stats[path]["scores"].append(score)
            if "paste_and_pray" in commit.get("flags", []):
                file_stats[path]["paste_and_pray_hits"] += 1

    result = []
    for path, data in file_stats.items():
        if data["commit_count"] < 2:
            continue
        mean_score = float(np.mean(data["scores"]))
        result.append({
            "path": path,
            "commit_count": data["commit_count"],
            "mean_score": round(mean_score, 3),
            "paste_and_pray_hits": data["paste_and_pray_hits"],
            "risk_level": (
                "high" if mean_score < 0.25 else
                "medium" if mean_score < 0.45 else
                "low"
            ),
        })

    result.sort(key=lambda x: x["mean_score"])
    return result[:40]
