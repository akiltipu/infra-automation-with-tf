---
title: "Multi-Account & Multi-Region Cloud Strategies"
description: "Architect multi-account AWS environments using AWS Organizations, cross-account IAM role assumption (assume_role), and multi-region provider aliases."
keywords:
  - Multi-Account AWS
  - AWS Organizations
  - assume_role
  - Cross-Account IAM
  - Multi-Region
  - Provider Configuration
---

# Multi-Account & Multi-Region Cloud Strategies

Enterprise security best practices dictate that Development, Staging, and Production environments should reside in **separate AWS Accounts** managed under **AWS Organizations**.

---

## 1. Enterprise Multi-Account Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AWS Organizations Root Account                        │
└──────┬──────────────────────┬──────────────────────┬────────────────────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Dev Account │       │ Stage Account│       │ Prod Account │
│ (111122223333│       │ (444455556666│       │ (777788889999│
└──────────────┘       └──────────────┘       └──────────────┘
```

By placing environments into distinct AWS accounts:
1. **Zero Blast Radius**: An accidental deletion in the Dev account cannot physically alter Production.
2. **Quota & Rate Limit Isolation**: High API usage or EC2 instance limits in Dev do not throttle Production workloads.
3. **Billing Segregation**: Cloud costs are automatically itemized per account.

---

## 2. Cross-Account IAM Role Assumption (`assume_role`)

Instead of issuing long-lived access keys for every AWS account, CI/CD pipelines authenticate to a single central identity account and assume a least-privilege IAM role in the target environment:

```hcl
# environments/prod/provider.tf

provider "aws" {
  region = "us-east-1"

  # Assume cross-account role in Production Account (777788889999)
  assume_role {
    role_arn     = "arn:aws:iam::777788889999:role/TerraformDeploymentRole"
    session_name = "TerraformProdDeployment"
  }

  default_tags {
    tags = {
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}
```

---

## 3. Multi-Region Replication & Provider Aliases

When building active-passive or active-active global infrastructure, declare provider aliases and pass them explicitly to modules:

```hcl
# Primary Region (us-east-1)
provider "aws" {
  alias  = "primary"
  region = "us-east-1"
}

# Disaster Recovery Region (eu-west-1)
provider "aws" {
  alias  = "dr"
  region = "eu-west-1"
}

# Module in Primary Region
module "primary_vpc" {
  source = "../../modules/networking"
  providers = {
    aws = aws.primary
  }
  vpc_cidr = "10.0.0.0/16"
}

# Module in DR Region
module "dr_vpc" {
  source = "../../modules/networking"
  providers = {
    aws = aws.dr
  }
  vpc_cidr = "10.1.0.0/16"
}
```

---

## 4. Summary & Next Steps

Multi-account topologies provide bulletproof isolation, and cross-account IAM role assumption keeps credentials secure. In the next lesson, we will cover **Managing Secrets and Environment Variables with `.tfvars` and AWS Secrets Manager**.
