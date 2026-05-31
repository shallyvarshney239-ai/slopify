from unittest.mock import MagicMock

from analyzer.repository_fetcher import _fetch_repo_sync


def test_commit_date_filter_respects_max_count(monkeypatch):
    """Commits before 2020-01-01 are excluded; max_commits is honored."""
    era_cutoff = 1577836800

    old = MagicMock(committed_date=era_cutoff - 1, hexsha="a" * 40, author=MagicMock(name="a", email="a@b.c"), message="old")
    new_commits = []
    for i in range(5):
        c = MagicMock(
            committed_date=era_cutoff + 1000 + i,
            hexsha=f"{i:040d}",
            author=MagicMock(name="dev", email="d@e.f"),
            message=f"commit {i}",
            parents=[MagicMock()],
        )
        new_commits.append(c)

    ordered = list(reversed(new_commits)) + [old]

    class FakeRepo:
        def iter_commits(self, _rev):
            return iter(ordered)

    monkeypatch.setattr(
        "analyzer.repository_fetcher.Repo.clone_from",
        lambda *a, **k: FakeRepo(),
    )
    monkeypatch.setattr(
        "analyzer.repository_fetcher.extract_diff",
        lambda repo, commit: {"raw_patch_sample": ""},
    )
    monkeypatch.setattr("analyzer.repository_fetcher.shutil.rmtree", lambda *a, **k: None)

    out = _fetch_repo_sync("https://github.com/example/repo", max_commits=3)
    assert len(out["commits"]) == 3
