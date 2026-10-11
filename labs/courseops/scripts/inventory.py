"""Convert only `terraform output -json web` to a static JSON/YAML inventory."""
import ipaddress
import json
import sys

web = json.load(sys.stdin)
ip = str(ipaddress.ip_address(web["public_ip"]))
if web["environment"] not in {"dev", "staging", "prod"}:
    raise SystemExit("Unexpected environment")
print(json.dumps({"all": {"children": {"courseops": {"hosts": {"web": {
    "ansible_host": ip,
    "ansible_user": "ubuntu",
    "courseops_environment": web["environment"],
}}}}}}, indent=2))
