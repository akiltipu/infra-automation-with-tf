# Delivery: connect checks to a reviewed change

## Runnable course checks

This repository's `.github/workflows/check-course.yml` runs the site checks and the CourseOps lab checks on pull requests, with read-only repository permissions and no AWS identity. From `labs/courseops`, the equivalent lab commands are:

```bash
terraform fmt -check -recursive .
python3 scripts/check-local.py
python3 -m unittest discover -s delivery -p 'test_*.py'
terraform -chdir=modules/network init -backend=false
terraform -chdir=modules/network test
terraform -chdir=modules/web init -backend=false
terraform -chdir=modules/web test
```

Provider mocks still download/start the AWS provider for its schema; no AWS resources are created by those tests. The local check rehearses assignments 02–06 in disposable temporary directories and verifies resource IDs, expected failures, recovery and cleanup. Ansible checks use the actual templates and inventory parser; they do not install packages or configure a cloud host.

## A manual saved-plan release in the AWS sandbox

Use the existing `work/dev` root and verified scoped sandbox identity. Keep the commit, source, lockfile and inputs fixed between review and apply. Commands start at the project root:

```bash
aws sts get-caller-identity
terraform -chdir=work/dev validate
terraform -chdir=work/dev plan -out=release.tfplan
terraform -chdir=work/dev show release.tfplan
terraform -chdir=work/dev show -json release.tfplan | python3 delivery/check-policy.py
# Stop on any failure. Record reviewer approval for this exact plan before applying.
terraform -chdir=work/dev apply release.tfplan
terraform -chdir=work/dev plan
```

The gate intentionally blocks deletion/replacement, including planned retirement. Review retirement separately using the cleanup runbook; do not weaken a production rule simply to get a green result. A passing plan does not prove application health: rerun the Ansible role where appropriate and verify `/healthz` from the allowed operator address.

Saved plans and full plan JSON can contain sensitive data even when terminal output is redacted. Keep them in controlled local storage, do not commit them, and remove them when their retention purpose ends. This public course repository is not a destination for real plan artifacts.

## Extend to OIDC automation in a restricted training repository

The course's GitHub Actions lesson supplies the workflow pattern. Implement the extension only after you have a working manual release and these prerequisites:

| Decision | Required implementation and check |
| --- | --- |
| Source | Checkout the reviewed commit; keep the same Terraform version, provider lockfile, module versions and inputs in plan/apply |
| Identity | OIDC trust restricted to repository and branch/environment; separate narrowly scoped plan and apply roles |
| Backend | Existing bucket/key, state and lock permissions, correct account; serialize changes to this target |
| Untrusted code | PR checks without cloud-write credentials; trusted planning after review/merge according to repository policy |
| Plan artifact | Restricted repository and artifact access, short retention, exact artifact identity; do not post raw JSON in comments |
| Approval | Configure a protected environment with required reviewers; the YAML environment name alone does not enforce a review |
| Apply | Download and apply the approved saved plan; if stale, stop and produce/review a new plan |
| Verification | Inspect application health and partial failures; record cleanup or the next recovery action |

A GitHub `concurrency` group reduces overlapping jobs in the same repository; it is not a replacement for backend locking across other clients. The OIDC role used for the backend can differ from the provider role; check both permission boundaries.

## Why a small Python gate here?

The five fixtures make policy behavior executable without another tool installation. They model the `resource_changes` shape from `terraform show -json`. The gate checks only managed-resource deletion/replacement and known, nonempty `Owner`/`Environment` tags on EC2 instances. It is intentionally not a complete policy engine or vulnerability scanner. Add tests when changing its scope. The existing OPA lesson teaches policy-language alternatives; assignment 08 asks you to reason about the decision before selecting a tool.

## Primary references

- [Saved plans](https://developer.hashicorp.com/terraform/cli/commands/plan)
- [Terraform tests and mocks](https://developer.hashicorp.com/terraform/language/tests/mocking)
- [GitHub OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [Deployment environments and protection](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
