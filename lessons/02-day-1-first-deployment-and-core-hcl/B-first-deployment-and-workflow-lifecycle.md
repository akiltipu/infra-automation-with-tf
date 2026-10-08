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

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Initialize, validate, review a saved plan, and clean up a sandbox.</p></div>

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

# 4. A public subnet needs a route to the internet gateway.
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.app_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public.id
}
```

---

## 2. The Core 6-Command Lifecycle

<ol class="workflow-steps">
  <li><strong>Format</strong><span>Normalize HCL.</span></li>
  <li><strong>Initialize</strong><span>Install providers and configure state.</span></li>
  <li><strong>Validate</strong><span>Check the initialized configuration.</span></li>
  <li><strong>Plan</strong><span>Save and review proposed actions.</span></li>
  <li><strong>Apply</strong><span>Execute that saved plan.</span></li>
  <li><strong>Clean up</strong><span>Review a sandbox destroy.</span></li>
</ol>

### Step 1: Canonical Formatting (`terraform fmt`)
Ensures all code across your entire team adheres to standard indentation and alignment:
```bash
terraform fmt -recursive
```

### Step 2: Initialization (`terraform init`)
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

### Step 3: Static Syntax Validation (`terraform validate`)
Checks your configuration for syntactical correctness, attribute name errors, and type mismatches without making any network calls:
```bash
terraform validate
# Success! The configuration is valid.
```

### Step 4: Saved Planning (`terraform plan`)
Reads current state, queries AWS APIs, and prints the proposed execution delta:
```bash
terraform plan -out=tfplan
```
The output indicates:
`Plan: 5 to add, 0 to change, 0 to destroy.`

### Step 5: Live Execution (`terraform apply`)
Review the saved actions with `terraform show tfplan`. Applying a saved plan executes without an additional confirmation prompt; possession of the plan is not a substitute for approval. Plans may contain secrets.

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


## Apply the idea: read the plan before approval

For this stack, the VPC precedes the subnet and internet gateway. The route table references the gateway; the association references both the subnet and route table. Expect five managed resources. A public IP alone is insufficient for internet access: routing, security groups, and network ACLs also matter.

<details class="knowledge-check">
<summary>Check your understanding: You edit main.tf after saving tfplan. Does applying tfplan use the edit?</summary>
<p>No. A saved plan carries the previously planned configuration and actions. Discard it and generate a new plan when intent changes; do not approve one configuration and execute another.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/cli/commands/plan).

## 3. Summary & Next Steps

You have executed the full Terraform lifecycle and mastered the role of initialization, lockfiles, and execution plans. In the next lesson, we will make our code dynamic and reusable using **Input Variables, Custom Validation Rules, Outputs, and Local Values**.
