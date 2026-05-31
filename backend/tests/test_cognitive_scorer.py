"""Unit tests for pure scoring logic (no ML model load)."""

from analyzer.cognitive_scorer import (
    compute_cognitive_score,
    detect_flags,
    detect_collapse_events,
    compute_era_split,
)


def _sem(novelty=0.5, message_quality=0.5):
    return {"semantic_novelty": novelty, "message_quality": message_quality}


def _commit(ts=1_700_000_000, sha="abc12345"):
    return {"sha": sha, "unix_ts": ts, "cognitive_score": 0.0, "flags": []}


def test_paste_and_pray_flag():
    diff = {
        "total_additions": 120,
        "total_deletions": 2,
        "files_changed_count": 3,
        "test_files_changed": 0,
        "rename_count": 0,
        "comment_lines_added": 0,
        "bulk_insertion_detected": True,
        "raw_patch_sample": "def foo(): pass " * 40,
    }
    sem = _sem(message_quality=0.1)
    score = compute_cognitive_score(diff, sem, _commit())
    flags = detect_flags(diff, sem, _commit(), score)
    assert "paste_and_pray" in flags
    assert score < 0.5


def test_test_driven_flag():
    diff = {
        "total_additions": 40,
        "total_deletions": 5,
        "files_changed_count": 5,
        "test_files_changed": 3,
        "rename_count": 0,
        "comment_lines_added": 5,
        "bulk_insertion_detected": False,
        "raw_patch_sample": "assert expect test spec",
    }
    sem = _sem(message_quality=0.7, novelty=0.6)
    score = compute_cognitive_score(diff, sem, _commit())
    flags = detect_flags(diff, sem, _commit(), score)
    assert "test_driven" in flags
    assert score > 0.35


def test_silent_commit_flag():
    diff = {
        "total_additions": 10,
        "total_deletions": 2,
        "files_changed_count": 1,
        "test_files_changed": 0,
        "rename_count": 0,
        "comment_lines_added": 0,
        "bulk_insertion_detected": False,
        "raw_patch_sample": "minor change",
    }
    sem = _sem(message_quality=0.05)
    flags = detect_flags(diff, sem, _commit(), 0.2)
    assert "silent_commit" in flags


def test_deep_refactor_flag():
    diff = {
        "total_additions": 30,
        "total_deletions": 25,
        "files_changed_count": 4,
        "test_files_changed": 0,
        "rename_count": 4,
        "comment_lines_added": 2,
        "bulk_insertion_detected": False,
        "raw_patch_sample": "rename refactor module",
    }
    sem = _sem(message_quality=0.6)
    flags = detect_flags(diff, sem, _commit(), 0.5)
    assert "deep_refactor" in flags


def test_rubber_stamp_low_score():
    diff = {
        "total_additions": 200,
        "total_deletions": 0,
        "files_changed_count": 1,
        "test_files_changed": 0,
        "rename_count": 0,
        "comment_lines_added": 0,
        "bulk_insertion_detected": True,
        "raw_patch_sample": "x " * 100,
    }
    sem = _sem(message_quality=0.0, novelty=0.1)
    score = compute_cognitive_score(diff, sem, _commit())
    flags = detect_flags(diff, sem, _commit(), score)
    assert score < 0.15 or "rubber_stamp" in flags


def test_empty_diff_edge_case():
    diff = {
        "total_additions": 0,
        "total_deletions": 0,
        "files_changed_count": 0,
        "test_files_changed": 0,
        "rename_count": 0,
        "comment_lines_added": 0,
        "bulk_insertion_detected": False,
        "raw_patch_sample": "",
    }
    sem = _sem()
    score = compute_cognitive_score(diff, sem, _commit())
    assert 0.0 <= score <= 1.0
    assert isinstance(detect_flags(diff, sem, _commit(), score), list)


def test_collapse_events_need_enough_commits():
    commits = [
        {**_commit(ts=i, sha=f"{i:08d}"), "cognitive_score": 0.7 if i < 15 else 0.2}
        for i in range(25)
    ]
    events = detect_collapse_events(commits)
    assert isinstance(events, list)


def test_era_split_insufficient_data():
    commits = [_commit(ts=1_600_000_000 + i) for i in range(3)]
    for c in commits:
        c["cognitive_score"] = 0.5
    assert compute_era_split(commits) is None
