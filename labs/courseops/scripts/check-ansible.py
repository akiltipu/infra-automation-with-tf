"""Check actual inventory parsing, role template rendering and assignment 07 locally."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]

def command(args, cwd, **kwargs):
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True, **kwargs)
    if result.returncode:
        raise AssertionError(f"{args}\n{result.stdout}\n{result.stderr}")
    return result.stdout

with tempfile.TemporaryDirectory(prefix="courseops-ansible-") as tmp:
    root = Path(tmp)
    shutil.copytree(ROOT / "ansible", root / "ansible", ignore=shutil.ignore_patterns(".preview", ".venv", "inventory.json"))
    role = root / "ansible"
    web = {"public_ip": "203.0.113.10", "environment": "staging"}
    inventory = command([sys.executable, str(ROOT / "scripts/inventory.py")], ROOT, input=json.dumps(web))
    (role / "inventory.json").write_text(inventory)
    parsed = json.loads(command(["ansible-inventory", "-i", "inventory.json", "--list"], role))
    assert parsed["_meta"]["hostvars"]["web"]["ansible_host"] == web["public_ip"]
    assert parsed["courseops"]["hosts"] == ["web"]
    command(["ansible-playbook", "-i", "inventory.json", "site.yml", "--syntax-check"], role)
    command(["ansible-playbook", "-i", "localhost,", "render-test.yml"], role)
    repeat = command(["ansible-playbook", "-i", "localhost,", "render-test.yml"], role)
    assert "changed=0" in repeat
    page = (role / ".preview/index.html").read_text()
    assert "staging environment" in page and "{{" not in page
    print("PASS: static inventory parsed, cloud play syntax, actual role template repeat run")

    assignment = root / "assignment-07"
    shutil.copytree(ROOT / "assignments/07/reference", assignment)
    cmd = ["ansible-playbook", "-i", "localhost,", "-c", "local", "render.yml"]
    command(cmd + ["-e", "courseops_environment=staging"], assignment)
    original = (assignment / "status.html").read_text()
    assert "staging environment" in original and "Maintenance &lt;scheduled&gt;" in original
    assert "changed=0" in command(cmd + ["-e", "courseops_environment=staging"], assignment)
    forecast = command(cmd + ["-e", "courseops_environment=prod", "--check", "--diff"], assignment)
    assert "changed=1" in forecast
    assert (assignment / "status.html").read_text() == original
    print("PASS: assignment template escaping, precedence, idempotency and check-mode preservation")
