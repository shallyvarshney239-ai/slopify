from typing import Any, Callable, Dict, List, Optional

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

_MODEL: Optional[SentenceTransformer] = None


def _get_model(progress_cb: Optional[Callable[[int, str], None]] = None):
    global _MODEL
    if _MODEL is None:
        if progress_cb:
            progress_cb(62, "loading semantic model")
        _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return _MODEL


def compute_semantic_signals(commits: List[Dict[str, Any]], progress_cb=None) -> List[Dict[str, Any]]:
    model = _get_model(progress_cb)
    messages = [c.get("message", "") or "update" for c in commits]
    patch_samples = [c["diff"].get("raw_patch_sample", "") for c in commits]

    msg_embeddings = model.encode(messages, batch_size=32, show_progress_bar=False)
    if progress_cb:
        progress_cb(70, "embedding commit messages")
    patch_texts = [p[:512] if p else "empty" for p in patch_samples]
    patch_embeddings = model.encode(patch_texts, batch_size=32, show_progress_bar=False)
    if progress_cb:
        progress_cb(80, "embedding diff samples")

    signals = []
    for i, commit in enumerate(commits):
        if i > 0:
            patch_sim = float(cosine_similarity(
                patch_embeddings[i:i + 1],
                patch_embeddings[i - 1:i]
            )[0][0])
            semantic_novelty = 1.0 - patch_sim
        else:
            semantic_novelty = 0.5

        msg = messages[i]
        msg_words = msg.split()
        is_generic = msg.lower().strip() in {
            "update", "fix", "wip", "changes", "stuff",
            "minor fix", "fixes", "updated", "misc", "refactor",
            "added", "removed", "test", "cleanup"
        }
        msg_length_score = min(len(msg_words) / 15.0, 1.0)
        has_issue_ref = any(kw in msg.lower() for kw in ["#", "fixes", "closes", "resolves", "issue"])

        message_quality = 0.0
        if not is_generic:
            message_quality += 0.4
        message_quality += msg_length_score * 0.4
        if has_issue_ref:
            message_quality += 0.2
        message_quality = min(message_quality, 1.0)

        signals.append({
            "semantic_novelty": round(semantic_novelty, 4),
            "message_quality": round(message_quality, 4),
            "msg_embedding": msg_embeddings[i].tolist(),
        })

    return signals