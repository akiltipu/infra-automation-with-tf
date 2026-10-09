"""Rehearse cloud-free assignment outcomes in disposable local directories.

No AWS credentials, remote backend, or external provider is used. Set TERRAFORM
only when the executable is not on PATH. Each check keeps real local Terraform
state long enough to verify identity and recovery, then destroys its objects.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
TF = os.environ.get("TERRAFORM", "terraform")

def run(folder, *args, success=True):
    result = subprocess.run([TF, f"-chdir={folder}", *args, "-no-color"] if args[0] not in {"output", "state", "show"}
                            else [TF, f"-chdir={folder}", *args], text=True, capture_output=True,
                            env={**os.environ, "TF_IN_AUTOMATION": "1", "TF_INPUT": "0"})
    if (result.returncode == 0) != success:
        raise AssertionError(f"{' '.join(args)} returned {result.returncode}\n{result.stdout}\n{result.stderr}")
    return result.stdout

def output(folder, name):
    return json.loads(run(folder, "output", "-json", name))

def changes(folder, filename):
    plan = json.loads(run(folder, "show", "-json", filename))
    return [r["change"]["actions"] for r in plan.get("resource_changes", []) if r.get("mode") == "managed"]

def init_copy(parent, source, name):
    dest = parent / name
    shutil.copytree(ROOT / source, dest, ignore=shutil.ignore_patterns(".terraform", "*.tfstate*", ".terraform.lock.hcl"))
    run(dest, "init", "-backend=false")
    return dest

with tempfile.TemporaryDirectory(prefix="courseops-check-") as tmp:
    root = Path(tmp)
    service = init_copy(root, "assignments/02/reference", "service")
    run(service, "apply", "-auto-approve", "-var=environment=dev")
    assert output(service, "service") == {"project": "courseops", "environment": "dev", "port": 80}
    identity = output(service, "id")
    run(service, "plan", "-detailed-exitcode", "-var=environment=dev")
    for variables in [("-var=environment=production",), ("-var=environment=dev", "-var=port=0"), ("-var=environment=dev", "-var=port=80.5")]:
        run(service, "plan", *variables, success=False)
    run(service, "apply", "-auto-approve", "-var=environment=dev", "-var=port=8080")
    assert output(service, "id") == identity
    run(service, "destroy", "-auto-approve", "-var=environment=dev")
    print("PASS: service contract, invalid inputs, repeat plan and update identity")

    recovery = init_copy(root, "assignments/03/starter", "recovery")
    run(recovery, "plan", "-out=first.tfplan")
    run(recovery, "apply", "first.tfplan", success=False)
    assert run(recovery, "state", "list").strip() == "terraform_data.foundation"
    # Outputs are not guaranteed after a failed apply; inspect the recorded resource.
    state = json.loads(run(recovery, "show", "-json"))
    identity = state["values"]["root_module"]["resources"][0]["values"]["id"]
    run(recovery, "plan", "-var=readiness=ready", "-out=recovery.tfplan")
    assert sorted(changes(recovery, "recovery.tfplan")) == [["create"], ["update"]]
    run(recovery, "apply", "recovery.tfplan")
    assert output(recovery, "foundation_id") == identity
    run(recovery, "plan", "-detailed-exitcode", "-var=readiness=ready")
    run(recovery, "destroy", "-auto-approve", "-var=readiness=ready")
    print("PASS: partial apply, fresh recovery plan and preserved foundation ID")

    dev = init_copy(root, "assignments/04/reference/dev", "dev")
    prod = init_copy(root, "assignments/04/reference/prod", "prod")
    for folder in (dev, prod): run(folder, "apply", "-auto-approve")
    original_prod = output(prod, "id"), output(prod, "service")
    assert output(dev, "id") != output(prod, "id")
    run(dev, "apply", "-auto-approve", "-var=message=Development changed")
    run(prod, "plan", "-detailed-exitcode")
    assert original_prod == (output(prod, "id"), output(prod, "service"))
    for folder in (dev, prod): run(folder, "destroy", "-auto-approve")
    print("PASS: independent environment state and unchanged production")

    broken = init_copy(root, "assignments/05/starter", "broken-contract")
    run(broken, "test", success=False)
    for source, name in [("assignments/05/reference", "fixed-contract"), ("local/modules/service", "local-module")]:
        fixed = init_copy(root, source, name)
        run(fixed, "test")
    print("PASS: failing starter test and passing repaired contract")

    moved = init_copy(root, "assignments/06/starter", "moved")
    run(moved, "apply", "-auto-approve")
    ids = output(moved, "ids")
    shutil.copyfile(ROOT / "assignments/06/reference/main.tf", moved / "main.tf")
    run(moved, "plan", "-out=refactor.tfplan")
    assert changes(moved, "refactor.tfplan") == [["no-op"]] * 3
    subprocess.run([sys.executable, str(ROOT / "scripts/verify-plan.py")], input=run(moved, "show", "-json", "refactor.tfplan"), text=True, check=True, capture_output=True)
    run(moved, "apply", "refactor.tfplan")
    assert output(moved, "ids") == ids
    source = (moved / "main.tf").read_text().replace('["status", "billing", "search"]', '["status", "search"]')
    (moved / "main.tf").write_text(source)
    run(moved, "plan", "-out=retire.tfplan")
    assert sorted(changes(moved, "retire.tfplan")) == [["delete"], ["no-op"], ["no-op"]]
    rejected = subprocess.run([sys.executable, str(ROOT / "scripts/verify-plan.py")], input=run(moved, "show", "-json", "retire.tfplan"), text=True, capture_output=True)
    assert rejected.returncode != 0
    run(moved, "apply", "retire.tfplan")
    assert output(moved, "ids") == {key: value for key, value in ids.items() if key != "billing"}
    run(moved, "destroy", "-auto-approve")
    print("PASS: count-to-key migration, no-mutation gate and isolated retirement")
