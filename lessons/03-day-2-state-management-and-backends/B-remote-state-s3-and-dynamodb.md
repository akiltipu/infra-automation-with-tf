---
title: "Remote State with Amazon S3 Native Locking"
description: "Build an encrypted, versioned Amazon S3 backend with native lockfiles, least-privilege access, state migration, and a path away from deprecated DynamoDB locking."
keywords:
  - Remote State
  - S3 Backend
  - S3 Lockfile
  - State Locking
  - Backend Migration
---

# Remote State with Amazon S3 Native Locking

For team use, Terraform state needs shared storage, controlled access, recovery history, and protection from concurrent writers. The Amazon S3 backend can provide storage and **native state locking** with `use_lockfile = true`.

> [!IMPORTANT]
> Older courses pair S3 with a DynamoDB table. DynamoDB-based locking is now deprecated by Terraform. Keep it only while clients migrate; new backends should prefer S3 native lockfiles.

## 1. What the backend does

<div class="concept-flow">
  <div class="concept-node"><strong>Engineer or CI</strong><small>Authenticates with an AWS role and starts plan/apply.</small></div>
  <div class="concept-node"><strong>S3 lock object</strong><small>Terraform creates a <code>.tflock</code> object. A second writer waits or exits instead of writing concurrently.</small></div>
  <div class="concept-node"><strong>S3 state object</strong><small>Terraform reads/writes the state key. Versioning provides recoverable historical object versions.</small></div>
</div>

Locking protects against simultaneous Terraform writers. It does not replace pipeline concurrency, approvals, backups, or application-data recovery.

## 2. Bootstrap the S3 bucket

The backend must exist before Terraform can store state in it. Manage the bootstrap stack separately from the application stack whose state it stores.

Create `bootstrap/main.tf`:

```hcl
terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "state_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for Terraform state"
}

resource "aws_s3_bucket" "terraform_state" {
  bucket        = var.state_bucket_name
  force_destroy = false

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" {
  value = aws_s3_bucket.terraform_state.id
}
```

Run with a globally unique bucket name:

```bash
terraform -chdir=bootstrap init
terraform -chdir=bootstrap plan -var='state_bucket_name=replace-with-your-unique-name'
terraform -chdir=bootstrap apply -var='state_bucket_name=replace-with-your-unique-name'
```

Do not destroy this stack during normal application cleanup. State storage has a different lifecycle from the infrastructure it records.

## 3. Configure the application backend

Create a backend block in the application root module:

```hcl
terraform {
  required_version = ">= 1.10.0"

  backend "s3" {
    bucket       = "replace-with-your-unique-name"
    key          = "production/networking/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

Backend blocks cannot use input variables, locals, or resource references because Terraform initializes the backend before it evaluates the root module. Use partial backend configuration for environment-specific non-secret settings:

```hcl
# backend.tf
terraform {
  backend "s3" {}
}
```

```bash
terraform init \
  -backend-config='bucket=replace-with-your-unique-name' \
  -backend-config='key=production/networking/terraform.tfstate' \
  -backend-config='region=us-east-1' \
  -backend-config='encrypt=true' \
  -backend-config='use_lockfile=true'
```

Do not put access keys in `-backend-config`: Terraform can record backend configuration in `.terraform/` and plan artifacts. Use AWS profiles locally and short-lived OIDC credentials in CI.

## 4. Minimum access mental model

The runtime role normally needs:

- `s3:ListBucket` on the bucket, scoped with a prefix condition where practical.
- `s3:GetObject` and `s3:PutObject` on the state object.
- `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject` on the `.tflock` object.
- KMS permissions as well if you select a customer-managed KMS key.

Terraform does not need `s3:DeleteObject` on the state object for normal S3 backend operation. Test the exact policy in a sandbox because organization SCPs, permission boundaries, and KMS key policies also participate in authorization.

## 5. Migrate existing local state

Before migration:

1. Confirm nobody else is running Terraform against this stack.
2. Back up the current local state securely.
3. Verify the S3 bucket, versioning, encryption, and role access.
4. Add or update the backend configuration.

Then run:

```bash
terraform init -migrate-state
terraform state list
terraform plan
```

Read the migration prompt before accepting it. After migration, verify that the expected resources are listed and that `plan` shows the expected result before removing local state copies.

## 6. Migrate from DynamoDB locking

During a controlled transition, Terraform permits both mechanisms:

```hcl
terraform {
  backend "s3" {
    bucket         = "replace-with-your-unique-name"
    key            = "production/networking/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    use_lockfile   = true
    dynamodb_table = "legacy-terraform-locks"
  }
}
```

Upgrade every operator and CI runner to a Terraform version that supports `use_lockfile`, reinitialize, and exercise plan/apply locking. Only then remove `dynamodb_table` and retire the legacy table through a separately reviewed change.

## 7. Lock incident drill

If Terraform reports that the state is locked:

1. Read the lock information: operation, owner, timestamp, and lock ID.
2. Check CI and team activity; assume another operation may still be active.
3. Wait or stop the active operation cleanly.
4. Use `terraform force-unlock LOCK_ID` only after proving the original writer is gone.
5. Run a fresh plan after unlocking.

Never delete a lock merely because it is inconvenient. A mistaken force-unlock can allow two writers and corrupt the workflow you added locking to protect.

## 8. Summary

A production backend is more than a bucket: it combines native locking, versioning, encryption, least-privilege access, short-lived credentials, serialized pipelines, and rehearsed recovery. Next, we will practice state refactoring and disaster recovery operations.
