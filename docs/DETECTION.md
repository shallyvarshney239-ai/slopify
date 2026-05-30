# Slopify detection methodology

**Team Avenger · Slop Scan Track A (Code Review)**

## What we detect

Slopify answers: **“Was this code understood before it merged?”** — not “Was this written by AI?”

We measure **behavioral engagement** from git artifacts: diff shape, tests, renames, commit messages, and semantic distance between consecutive changes.

## Signals (commit-level)

| Signal | Weight | Meaning |
|--------|--------|---------|
| Diff entropy | 0.20 | Token variety in the patch (paste tends to be repetitive) |
| Test coverage delta | 0.20 | Share of touched files that are tests |
| Semantic novelty | 0.15 | Embedding distance from previous commit diff |
| Rename density | 0.15 | Renames per file changed |
| Message quality | 0.15 | Specificity, length, issue references |
| Comment signal | 0.10 | Comment lines added vs additions |
| Base credit | 0.05 | Floor for any commit |
| Bulk insertion penalty | −0.40 | >80 lines added, <5 deleted |

**Score range:** 0.0–1.0. Grades A–F derived from repo mean.

## Flags

| Flag | Trigger |
|------|---------|
| `paste_and_pray` | Bulk insert + zero test files |
| `rubber_stamp` | Score < 0.15 |
| `test_desert` | >50 additions, zero tests |
| `silent_commit` | Message quality < 0.15 |
| `deep_refactor` | >2 renames (positive) |
| `test_driven` | Tests ≥ 40% of files changed (positive) |

## PR-level signals

| Signal | Meaning |
|--------|---------|
| `description_density` | Information per word, penalizing boilerplate |
| `diff_restatement_score` | Embedding similarity of PR body vs auto diff summary |
| `hollow_description` | Low density + high restatement |
| `hollow_reviews` | LGTM-style or diff-restating review comments |

## Evaluation (Bake-Off)

- **55 labeled fixtures** in `backend/eval/fixtures/`
- **Engagement buckets:** low if score < 0.35, high if ≥ 0.55 (ambiguous middle excluded)
- Run: `cd backend && python scripts/run_evaluation.py --fast` (CI) or without `--fast` (full embeddings)
- Results: `backend/eval/results/latest.json` and UI at `/accuracy`

Reported metrics include per-flag precision/recall/F1 and a confusion matrix with **documented false positives** (e.g. large human migrations without tests).

## What we cannot detect

- A careful human who merges bad code with good messages
- Squashed history that hides intermediate slop
- Private repos without a GitHub token
- Intent — only behavioral proxies

## Limitations

Heuristic thresholds are calibrated on synthetic + curated fixtures, not production ground truth at scale. Scores are comparative signals for review prioritization, not verdicts on individuals.
