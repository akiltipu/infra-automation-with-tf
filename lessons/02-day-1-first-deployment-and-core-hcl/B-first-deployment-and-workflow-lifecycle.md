---
title: "First Deployment & The Complete Terraform Lifecycle"
description: "Hands-on walk-through of your first AWS deployment, dissecting terraform init, fmt, validate, plan, apply, destroy, and the dependency lockfile."
keywords:
  - Terraform Workflow
  - terraform init
  - terraform plan
  - terraform apply
  - terraform destroy
  - terraform lockfile
---

# First Deployment & The Complete Terraform Lifecycle

Let us build our first working infrastructure stack while dissecting each command in the standard Terraform workflow lifecycle.

---

## 1. Writing the Infrastructure Code

Create a directory named `first-stack` and create `main.tf`:

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
}

provider "aws" {
  region = "us-east-1"
}

# 1. Provision a VPC
resource "aws_vpc" "app_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "course-app-vpc"
    Environment = "development"
  }
}

# 2. Provision a Public Subnet inside the VPC
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.app_vpc.id # Implicit dependency
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "course-public-subnet-1"
  }
}

# 3. Provision an Internet Gateway attached to the VPC
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.app_vpc.id

  tags = {
    Name = "course-main-gw"
  }
}
```

---

## 2. The Core 6-Command Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. fmt      │ ──► │ 2. validate  │ ──► │  3. init     │
│ Canonicalize │     │ Static Check │     │ Fetch Binary │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  6. destroy  │ ◄── │  5. apply    │ ◄── │  4. plan     │
│ Safe Cleanup │     │ Execute Live │     │ Speculative  │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Step 1: Canonical Formatting (`terraform fmt`)
Ensures all code across your entire team adheres to standard indentation and alignment:
```bash
terraform fmt -recursive
```

### Step 2: Static Syntax Validation (`terraform validate`)
Checks your configuration for syntactical correctness, attribute name errors, and type mismatches without making any network calls:
```bash
terraform validate
# Success! The configuration is valid.
```

### Step 3: Initialization (`terraform init`)
Prepares the working directory:
- Downloads the AWS provider plugin matching version `~> 5.0`.
- Creates the local hidden `.terraform/` directory.
- Creates or updates the **Dependency Lock File (`.terraform.lock.hcl`)**.

```bash
terraform init
```

> [!IMPORTANT]
> **The Dependency Lock File (`.terraform.lock.hcl`)**:
> This file records the exact version and cryptographic checksums (`zh:...`, `h1:...`) of all downloaded provider plugins. **Always commit `.terraform.lock.hcl` to Git** to ensure that every teammate and CI/CD runner uses identical provider binaries.

### Step 4: Speculative Planning (`terraform plan`)
Reads current state, queries AWS APIs, and prints the proposed execution delta:
```bash
terraform plan -out=tfplan
```
The output indicates:
`Plan: 3 to add, 0 to change, 0 to destroy.`

### Step 5: Live Execution (`terraform apply`)
Applies the plan against real AWS APIs:
```bash
terraform apply tfplan
# Or run interactively: terraform apply (requires typing 'yes')
```
Upon completion, Terraform creates the local `terraform.tfstate` file, recording the IDs of the created VPC, Subnet, and Gateway.

### Step 6: Clean Teardown (`terraform destroy`)
When you are done with a sandbox or testing environment, safely remove all provisioned resources:
```bash
terraform destroy
```
Terraform automatically computes the **reverse dependency graph**: it deletes the Subnet and Internet Gateway first, and only deletes the VPC after its dependent children are removed.

---

## 3. Summary & Next Steps

You have executed the full Terraform lifecycle and mastered the role of initialization, lockfiles, and execution plans. In the next lesson, we will make our code dynamic and reusable using **Input Variables, Custom Validation Rules, Outputs, and Local Values**.
