"""Fail a refactor gate if a managed object will be created, updated, or deleted.
Usage: terraform show -json refactor.tfplan | python scripts/verify-plan.py
Plan JSON can contain secrets. Do not upload the input or print it in CI.
"""
import json
import sys
plan = json.load(sys.stdin)
changes = [r["address"] for r in plan.get("resource_changes", [])
           if r.get("mode") == "managed" and r["change"]["actions"] != ["no-op"]]
if changes:
    raise SystemExit("Refactor is not a no-op: " + ", ".join(changes))
print("PASS: no managed resource mutations in the refactor plan")
