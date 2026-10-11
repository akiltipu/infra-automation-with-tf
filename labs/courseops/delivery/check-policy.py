"""Small, executable teaching gate for CourseOps plan JSON; not a full scanner."""
import json
import sys

def violations(plan):
    findings = []
    for change in plan.get("resource_changes", []):
        if change.get("mode") != "managed":
            continue
        actions = change["change"]["actions"]
        address = change["address"]
        if "delete" in actions:
            findings.append(f"{address}: deletion or replacement requires separate approval")
        if change["type"] == "aws_instance" and actions != ["delete"]:
            tags = (change["change"].get("after") or {}).get("tags") or {}
            unknown = change["change"].get("after_unknown", {}).get("tags", {})
            for key in ("Owner", "Environment"):
                if unknown is True or (isinstance(unknown, dict) and unknown.get(key)) or not tags.get(key):
                    findings.append(f"{address}: {key} must be known and nonempty")
    return findings

if __name__ == "__main__":
    errors = violations(json.load(sys.stdin))
    for error in errors:
        print(error, file=sys.stderr)
    raise SystemExit(1 if errors else 0)
