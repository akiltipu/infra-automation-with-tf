# CourseOps: one project, eight milestones

Build a service-status page whose infrastructure is managed by Terraform and whose guest configuration is managed by Ansible. The core deployment is deliberately a single Ubuntu EC2 host, HTTP restricted to your /32, encrypted EBS, and IMDSv2. Two public/private subnet pairs teach routing; private subnets have no internet egress by default. This is a sandbox, not a high-availability production service.

Use [LEARNING-LOG.md](LEARNING-LOG.md) to record predictions, selected evidence and later recall for each milestone.

## Choose your path

| Path | What you run | What it proves |
| --- | --- | --- |
| Cloud-free | `local/`, assignment starters, local Ansible template preview, policy fixtures | HCL, state identity, isolation, contracts, refactoring, templating, gate behavior |
| AWS sandbox | One `work/dev` root evolved from flat to modular code, then the Ansible role | Actual network, EC2, SSH readiness, HTTP and health endpoint |
| Advanced extension | NAT/endpoints, real second AWS account, TLS/load balancer, restore drill | Additional architecture decisions; each requires its own validation |

A local model is not an AWS deployment. Submit evidence for the path you actually executed. Assignments distinguish local evidence from cloud evidence.

## Prerequisites and version baseline

Terraform >=1.10 and <2, Git, Python 3.11+, and a POSIX shell (macOS/Linux/WSL). The Terraform test and mock syntax used here is supported by this minimum. AWS examples constrain provider 5.x for consistency with the existing course; review release notes before changing that baseline. CI uses Terraform 1.10.5 to keep exercises reproducible; select a supported, tested release for production.

The AWS path also requires AWS CLI v2, a scoped sandbox identity, an EC2 quota, an SSH key and your public IPv4 /32. Keep account credentials out of code. Use `aws sso login --profile course-dev`, export the profile, and verify `aws sts get-caller-identity`. Allowed-account checking in the provider is an extra guard; the S3 backend authenticates independently.

For Ansible, create a Python virtual environment and install `ansible/requirements.txt`. Ansible uses the operator's existing SSH agent or `--private-key`; Terraform never reads the private key. Do not turn off host-key checking.

## Milestones and directory ownership

| Section | Outcome | Files |
| --- | --- | --- |
| 01 | Explain the design and target identity | `assignments/01/starter/decision-record.md` |
| 02 | Provision the first stack or model the service locally | `checkpoints/02-first-stack/`, `local/` |
| 03 | Protect the same state and rehearse recovery | `bootstrap/`, `config/`, `runbooks/recovery.md` |
| 04 | Prove separate environment state and identity | `local/live/dev`, `local/live/prod` |
| 05 | Refactor existing objects into tested modules | `checkpoints/05-modular/`, `modules/` |
| 06 | Preserve resource identity through change | `assignments/06/`, `runbooks/upgrades.md` |
| 07 | Configure and verify the status page | `ansible/`, `scripts/inventory.py` |
| 08 | Demonstrate a reviewed delivery and recovery process | `delivery/`, `CAPSTONE.md` |

Always run AWS operations from your **one working copy** `work/dev`. Checkpoint directories are reference snapshots, not separate stacks to apply. Do not copy state between checkpoints or apply both snapshots to the same real objects. Keep the working folder at this relative depth so module source paths resolve.

All commands below start in `labs/courseops`, unless a `cd` is shown. Use a fresh checkout/download and preserve your work and state between sections. `work/` is ignored to protect local artifacts; keep reviewed non-secret source in your own private training repository if you need version history.

## 1. Cloud-free starting point

```bash
terraform -chdir=local/live/dev init
terraform -chdir=local/live/dev plan
terraform -chdir=local/live/dev apply
terraform -chdir=local/live/dev output
terraform -chdir=local/modules/service init
terraform -chdir=local/modules/service test
```

The output describes CourseOps. It does not serve HTTP. A second plan should report no resource changes. Return to this module when learning state, environment isolation, contracts, and tests.

## 2. Create the first AWS working copy

```bash
mkdir -p work/dev
cp checkpoints/02-first-stack/*.tf work/dev/
cp checkpoints/02-first-stack/.terraform.lock.hcl work/dev/
cp config/dev.tfvars.example work/dev/terraform.tfvars
```

Edit every placeholder in `work/dev/terraform.tfvars`. Keep `enable_nat` and `enable_s3_endpoint` false for the core lab. The default subnet AZs are for `us-east-1`; change the region and the full subnet map together if using another region. Select an official Ubuntu 22.04 x86_64 AMI in that region and save its reviewed ID (no rolling latest query). Use the account ID from STS and paste only your public SSH key.

```bash
aws sts get-caller-identity
terraform -chdir=work/dev init
terraform -chdir=work/dev fmt
terraform -chdir=work/dev validate
terraform -chdir=work/dev plan -out=create.tfplan
terraform -chdir=work/dev show create.tfplan
terraform -chdir=work/dev apply create.tfplan
terraform -chdir=work/dev output -json web
terraform -chdir=work/dev plan
```

With the default two subnet pairs and optional egress disabled, expect **16 managed resources**. Read the plan rather than relying only on the count. Capture the instance ID and VPC ID. HTTP is not configured yet; a failed HTTP request at this stage is expected. EC2, EBS, public IPv4 and traffic may incur charges. Stop and clean up if leaving the workshop.

## 3. Migrate this state to S3

Create a distinct globally unique state bucket in the separate bootstrap root. This bucket uses SSE-S3 encryption, versioning, a TLS-only policy and blocked public access; KMS is an advanced extension.

```bash
terraform -chdir=bootstrap init
terraform -chdir=bootstrap plan -var='bucket_name=YOUR_UNIQUE_BUCKET' -var='expected_account_id=YOUR_ACCOUNT_ID'
terraform -chdir=bootstrap apply -var='bucket_name=YOUR_UNIQUE_BUCKET' -var='expected_account_id=YOUR_ACCOUNT_ID'
```

Protect the bootstrap local state too. Freeze other writers, back up the application's current state securely, then:

```bash
cp config/backend.tf.example work/dev/backend.tf
cp config/dev.s3.tfbackend.example work/dev/dev.s3.tfbackend
# Edit bucket and key in the backend file; never add credentials.
terraform -chdir=work/dev init -migrate-state -backend-config=dev.s3.tfbackend
terraform -chdir=work/dev state list
terraform -chdir=work/dev plan
```

The bucket/key/workspace selects the state. Migration must preserve object IDs and produce no unintended changes. The caller needs state Get/Put, scoped ListBucket, and Get/Put/Delete on the `.tflock` sibling. Configure access policy with your administrator; the bootstrap intentionally does not grant broad account access. Do not use `-reconfigure` as a substitute for migrating state.

## 4. Prove environment separation

Use `local/live/dev` and `local/live/prod` for the required exercise. Both contain the same address but distinct IDs and separate state. For the optional cloud extension, create `work/staging` from the same checkpoint with different inputs, a distinct backend key, and separately scoped credentials. Do not copy the dev state file. A separate folder alone is not authorization.

## 5. Refactor the same stack

Keep `work/dev/terraform.tfvars`, its provider lockfile, `backend.tf`, backend config, and current state. Do not delete the working directory. After saving your original source and recording IDs, replace only the five authored files, then add `moved.tf`:

```bash
cp checkpoints/05-modular/main.tf work/dev/main.tf
cp checkpoints/05-modular/variables.tf work/dev/variables.tf
cp checkpoints/05-modular/outputs.tf work/dev/outputs.tf
cp checkpoints/05-modular/provider.tf work/dev/provider.tf
cp checkpoints/05-modular/versions.tf work/dev/versions.tf
cp checkpoints/05-modular/moved.tf work/dev/moved.tf
terraform -chdir=work/dev init
terraform -chdir=work/dev plan -out=refactor.tfplan
terraform -chdir=work/dev show -json refactor.tfplan | python3 scripts/verify-plan.py
terraform -chdir=work/dev apply refactor.tfplan
```

Expected: address moves and **0 add / 0 change / 0 destroy** for managed resources. Stop if that is not the plan. The verifier checks managed mutations, not whether a move maps the correct business object; compare IDs and review the move table too. Preserve the moves for supported upgrade paths.

Run mock tests without AWS credentials (provider downloads and provider schema loading still required):

```bash
terraform -chdir=modules/network init -backend=false
terraform -chdir=modules/network test
terraform -chdir=modules/web init -backend=false
terraform -chdir=modules/web test
```

Mocks check the declared configuration, not AWS permissions, quotas, networking or API behavior. Real `terraform test` runs without mock providers can create billable infrastructure. Read a test file before running it.

## 6. Configure the host

Verify the SSH fingerprint through the authenticated EC2 console/system log, then make one interactive SSH connection and accept only the matching key. A changed fingerprint after replacement requires re-verification. SSH connectivity alone does not prove cloud-init finished.

```bash
terraform -chdir=work/dev output -json web | python3 scripts/inventory.py > ansible/inventory.json
cd ansible
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements.txt
ansible-inventory -i inventory.json --graph
ansible-playbook -i inventory.json site.yml --syntax-check
ansible-playbook -i inventory.json site.yml --private-key ~/.ssh/YOUR_LAB_KEY
ansible-playbook -i inventory.json site.yml --private-key ~/.ssh/YOUR_LAB_KEY
cd ..
```

The second run should have no application changes when the apt cache is still valid. Verify `http://HOST_IP/` and `/healthz` from the operator IP allowed in the security group. Change `courseops_message` with `--extra-vars` and rerun: the page changes without an unnecessary service restart. The cloud-free alternative is `ansible-playbook render-test.yml` from the Ansible directory: it renders the same page template without sudo, package installation or SSH.

## 7. Clean up and cost verification

```bash
terraform -chdir=work/dev plan -destroy -out=destroy.tfplan
terraform -chdir=work/dev show destroy.tfplan
terraform -chdir=work/dev apply destroy.tfplan
terraform -chdir=work/dev state list
terraform -chdir=local/live/dev destroy
terraform -chdir=local/live/prod destroy
```

Run cleanup only for roots you initialized/applied. Verify the EC2 instance is terminated and the associated EBS volume is removed; inspect optional NAT gateways/EIPs if enabled. Keep the state bucket until every dependent stack is retired and required history is retained. It intentionally has `prevent_destroy` and cannot be treated as disposable application cleanup. To retire it later, archive required state securely, review removal of protection, and explicitly deal with all versioned objects; never enable `force_destroy` simply to bypass the decision.

## Troubleshooting

| Symptom | First checks | Avoid |
| --- | --- | --- |
| Wrong account or AccessDenied | STS account/role, provider allowed account, backend role and key permissions | Broad AdministratorAccess as a debugging shortcut |
| Provider cannot start | CLI/platform compatibility, plugin permissions and execution environment | Treating this as a cloud-resource failure |
| SSH timeout | Operator public IP changed, SG /32, route, public IP, key, host fingerprint | Opening SSH to everyone or disabling verification |
| apt lock | Wait for cloud-init, inspect its status/log | Deleting package lock files while apt is active |
| Non-empty refactor plan | Same tfvars, AMI ID, source, provider lockfile, move addresses | Applying to see what happens |
| HTTP failure after playbook | service status, `nginx -t`, SG source IP, `/healthz` | Assuming Terraform apply proves app health |

Use [the recovery runbook](runbooks/recovery.md), [upgrade guide](runbooks/upgrades.md), and [capstone](CAPSTONE.md) for the remaining milestones. Instructor answers are in `instructor/`; attempt the problems before opening them.
