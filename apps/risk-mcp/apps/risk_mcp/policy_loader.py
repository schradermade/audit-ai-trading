import yaml
from pathlib import Path
from datetime import datetime


POLICY_PATH = Path("/app/policies/risk/position_limits.yaml")


def load_policies(as_of: datetime):
    with POLICY_PATH.open() as f:
        data = yaml.safe_load(f)

    active = []

    for policy in data.get("policies", []):
        effective = datetime.fromisoformat(
            policy["effective_from"].replace("Z", "+00:00")
        )
        if as_of >= effective:
            active.append(policy)

    return active
