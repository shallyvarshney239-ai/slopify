"""Generate 55+ labeled commit fixtures for offline evaluation."""
import json
from pathlib import Path

FIXTURES_DIR = Path(__file__).parent / "fixtures"
LABELS_PATH = Path(__file__).parent / "labels.json"

LOW = "low"
HIGH = "high"


def _diff(
    additions=10,
    deletions=2,
    files=1,
    tests=0,
    renames=0,
    comments=0,
    bulk=False,
    patch="def handler(): return True",
):
    return {
        "files_changed": [{"path": f"src/f{i}.py", "additions": additions // max(files, 1), "deletions": 0, "is_test": i < tests, "is_rename": i < renames} for i in range(files)],
        "files_changed_count": files,
        "total_additions": additions,
        "total_deletions": deletions,
        "test_files_changed": tests,
        "rename_count": renames,
        "comment_lines_added": comments,
        "bulk_insertion_detected": bulk,
        "raw_patch_sample": patch,
    }


def _fixture(fid, engagement, flags, message, diff, notes, novelty=0.5, msg_q=None):
    return {
        "id": fid,
        "repo": "synthetic/slopify-eval",
        "sha": fid[:8],
        "message": message,
        "diff": diff,
        "semantic_novelty": novelty,
        "message_quality_hint": msg_q,
        "ground_truth": {"engagement": engagement, "flags": flags},
        "notes": notes,
    }


def build_fixtures():
    items = []

    # Low engagement — paste and pray (10)
    for i in range(10):
        items.append(_fixture(
            f"low-paste-{i:02d}",
            LOW,
            ["paste_and_pray", "test_desert"],
            "update",
            _diff(additions=120 + i * 5, deletions=1, files=3, tests=0, bulk=True, patch="const x = 1; " * 80),
            "Bulk addition with no tests and generic message.",
            novelty=0.15,
            msg_q=0.05,
        ))

    # Low — silent commits (8)
    for i, msg in enumerate(["fix", "wip", "changes", "misc", "update", "stuff", "minor fix", "refactor"]):
        items.append(_fixture(
            f"low-silent-{i:02d}",
            LOW,
            ["silent_commit"],
            msg,
            _diff(additions=25, deletions=3, patch="small tweak"),
            f"Generic message '{msg}' with no explanatory detail.",
            novelty=0.3,
            msg_q=0.1,
        ))

    # Low — rubber stamp style (7)
    for i in range(7):
        items.append(_fixture(
            f"low-rubber-{i:02d}",
            LOW,
            ["rubber_stamp", "paste_and_pray"],
            "fix",
            _diff(additions=150, deletions=0, files=1, bulk=True, patch="x " * 120),
            "Large low-signal paste typical of unreviewed AI output.",
            novelty=0.1,
            msg_q=0.0,
        ))

    # High — test driven (10)
    for i in range(10):
        items.append(_fixture(
            f"high-test-{i:02d}",
            HIGH,
            ["test_driven"],
            f"Add regression tests for auth edge case #{100 + i}",
            _diff(additions=40, deletions=5, files=5, tests=3, comments=4, patch="describe('auth') expect(true) assert"),
            "Tests dominate the diff; specific message.",
            novelty=0.55,
            msg_q=0.75,
        ))

    # High — deep refactor (8)
    for i in range(8):
        items.append(_fixture(
            f"high-refactor-{i:02d}",
            HIGH,
            ["deep_refactor"],
            f"Rename payment module namespaces (closes #{200 + i})",
            _diff(additions=35, deletions=30, files=4, renames=4, comments=6, patch="rename module export class"),
            "Structural renames indicate comprehension.",
            novelty=0.65,
            msg_q=0.8,
        ))

    # High — thoughtful medium changes (7)
    for i in range(7):
        items.append(_fixture(
            f"high-thoughtful-{i:02d}",
            HIGH,
            [],
            f"Handle timeout in worker pool when queue depth exceeds {50 + i}",
            _diff(additions=22, deletions=8, files=2, tests=1, comments=5, patch="timeout queue worker retry"),
            "Specific intent, tests, and comments.",
            novelty=0.6,
            msg_q=0.7,
        ))

    # Ambiguous / false-positive traps (5) — labeled high but look risky
    traps = [
        ("trap-fp-01", "Ship large feature flag rollout without unit tests (manual QA only)", _diff(additions=90, deletions=5, files=2, tests=0, patch="feature flag rollout config"), HIGH, [], "Legitimate large feature; human-reviewed but no tests — common FP."),
        ("trap-fp-02", "Migrate config schema v2 to v3 across services", _diff(additions=70, deletions=60, files=6, renames=2, patch="schema migration version"), HIGH, ["deep_refactor"], "Big diff but structural migration."),
        ("trap-fp-03", "fix", _diff(additions=8, deletions=1, files=1, tests=1, patch="one line fix"), HIGH, [], "Short message but tiny tested fix — message misleading."),
        ("trap-fp-04", "Update dependencies and lockfile", _diff(additions=200, deletions=180, files=1, patch="package lock version bump"), HIGH, [], "Large line count but mechanical dependency bump."),
        ("trap-fp-05", "Document API breaking changes in CHANGELOG", _diff(additions=45, deletions=2, files=1, comments=20, patch="# changelog breaking api"), HIGH, [], "Docs-only with high comment ratio."),
    ]
    for fid, msg, diff, eng, fl, note in traps:
        items.append(_fixture(fid, eng, fl, msg, diff, note, novelty=0.5, msg_q=0.5))

    return items


def main():
    FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
    fixtures = build_fixtures()
    ids = []
    for fx in fixtures:
        path = FIXTURES_DIR / f"{fx['id']}.json"
        path.write_text(json.dumps(fx, indent=2), encoding="utf-8")
        ids.append(fx["id"])

    LABELS_PATH.write_text(
        json.dumps({"version": 1, "count": len(ids), "fixture_ids": ids}, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(ids)} fixtures to {FIXTURES_DIR}")


if __name__ == "__main__":
    main()
