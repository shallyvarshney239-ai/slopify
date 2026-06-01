# Slopify GitHub Action

Post a PR comment with hollow-description flags and optional check failure.

## Usage

```yaml
name: Slopify PR check

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  slopify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: ./.github/actions/slopify
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          threshold: "0.35"
          post_comment: "true"
          fail_on_slop: "false"
```

## Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `github_token` | required | `GITHUB_TOKEN` or PAT with `pull-requests: write` |
| `threshold` | `0.35` | Fail if mean commit score below this (when commit analysis runs) |
| `max_commits` | `30` | Commits to scan when full analysis enabled |
| `post_comment` | `true` | Post markdown summary on the PR |
| `fail_on_slop` | `true` | Exit non-zero on hollow description / low score |

## Local CLI

```bash
cd backend
export GITHUB_TOKEN=ghp_...
python scripts/pull_request_cli.py \
  --pr-url "https://github.com/owner/repo/pull/42" \
  --pr-fast \
  --output pr-report.json \
  --comment-file pr-comment.md
```

`--pr-fast` skips repo clone (description + reviews only). Omit for full commit scoring.

## Example workflow

See [.github/workflows/slopify-pr-example.yml](../.github/workflows/slopify-pr-example.yml).
