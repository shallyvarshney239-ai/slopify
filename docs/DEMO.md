# Slopify demo script (2–3 minutes)

**Audience:** Slop Scan judges · Track A

## 0:00 — Problem (15s)

“The dangerous thing isn’t AI writing code — it’s humans not reading it before merge. Slopify measures **cognitive engagement** from git behavior, not AI detectors.”

## 0:15 — Live scan (45s)

1. Open the app at [https://slopify-delta.vercel.app](https://slopify-delta.vercel.app/) (local: `http://localhost:5173`).
2. Paste `https://github.com/expressjs/morgan` (or pre-cached demo).
3. Show loading → results dashboard: mean score, health grade, timeline.

## 1:00 — One flagged commit (45s)

1. Open **Flagged commits** → pick `paste_and_pray` or `silent_commit`.
2. **Commit inspector:** walk through score breakdown — bulk insert, no tests, generic message.
3. “This is behavioral evidence of rubber-stamping, not a model guessing ‘AI %’.”

## 1:45 — Honest accuracy (30s)

1. (Optional) Home → **Pull request** → paste a public PR URL → show `/analysis/pr` verdict.
2. Navigate to **Accuracy** (`/accuracy`).
3. Show confusion matrix and one **false positive** card (large feature without tests, labeled high engagement).
4. “We publish failures — judges asked for honest numbers.”

## 2:15 — GitHub Action (30s)

1. Open a PR with the Slopify check (or screenshot).
2. Show bot comment: description density, flags, suggested review questions.
3. “Install Monday: three lines in your workflow — see `docs/GITHUB_ACTION.md`.”

## 2:45 — Close (15s)

“Slopify — Team Avenger. Track A. Repo scan + PR gate + published eval. Questions?”

## Backup

Pre-record this flow if live network fails. Keep `backend/eval/results/latest.json` committed for `/accuracy` offline.
