---
title: "Remote Backends with AWS S3 & DynamoDB State Locking"
description: "Build an enterprise remote state backend with AWS S3 for encrypted versioned storage and DynamoDB for distributed locking and state migration."
keywords:
  - Remote State
  - S3 Backend
  - DynamoDB LockID
  - State Locking
  - Backend Migration
---

# Remote Backends with AWS S3 & DynamoDB State Locking

In production teams, state must be stored in a centralized, secure, highly available remote backend with **distributed state locking**. On AWS, the gold standard is **Amazon S3** paired with **DynamoDB**.

---

## 1. Remote Backend Architecture

```
┌─────────────────────────┐          ┌─────────────────────────┐
│ Engineer A (Laptop)     │          │ CI/CD Pipeline (GitHub) │
└───────────┬─────────────┘          └───────────┬─────────────┘
            │                                    │
            │ 1. Acquire Lock (LockID)           │ 1. Attempt Lock (BLOCKED!)
            ▼                                    ▼
┌──────────────────────────────────────────────────────────────┐
│                    DynamoDB Lock Table                       │
│    (Ensures only ONE operation modifies state at a time)     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ 2. Read / Write State (Encrypted)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Amazon S3 State Bucket                    │
│   - SSE-KMS Encryption at Rest                               │
│   - Object Versioning (Automatic Rollback Backups)           │
│   - Strict IAM & Bucket Policies (No Public Access)          │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Bootstrapping the S3 Bucket & DynamoDB Table

Before configuring the backend, create the underlying AWS resources (bootstrap phase):

```hcl
# bootstrap/main.tf

provider "aws" {
  region = "us-east-1"
}

# 1. S3 Bucket for State Storage
resource "aws_s3_bucket" "terraform_state" {
  bucket        = "company-tfstate-production-us-east-1-0987"
  force_destroy = false

  lifecycle {
    prevent_destroy = true
  }
}

# 2. Enable Object Versioning (Vital for Disaster Recovery)
resource "aws_s3_bucket_versioning" "state_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Enable Server-Side Encryption (KMS / AES-256)
resource "aws_s3_bucket_server_side_encryption_configuration" "state_crypto" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 4. Block All Public Access
resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 5. DynamoDB Table for Distributed State Locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "company-tfstate-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID" # MUST be exactly "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform State Locking Table"
    Environment = "production"
  }
}
```

---

## 3. Configuring the S3 Backend in Application Code

Once bootstrapped, configure your project's `backend` block:

```hcl
# main.tf

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "company-tfstate-production-us-east-1-0987"
    key            = "production/networking/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "company-tfstate-locks"
    encrypt        = true
  }
}
```

---

## 4. Migrating from Local State to Remote Backend

Run `terraform init` to trigger the backend migration wizard:

```bash
terraform init -migrate-state
```

```
Initializing the backend...
Do you want to copy existing state to the new backend?
  Pre-existing state was found while migrating the previous "local" backend to the
  newly configured "s3" backend.

  Enter a value: yes

Successfully configured the backend "s3"! Terraform will now use this backend.
```

---

## 5. Summary & Next Steps

You have deployed a resilient, encrypted remote backend with distributed state locking. In the next lesson, we will master **State Operations, Refactoring (`state mv`), and Disaster Recovery**.
