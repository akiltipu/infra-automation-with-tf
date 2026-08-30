---
title: "Data Sources, Provider Configuration & Local State Mechanics"
description: "Learn how to query live cloud data using Data Sources, configure multiple provider aliases, and understand how local state records infrastructure."
keywords:
  - Data Sources
  - aws_ami
  - Provider Aliases
  - terraform.tfstate
  - Local State Mechanics
---

# Data Sources, Provider Configuration & Local State Mechanics

Real-world cloud architectures rarely exist in a vacuum. You frequently need to reference existing cloud assets (such as official Ubuntu AMIs, standard VPCs, or DNS zones) without managing their lifecycle in your current Terraform code.

---

## 1. Data Sources: Reading Existing Infrastructure

A **Data Source** allows Terraform to read metadata from the cloud provider at runtime. Unlike `resource` blocks, Terraform will **never create, modify, or destroy** resources defined in a `data` block.

```
┌─────────────────────────────────┐
│ resource "aws_instance" "web"   │ ──► CREATE, UPDATE, DELETE (Managed)
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ data "aws_ami" "ubuntu"         │ ──► READ-ONLY QUERY (Unmanaged)
└─────────────────────────────────┘
```

### Finding the Latest Ubuntu 22.04 LTS AMI Dynamically:
Instead of hardcoding brittle AMI IDs like `ami-0c55b159cbfafe1f0`, use a data source:

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Official Ubuntu Owner ID)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Reference the dynamically discovered AMI ID
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}
```

---

## 2. Provider Aliases (Multi-Region / Multi-Account Setup)

Sometimes you need to provision resources across multiple AWS regions (e.g., primary in `us-east-1` and disaster recovery replica in `us-west-2`) within the same code module:

```hcl
# Default Provider (us-east-1)
provider "aws" {
  region = "us-east-1"
}

# Alternate Provider with Alias (us-west-2)
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

# Resource in Default Region (us-east-1)
resource "aws_s3_bucket" "primary_bucket" {
  bucket = "my-company-primary-storage-8921"
}

# Resource in Secondary Region (us-west-2) using provider alias
resource "aws_s3_bucket" "dr_bucket" {
  provider = aws.west
  bucket   = "my-company-dr-storage-8921"
}
```

---

## 3. Local State Mechanics & Limitations

When you execute `terraform apply`, Terraform creates `terraform.tfstate` in your working directory.

### Inside `terraform.tfstate` (JSON):
```json
{
  "version": 4,
  "terraform_version": "1.10.5",
  "serial": 12,
  "lineage": "e7b4a2f8-9a3d-4c5e-8b1a-2c3d4e5f6a7b",
  "resources": [
    {
      "mode": "managed",
      "type": "aws_vpc",
      "name": "app_vpc",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "id": "vpc-0abc123def456",
            "cidr_block": "10.0.0.0/16",
            "enable_dns_hostnames": true
          }
        }
      ]
    }
  ]
}
```

### Why Local State Fails in Teams:
1. **Concurrency Conflicts**: If two engineers run `terraform apply` simultaneously, their local state files overwrite each other, causing corrupted state.
2. **Secrets in Plaintext**: State files contain sensitive database passwords and private keys in clear text JSON. Storing them locally on laptops or checking them into Git is a critical security vulnerability.
3. **No Centralized History**: Teammates cannot see recent infrastructure changes made by others.

---

## 4. Day 1 Wrap-up & Transition to Day 2

You have mastered the foundations of Terraform:
- The historical evolution of cloud infrastructure and declarative IaC theory.
- Why Terraform exists, the problems it solves, and its internal architecture.
- Full local installation, tooling, and AWS credentials configuration.
- HCL block anatomy, data types, variable validation, outputs, and locals.
- Core CLI lifecycle commands, data sources, and state mechanics.

In **Day 2**, we will solve the state synchronization dilemma by building **Remote State Backends with AWS S3 and DynamoDB Distributed Locking**, mastering **State Disaster Recovery**, and designing **Multi-Environment SDLC Architecture**!
