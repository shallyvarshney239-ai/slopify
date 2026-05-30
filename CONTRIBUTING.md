# Contributing to Slopify

**Maintainer:** Team Avenger

## Development setup

```bash
# Backend (Python 3.11 required)
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Or from repo root: `docker compose up`

## Tests

```bash
cd backend
pytest tests -q
```

## Evaluation

```bash
cd backend
python eval/generate_eval_fixtures.py   # regenerate 55 fixtures
python scripts/run_evaluation.py --fast  # CI-safe
python scripts/run_evaluation.py         # full embeddings
```

Add fixtures under `backend/eval/fixtures/` following the rubric in `backend/eval/README.md`.

## Pull requests

1. Run `pytest` and `npm run build`.
2. If scoring logic changes, run `python scripts/run_evaluation.py --fast` and note metric deltas in the PR.
3. Keep detection logic out of “ask another LLM” patterns (hackathon rules).

## GitHub Action

Test locally with `pull_request_cli.py` before changing `.github/actions/slopify/`.
