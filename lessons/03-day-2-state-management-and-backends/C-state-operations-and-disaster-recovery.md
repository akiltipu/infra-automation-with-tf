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
---

# Advanced State Operations & Disaster Recovery

As infrastructure scales, you will inevitably need to refactor code, move resources into modules, untrack legacy assets, and recover from stuck state locks or out-of-band configuration drift.

---

## 1. Refactoring Resources with `terraform state mv`

If you rename a resource block in your HCL code, Terraform's default behavior is to **destroy the old resource and create a new one**:

```hcl
# Before
resource "aws_instance" "web" {}

# After rename in code
resource "aws_instance" "frontend_server" {}
```
> [!WARNING]
> Without intervention, running `terraform apply` will **terminate the running EC2 server** and create a fresh one!

To rename the logical reference in state **without touching live cloud infrastructure**, use `state mv`:

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
The S3 bucket remains running safely in AWS, but Terraform will no longer attempt to update or delete it.

---

## 3. Resolving Stuck State Locks (`force-unlock`)

If a CI/CD job crashes midway through an execution, the DynamoDB lock entry may remain stuck. Subsequent runs will fail with:

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
2. Release the lock using the unique Lock ID:
```bash
terraform force-unlock a1b2c3d4-5678-90ab-cdef-1234567890ab
```

---

## 4. Drift Detection & Remediation (`refresh-only`)

Configuration drift happens when an engineer modifies a resource directly in the AWS Console (e.g., manually changing a Security Group rule).

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│ 1. HCL Code (Port 80)  │  !=  │ 2. State (Port 80)     │  !=  │ 3. AWS Console (Pt 443)│
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
```

### Detecting Drift:
Run a refresh-only plan to inspect the drift:
```bash
terraform plan -refresh-only
```
Terraform queries AWS APIs and reports that AWS has drifted from `terraform.tfstate`.

### Reconciling Drift:
```bash
# Option A: Accept cloud changes and update local state file to match AWS
terraform apply -refresh-only

# Option B: Overwrite the console changes and force AWS back to matching the HCL code
terraform apply
```

---

## 5. Summary & Next Steps

State manipulation and drift remediation are vital operational skills for DevOps leads. In the next lesson, we will explore **Importing Existing Infrastructure and Automated Code Generation in Terraform 1.5+**.
