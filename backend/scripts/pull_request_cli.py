"""CLI for PR analysis — used by GitHub Action and local debugging."""
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))


def resolve_pr_url(args) -> str:
    if args.pr_url:
        return args.pr_url
    repo = args.repo or os.getenv("GITHUB_REPOSITORY")
    number = args.pr or os.getenv("GITHUB_EVENT_PULL_REQUEST_NUMBER")
    if repo and number:
        return f"https://github.com/{repo}/pull/{number}"
    event_path = os.getenv("GITHUB_EVENT_PATH")
    if event_path and Path(event_path).exists():
        event = json.loads(Path(event_path).read_text(encoding="utf-8"))
        pr = event.get("pull_request") or {}
        if pr.get("html_url"):
            return pr["html_url"]
    raise ValueError("Provide --pr-url or --repo + --pr (or run inside GitHub Actions)")


def should_fail(report: dict, threshold: float) -> bool:
    flags = report.get("flags") or []
    if "hollow_description" in flags or "diff_restatement" in flags or "hollow_reviews" in flags:
        return True
    mean = report.get("mean_commit_score")
    return mean is not None and mean < threshold


def format_comment(report: dict) -> str:
    lines = [
        "## Slopify PR scan",
        "",
        f"**Verdict:** `{report.get('verdict', 'unknown')}`",
        f"**Description density:** {report.get('description_density', 'n/a')}",
        f"**Diff restatement score:** {report.get('diff_restatement_score', 'n/a')} (high = body mostly repeats the diff)",
    ]
    if report.get("mean_commit_score") is not None:
        lines.append(f"**Mean commit cognitive score:** {report['mean_commit_score']}")
    if report.get("flags"):
        lines.append(f"**Flags:** {', '.join(report['flags'])}")
    if report.get("risky_commits"):
        lines.append("")
        lines.append("### Lowest-scoring commits")
        for c in report["risky_commits"]:
            lines.append(f"- `{c['sha']}` ({c['score']}) — {c['message'][:80]}")
    if report.get("hollow_reviews"):
        lines.append("")
        lines.append(f"### Hollow review signals ({len(report['hollow_reviews'])})")
        for r in report["hollow_reviews"][:3]:
            lines.append(f"- @{r['author']}: {r['body_preview'][:100]}…")
    if report.get("suggested_review_questions"):
        lines.append("")
        lines.append("### Suggested review questions")
        for q in report["suggested_review_questions"]:
            lines.append(f"- {q}")
    lines.append("")
    lines.append("_Slopify measures whether code was understood before merge — not whether AI wrote it._")
    return "\n".join(lines)


async def main_async(args):
    from analyzer.pull_request_analyzer import analyze_pull_request

    pr_url = resolve_pr_url(args)
    skip_commits = os.getenv("SLOPIFY_PR_FAST", "").lower() in ("1", "true", "yes")
    report = await analyze_pull_request(
        pr_url,
        max_commits=args.max_commits,
        skip_commit_analysis=skip_commits or args.pr_fast,
    )

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    comment_path = Path(args.comment_file) if args.comment_file else None
    if comment_path:
        comment_path.write_text(format_comment(report), encoding="utf-8")

    print(json.dumps({
        "pr_url": pr_url,
        "verdict": report.get("verdict"),
        "flags": report.get("flags"),
        "mean_commit_score": report.get("mean_commit_score"),
    }, indent=2))

    if args.fail_on_slop and should_fail(report, args.threshold):
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Analyze a GitHub PR with Slopify")
    parser.add_argument("--pr-url", help="Full GitHub PR URL")
    parser.add_argument("--repo", help="owner/repo")
    parser.add_argument("--pr", type=int, help="PR number")
    parser.add_argument("--output", default="pr-report.json")
    parser.add_argument("--comment-file", default="pr-comment.md")
    parser.add_argument("--max-commits", type=int, default=30)
    parser.add_argument("--threshold", type=float, default=0.35)
    parser.add_argument("--fail-on-slop", action="store_true")
    parser.add_argument("--pr-fast", action="store_true", help="PR description/reviews only (no repo clone)")
    args = parser.parse_args()
    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
