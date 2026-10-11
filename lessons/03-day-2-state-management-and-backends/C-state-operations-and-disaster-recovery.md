---
title: "Advanced State Operations & Disaster Recovery"
description: "Master state manipulation commands (state mv, state rm, force-unlock), refactor resource identifiers, and resolve real-world infrastructure drift."
keywords:
  - terraform state mv
  - terraform state rm
  - force-unlock
  - Drift Detection
  - refresh-only
  - Disaster Recovery
kind: concept
track: core
---

# Advanced State Operations & Disaster Recovery

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Choose between address migration, unmanagement, and drift reconciliation.</p></div>

<div class="project-connection"><strong>CourseOps · Section 03</strong><p>Apply this concept in the connected project. <a href="/lessons/day-2-state-management-and-backends/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-2-state-management-and-backends/mini-assignment">mini assignment</a>.</p></div>

As infrastructure scales, you will inevitably need to refactor code, move resources into modules, untrack legacy assets, and recover from stuck state locks or out-of-band configuration drift.

---

## 1. Refactor addresses with a reviewable move

Without an address migration, a resource rename can appear as a deletion and a creation. The empty blocks below illustrate addresses only; they are not runnable EC2 configuration.

```hcl
# Before
resource "aws_instance" "web" {}

# After rename in code
resource "aws_instance" "frontend_server" {}
```
> [!WARNING]
> Without intervention, running `terraform apply` will **terminate the running EC2 server** and create a fresh one!

Prefer a `moved` block for a migration that should travel with source code and be visible in the plan (Terraform 1.1+):

```hcl
moved {
  from = aws_instance.web
  to   = aws_instance.frontend_server
}
```

Review the plan and verify the object ID. `terraform state mv` is an imperative alternative for a coordinated state operation; it changes state immediately rather than leaving migration history in configuration:

```bash
# Move resource identifier in state
terraform state mv aws_instance.web aws_instance.frontend_server

# Output:
# Successfully moved 1 object(s).
```

### Moving Standalone Resources into a Module:
```bash
terraform state mv aws_security_group.app module.networking.aws_security_group.app
```

---

## 2. Unmanaging Resources with `terraform state rm`

If you want Terraform to stop tracking a resource (without deleting it from AWS):

```bash
# Remove resource from state file
terraform state rm aws_s3_bucket.legacy_data

# Output:
# Successfully removed aws_s3_bucket.legacy_data from state.
```
The bucket remains in AWS. Remove its configuration too if you intend to stop management; otherwise the next plan proposes creating a new binding and may fail on a name collision. For a reviewed handoff on Terraform 1.7+, consider a `removed` block with `destroy = false`.

---

## 3. Resolving Stuck State Locks (`force-unlock`)

If a CI/CD job crashes midway through an execution, a backend lock may remain. With the S3 backend this is normally the `.tflock` object; legacy configurations may use a DynamoDB lock entry. Subsequent runs will fail with:

```
Error: Error acquiring the state lock
Lock Info:
  ID:        a1b2c3d4-5678-90ab-cdef-1234567890ab
  Path:      company-tfstate-production/terraform.tfstate
  Operation: OperationTypeApply
  Who:       runner@github-actions-01
```

### Safely Unlocking the Backend:
1. Verify that no other teammate or pipeline is actively writing to the infrastructure.
2. Preserve the failed job logs and identify why the writer stopped.
3. Release the lock using the unique Lock ID only after the original process is gone:
```bash
terraform force-unlock a1b2c3d4-5678-90ab-cdef-1234567890ab
```

---

## 4. Observe drift, then choose the intended result

Configuration drift happens when an engineer modifies a resource directly in the AWS Console (e.g., manually changing a Security Group rule).

![Intent and refreshed state converge in a reviewed plan](/images/lesson-diagrams/reconcile.svg)


### Detecting Drift:
Run a refresh-only plan to inspect the drift:
```bash
terraform plan -refresh-only
```
Terraform queries AWS APIs and reports that AWS has drifted from `terraform.tfstate`.

### Reconciling Drift:
```bash
# Record observations only, after reviewing the saved refresh-only plan.
terraform plan -refresh-only -out=observed.tfplan
terraform show observed.tfplan
terraform apply observed.tfplan

# Separately choose intent: edit HCL to accept an intentional change,
# or retain the original HCL to propose restoring it. Review before apply.
terraform plan -out=reconcile.tfplan
terraform show reconcile.tfplan
# Apply reconcile.tfplan only after its actions are approved.
```

---


## Apply the idea: choose the recovery operation

For a resource rename, keep the object and migrate its address, preferably with a reviewed moved block. For intentional console drift, update the HCL and inspect a fresh normal plan. For a corrupt state snapshot, pause writers and follow the backend recovery runbook. These are different incidents with different fixes.

<details class="knowledge-check">
<summary>Check your understanding: Does apply -refresh-only permanently accept a console change?</summary>
<p>It updates state to observed reality, but leaves HCL unchanged. A later normal plan may propose reverting the console change until code expresses the new intent.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/cli/commands/plan#planning-modes).

## 5. Summary & Next Steps

State manipulation and drift remediation are vital operational skills for DevOps leads. In the next lesson, we will explore **Importing Existing Infrastructure and Automated Code Generation in Terraform 1.5+**.
