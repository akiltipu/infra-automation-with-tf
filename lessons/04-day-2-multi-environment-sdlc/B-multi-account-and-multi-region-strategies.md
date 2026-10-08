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

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Trace the identity and region used by each provider configuration.</p></div>

Enterprise security best practices dictate that Development, Staging, and Production environments should reside in **separate AWS Accounts** managed under **AWS Organizations**.

---

## 1. Enterprise Multi-Account Topology


| Account | Example ID | Boundary to configure |
| :--- | :--- | :--- |
| Development | 111122223333 | Sandbox role and state access |
| Staging | 444455556666 | Preproduction role and state access |
| Production | 777788889999 | Restricted role, state, and approval |


By placing environments into distinct AWS accounts:
1. **Reduced Blast Radius**: Separate accounts reduce direct resource access. Cross-account roles, shared networking, and central pipelines can still propagate mistakes.
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


## Apply the idea: follow the assumed role

The source identity must be allowed to call sts:AssumeRole, the target role trust policy must accept it, and the assumed role needs resource permissions. SCPs and permission boundaries can further restrict the result. A region alias changes the API region; it does not by itself assume another account role.

<details class="knowledge-check">
<summary>Check your understanding: Do two regional S3 buckets automatically replicate data?</summary>
<p>No. Provider aliases choose where to manage resources. Replication requires its own configuration, permissions, versioning, and recovery validation.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/providers/configuration).

## 4. Summary & Next Steps

Multi-account topologies provide stronger isolation when trust policies and shared dependencies are controlled, and cross-account IAM role assumption keeps credentials secure. In the next lesson, we will cover **Managing Secrets and Environment Variables with `.tfvars` and AWS Secrets Manager**.
