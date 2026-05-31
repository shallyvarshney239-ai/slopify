"""Evaluation runner (importable from API and CLI)."""
import json
from pathlib import Path

from analyzer.cognitive_scorer import compute_cognitive_score, detect_flags

EVAL_DIR = Path(__file__).parent
FIXTURES_DIR = EVAL_DIR / "fixtures"
RESULTS_DIR = EVAL_DIR / "results"
RESULTS_PATH = RESULTS_DIR / "latest.json"

LOW_THRESHOLD = 0.35
HIGH_THRESHOLD = 0.55
FLAG_NAMES = [
    "paste_and_pray",
    "rubber_stamp",
    "test_desert",
    "silent_commit",
    "deep_refactor",
    "test_driven",
]


def load_fixtures():
    fixtures = []
    for path in sorted(FIXTURES_DIR.glob("*.json")):
        fixtures.append(json.loads(path.read_text(encoding="utf-8")))
    return fixtures


def simple_message_quality(message: str) -> float:
    msg = (message or "").strip().lower()
    generic = {
        "update", "fix", "wip", "changes", "stuff", "minor fix", "fixes",
        "updated", "misc", "refactor", "added", "removed", "test", "cleanup",
    }
    words = message.split()
    score = 0.0
    if msg not in generic:
        score += 0.4
    score += min(len(words) / 15.0, 1.0) * 0.4
    if any(kw in msg for kw in ["#", "fixes", "closes", "resolves", "issue"]):
        score += 0.2
    return min(score, 1.0)


def fast_semantic_signals(fixtures):
    signals = []
    for fx in fixtures:
        novelty = fx.get("semantic_novelty", 0.5)
        mq = fx.get("message_quality_hint")
        if mq is None:
            mq = simple_message_quality(fx.get("message", ""))
        signals.append({"semantic_novelty": novelty, "message_quality": mq})
    return signals


def full_semantic_signals(fixtures):
    from analyzer.semantic_signals import compute_semantic_signals

    commits = [{"message": fx.get("message", ""), "diff": fx["diff"]} for fx in fixtures]
    return compute_semantic_signals(commits)


def predict_engagement(score: float) -> str | None:
    if score < LOW_THRESHOLD:
        return "low"
    if score >= HIGH_THRESHOLD:
        return "high"
    return None


def flag_metrics(fixtures, predictions):
    per_flag = {f: {"tp": 0, "fp": 0, "fn": 0} for f in FLAG_NAMES}
    for fx, pred_flags in predictions:
        gt = set(fx["ground_truth"].get("flags", []))
        pred = set(pred_flags)
        for flag in FLAG_NAMES:
            if flag in gt and flag in pred:
                per_flag[flag]["tp"] += 1
            elif flag in pred and flag not in gt:
                per_flag[flag]["fp"] += 1
            elif flag in gt and flag not in pred:
                per_flag[flag]["fn"] += 1

    summary = {}
    for flag, c in per_flag.items():
        tp, fp, fn = c["tp"], c["fp"], c["fn"]
        prec = tp / (tp + fp) if (tp + fp) else 0.0
        rec = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = 2 * prec * rec / (prec + rec) if (prec + rec) else 0.0
        summary[flag] = {
            "precision": round(prec, 3),
            "recall": round(rec, 3),
            "f1": round(f1, 3),
            "support": tp + fn,
        }
    return summary


def engagement_metrics(fixtures, scores):
    matrix = {"low": {"low": 0, "high": 0}, "high": {"low": 0, "high": 0}}
    failures = {"false_positive": [], "false_negative": []}
    evaluated = 0
    correct = 0

    for fx, score in zip(fixtures, scores):
        gt = fx["ground_truth"]["engagement"]
        pred = predict_engagement(score)
        if pred is None:
            continue
        evaluated += 1
        matrix[gt][pred] += 1
        if pred == gt:
            correct += 1
        elif pred == "low" and gt == "high":
            failures["false_positive"].append({
                "id": fx["id"],
                "score": round(score, 3),
                "notes": fx.get("notes", ""),
                "message": fx.get("message", "")[:120],
            })
        else:
            failures["false_negative"].append({
                "id": fx["id"],
                "score": round(score, 3),
                "notes": fx.get("notes", ""),
                "message": fx.get("message", "")[:120],
            })

    accuracy = correct / evaluated if evaluated else 0.0
    return {
        "thresholds": {"low": LOW_THRESHOLD, "high": HIGH_THRESHOLD},
        "evaluated_count": evaluated,
        "accuracy": round(accuracy, 3),
        "confusion_matrix": matrix,
        "failures": failures,
    }


def run(fast: bool = False):
    if not FIXTURES_DIR.exists() or not list(FIXTURES_DIR.glob("*.json")):
        from eval.generate_eval_fixtures import main as gen

        gen()

    fixtures = load_fixtures()
    sem_signals = fast_semantic_signals(fixtures) if fast else full_semantic_signals(fixtures)

    predictions = []
    scores = []
    for fx, sem in zip(fixtures, sem_signals):
        diff = fx["diff"]
        commit = {"sha": fx.get("sha", "00000000")}
        score = compute_cognitive_score(diff, sem, commit)
        flags = detect_flags(diff, sem, commit, score)
        scores.append(score)
        predictions.append((fx, flags))

    result = {
        "mode": "fast" if fast else "full",
        "fixture_count": len(fixtures),
        "flag_metrics": flag_metrics(fixtures, predictions),
        "engagement": engagement_metrics(fixtures, scores),
        "limitations": [
            "Synthetic and hand-curated fixtures; not representative of all ecosystems.",
            "Engagement labels exclude ambiguous scores between 0.35 and 0.55.",
            "Fast mode uses heuristic message quality instead of embeddings.",
        ],
    }

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_PATH.write_text(json.dumps(result, indent=2), encoding="utf-8")
    return result
