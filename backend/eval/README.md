# Slopify evaluation dataset — Team Avenger

## Labeling rubric

| Label | Criteria |
|-------|----------|
| **low** engagement | Bulk accept, no tests, generic/silent message, no structural edits |
| **high** engagement | Tests added, renames, specific message with issue refs, explanatory comments |

### Flag ground truth

- `paste_and_pray`: >80 lines added, <5 deleted, zero test files
- `rubber_stamp`: near-zero cognitive signal across dimensions
- `test_desert`: >50 additions, zero tests
- `silent_commit`: message is generic ("fix", "update", etc.)
- `deep_refactor`: multiple renames (positive)
- `test_driven`: tests are ≥40% of changed files (positive)

## Thresholds (binary engagement)

- Predicted **low** if cognitive score `< 0.35`
- Predicted **high** if cognitive score `>= 0.55`
- Scores in between are excluded from engagement accuracy (ambiguous zone)

## Regenerate fixtures

```bash
cd backend
python eval/generate_eval_fixtures.py
```

## Run evaluation

```bash
python scripts/run_evaluation.py          # full (loads ML model)
python scripts/run_evaluation.py --fast   # heuristic semantics only (CI)
```

Results: `eval/results/latest.json`
