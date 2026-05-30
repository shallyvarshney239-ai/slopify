import asyncio
import json
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from analyzer.repository_fetcher import fetch_repo
from analyzer.cognitive_scorer import score_repo
from analyzer.result_cache import get_cached, set_cached, PRELOADED_REPOS
from analyzer.analysis_jobs import create_job, get_job, set_job_result, touch_job, update_job
from analyzer.repository_utils import normalize_repo_url
from analyzer.repository_validation import RepoValidationError, ensure_github_repo_accessible
from analyzer.pull_request_validation import ensure_pull_request_accessible
from analyzer.github_urls import parse_pr_url
from models.api_schemas import AnalysisRequest, PRAnalysisRequest

EVAL_RESULTS_PATH = Path(__file__).parent / "eval" / "results" / "latest.json"

app = FastAPI(
    title="Slopify API",
    description="Cognitive engagement analysis for git history and pull requests — Team Avenger · Slop Scan Track A",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _normalized_request(req: AnalysisRequest) -> AnalysisRequest:
    try:
        repo_url = normalize_repo_url(req.repo_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if repo_url == req.repo_url:
        return req
    return AnalysisRequest(repo_url=repo_url, max_commits=req.max_commits)


def _raise_validation_http(exc: RepoValidationError) -> None:
    status = 400
    if exc.code == "not_found":
        status = 404
    elif exc.code == "forbidden":
        status = 403
    elif exc.code in ("network", "github_error"):
        status = 502
    raise HTTPException(status_code=status, detail=exc.message)


async def _validate_repo_or_http(repo_url: str) -> None:
    try:
        await ensure_github_repo_accessible(repo_url)
    except RepoValidationError as exc:
        _raise_validation_http(exc)


@app.get("/repos/validate")
async def validate_repo(repo_url: str):
    """Check URL format and whether the GitHub repository exists before starting a scan."""
    try:
        owner, repo = await ensure_github_repo_accessible(repo_url)
    except RepoValidationError as exc:
        _raise_validation_http(exc)
    return {
        "ok": True,
        "owner": owner,
        "repo": repo,
        "full_name": f"{owner}/{repo}",
        "normalized_url": normalize_repo_url(repo_url),
    }


async def _validate_pr_or_http(pr_url: str) -> str:
    try:
        _owner, _repo, _number, normalized = await ensure_pull_request_accessible(pr_url)
    except RepoValidationError as exc:
        _raise_validation_http(exc)
    return normalized


@app.get("/prs/validate")
async def validate_pr(pr_url: str):
    """Check PR URL format and whether the pull request exists on GitHub."""
    normalized = await _validate_pr_or_http(pr_url)
    owner, repo, number = parse_pr_url(normalized)
    return {
        "ok": True,
        "owner": owner,
        "repo": repo,
        "pr_number": number,
        "full_name": f"{owner}/{repo}#{number}",
        "normalized_url": normalized,
    }


@app.post("/analyze")
async def analyze_repo(req: AnalysisRequest):
    req = _normalized_request(req)
    await _validate_repo_or_http(req.repo_url)
    cached = get_cached(req.repo_url, req.max_commits or 200)
    if cached:
        return cached

    try:
        repo_data = await fetch_repo(req.repo_url, max_commits=req.max_commits or 200)
        result = await score_repo(repo_data)
        if result.get("error"):
            raise HTTPException(status_code=422, detail=result["error"])
        set_cached(req.repo_url, result, req.max_commits or 200)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/analyze/start")
async def analyze_start(req: AnalysisRequest, background_tasks: BackgroundTasks):
    req = _normalized_request(req)
    max_commits = req.max_commits or 200
    cached = get_cached(req.repo_url, max_commits)
    if not cached:
        await _validate_repo_or_http(req.repo_url)
    if cached:
        job_id = create_job(req.repo_url, max_commits, job_type="repo")
        set_job_result(job_id, cached, stage="cache_hit")
        return {"job_id": job_id, "cached": True}

    job_id = create_job(req.repo_url, max_commits, job_type="repo")
    update_job(job_id, status="running", progress_pct=3, stage="queued")

    background_tasks.add_task(run_analysis_job, job_id, req.repo_url, max_commits)
    return {"job_id": job_id, "cached": False}


@app.get("/analyze/status/{job_id}")
async def analyze_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/preloaded")
async def list_preloaded():
    return {"repos": list(PRELOADED_REPOS.keys())}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/eval/metrics")
async def eval_metrics(refresh: bool = False):
    if refresh or not EVAL_RESULTS_PATH.exists():
        from eval.evaluation_runner import run as run_eval

        run_eval(fast=True)
    if not EVAL_RESULTS_PATH.exists():
        raise HTTPException(status_code=404, detail="No eval results. Run python scripts/run_evaluation.py")
    return json.loads(EVAL_RESULTS_PATH.read_text(encoding="utf-8"))


@app.post("/analyze/pr")
async def analyze_pr(req: PRAnalysisRequest, background_tasks: BackgroundTasks):
    normalized = await _validate_pr_or_http(req.pr_url)
    job_id = create_job(normalized, max_commits=0, job_type="pr")
    update_job(job_id, status="running", progress_pct=5, stage="fetching_pr")
    background_tasks.add_task(
        run_pr_analysis_job,
        job_id,
        normalized,
        req.skip_commit_analysis,
    )
    return {"job_id": job_id}


@app.get("/analyze/pr/status/{job_id}")
async def analyze_pr_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


async def _job_heartbeat(job_id: str, interval: float = 8.0) -> None:
    """Keep updated_at fresh while long-running sync work blocks progress callbacks."""
    try:
        while True:
            await asyncio.sleep(interval)
            job = get_job(job_id)
            if not job or job.get("status") != "running":
                break
            touch_job(job_id)
    except asyncio.CancelledError:
        pass


async def run_analysis_job(job_id: str, repo_url: str, max_commits: int):
    def progress_cb(pct, stage):
        update_job(job_id, progress_pct=int(pct), stage=stage, status="running")

    heartbeat = asyncio.create_task(_job_heartbeat(job_id))
    try:
        progress_cb(5, "starting")
        repo_data = await fetch_repo(repo_url, max_commits=max_commits, progress_cb=progress_cb)
        if not repo_data.get("commits"):
            update_job(
                job_id,
                status="error",
                stage="failed",
                error="No commits found after 2020-01-01 in this repository.",
            )
            return
        result = await score_repo(repo_data, progress_cb=progress_cb)
        if result.get("error"):
            update_job(job_id, status="error", stage="failed", error=result["error"])
            return
        set_cached(repo_url, result, max_commits)
        set_job_result(job_id, result)
    except RepoValidationError as exc:
        update_job(job_id, status="error", stage="failed", error=exc.message)
    except Exception as exc:
        update_job(job_id, status="error", stage="failed", error=str(exc))
    finally:
        heartbeat.cancel()
        await asyncio.gather(heartbeat, return_exceptions=True)


async def run_pr_analysis_job(job_id: str, pr_url: str, skip_commit_analysis: bool = False):
    def progress_cb(pct, stage):
        update_job(job_id, progress_pct=int(pct), stage=stage, status="running")

    heartbeat = asyncio.create_task(_job_heartbeat(job_id))
    try:
        import httpx
        from analyzer.pull_request_analyzer import analyze_pull_request

        progress_cb(10, "fetching_pr")
        result = await analyze_pull_request(
            pr_url,
            progress_cb=progress_cb,
            skip_commit_analysis=skip_commit_analysis,
        )
        set_job_result(job_id, result, stage="complete")
    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        if status == 404:
            msg = "Pull request not found. Check the URL and PR number."
        elif status == 403:
            msg = "GitHub denied access to this pull request. It may be private — configure GITHUB_TOKEN on the API server."
        else:
            msg = f"GitHub API error ({status}) while analyzing the pull request."
        update_job(job_id, status="error", stage="failed", error=msg)
    except RepoValidationError as exc:
        update_job(job_id, status="error", stage="failed", error=exc.message)
    except ValueError as exc:
        update_job(job_id, status="error", stage="failed", error=str(exc))
    except Exception as exc:
        update_job(job_id, status="error", stage="failed", error=str(exc))
    finally:
        heartbeat.cancel()
        await asyncio.gather(heartbeat, return_exceptions=True)