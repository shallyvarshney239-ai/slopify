from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    repo_url: str
    max_commits: Optional[int] = 200


class PRAnalysisRequest(BaseModel):
    pr_url: str
    skip_commit_analysis: bool = False


class CommitRecord(BaseModel):
    sha: str
    author: str
    timestamp: str
    unix_ts: int
    message: str
    cognitive_score: float
    flags: List[str]
    semantic_novelty: float
    message_quality: float
    diff: Dict[str, Any]


class ContributorStat(BaseModel):
    author: str
    commit_count: int
    mean_score: float
    score_trend: str
    paste_and_pray_pct: float
    rubber_stamp_pct: float


class CollapseEvent(BaseModel):
    timestamp: int
    commit_sha: str
    score_before: float
    score_after: float
    drop_magnitude: float
    label: str


class AnalysisSummary(BaseModel):
    mean_cognitive_score: float
    total_flags: int
    paste_and_pray_count: int
    rubber_stamp_count: int
    high_engagement_pct: float
    collapse_events: List[CollapseEvent]


class AnalysisResult(BaseModel):
    repo_url: str
    repo_name: str
    total_commits_analyzed: int
    summary: AnalysisSummary
    era_split: Optional[dict] = None
    file_heatmap: Optional[List[Dict[str, Any]]] = None
    commits: List[CommitRecord]
    contributors: List[ContributorStat]