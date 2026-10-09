"""Build a source-only ZIP from versioned files plus new authored files in Git.

Ignored working copies, plans, state, dependencies and secrets are never included.
"""
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
paths = subprocess.check_output(
    ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "labs/courseops"],
    cwd=ROOT,
).decode().split("\0")
target = ROOT / "public/downloads/courseops-labs.zip"
target.parent.mkdir(parents=True, exist_ok=True)
count = 0
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
    for name in sorted(set(filter(None, paths))):
        path = ROOT / name
        relative = path.relative_to(ROOT / "labs")
        if path.is_symlink():
            raise SystemExit(f"Refusing symlink in lab source: {relative}")
        if not path.is_file():
            continue
        # Defense in depth even if a generated/sensitive file was accidentally staged.
        if any(part in {"work", ".terraform", ".venv", "__pycache__", ".preview"} for part in relative.parts):
            raise SystemExit(f"Generated directory staged in lab source: {relative}")
        if (".tfstate" in path.name or path.suffix in {".tfplan", ".tfvars", ".tfbackend", ".pem", ".key"}
                or path.name in {"inventory.json", "web.json", "plan.json", "status.html"}):
            raise SystemExit(f"Generated/sensitive file staged in lab source: {relative}")
        info = zipfile.ZipInfo(relative.as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, path.read_bytes())
        count += 1
print(f"Packaged {count} authored lab files: {target.relative_to(ROOT)}")
