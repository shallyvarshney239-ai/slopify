"""CLI entrypoint for evaluation."""
import argparse
import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from eval.evaluation_runner import run, RESULTS_PATH

MIN_F1_FLOOR = 0.25


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fast", action="store_true", help="Skip ML model (CI)")
    parser.add_argument("--fail-below-f1", type=float, default=None)
    args = parser.parse_args()

    result = run(fast=args.fast)
    print(json.dumps({
        "fixture_count": result["fixture_count"],
        "engagement_accuracy": result["engagement"]["accuracy"],
        "written_to": str(RESULTS_PATH),
    }, indent=2))

    if args.fail_below_f1 is not None:
        for flag, m in result["flag_metrics"].items():
            if m["support"] > 0 and m["f1"] < args.fail_below_f1:
                sys.exit(1)


if __name__ == "__main__":
    main()
