import os
import tempfile
import time
import uuid

import diskcache as dc

JOB_CACHE_DIR = os.getenv(
    "SLOPIFY_JOB_DIR",
    os.path.join(tempfile.gettempdir(), "slopify_jobs"),
)
job_cache = dc.Cache(JOB_CACHE_DIR)


def create_job(
    target_url: str,
    max_commits: int = 0,
    job_type: str = "repo",
) -> str:
    job_id = uuid.uuid4().hex[:12]
    now = time.time()
    job_cache.set(job_id, {
        "job_id": job_id,
        "job_type": job_type,
        "target_url": target_url,
        "repo_url": target_url,
        "max_commits": max_commits,
        "status": "queued",
        "progress_pct": 0,
        "stage": "queued",
        "created_at": now,
        "updated_at": now,
    })
    return job_id


def update_job(job_id: str, **fields):
    job = job_cache.get(job_id)
    if not job:
        return None
    job.update(fields)
    job["updated_at"] = time.time()
    job_cache.set(job_id, job)
    return job


def set_job_result(job_id: str, result: dict, stage: str = "complete"):
    return update_job(
        job_id,
        status="done",
        progress_pct=100,
        stage=stage,
        result=result,
    )


def get_job(job_id: str):
    return job_cache.get(job_id)


def touch_job(job_id: str):
    """Refresh updated_at so clients know the worker is still alive."""
    job = job_cache.get(job_id)
    if not job:
        return None
    job["updated_at"] = time.time()
    job_cache.set(job_id, job)
    return job
