---
title: "Module Sources, Public Registry & Version Pinning"
description: "Master referencing modules from the Terraform Registry, Git repositories with tag pinning, and managing private enterprise module registries."
keywords:
  - Module Sources
  - Terraform Registry
  - Git Module Source
  - Semantic Versioning
  - Version Pinning
---

# Module Sources, Public Registry & Version Pinning

Terraform modules can be sourced from local file paths, the official **Terraform Registry**, Git repositories, or private organizational registries.

---

## 1. Supported Module Source Types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Supported Module Sources                              │
├─────────────────────┬───────────────────────────────────────────────────────┤
│ 1. Local Path       │ source = "./modules/vpc"                              │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Public Registry  │ source = "terraform-aws-modules/vpc/aws"              │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Git HTTPS / SSH  │ source = "git::https://github.com/org/repo.git?ref=v1"│
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Private Registry │ source = "app.terraform.io/my-org/vpc/aws"            │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 2. Using Verified Modules from the Terraform Registry

The [Terraform Registry](https://registry.terraform.io) hosts thousands of community and vendor-maintained modules.

### Example: Official AWS VPC Module
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0" # Always pin versions!

  name = "production-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false

  tags = {
    Environment = "production"
  }
}
```

---

## 3. Referencing Git Repositories with Semantic Versioning

For proprietary internal modules stored in GitHub, GitLab, or Bitbucket:

```hcl
# Pinning to a specific Git Release Tag (Recommended)
module "internal_security" {
  source = "git::https://github.com/company/terraform-aws-security.git?ref=v2.4.1"
}

# Pinning via SSH (for private enterprise repos)
module "database_cluster" {
  source = "git::git@github.com:company/terraform-aws-rds.git?ref=v3.1.0"
}
```

> [!IMPORTANT]
> **Never Point to Unpinned Branches in Production**:
> Sourcing `?ref=main` or omitting `?ref` entirely means someone pushing a breaking commit to `main` could unexpectedly alter your production plan. **Always pin exact Git tags or semantic release versions**.

---

## 4. Summary & Next Steps

Version pinning ensures reproducible, deterministic deployments across all environments. In the next lesson, we will examine **Enterprise Module Composition and Architecture Patterns**.
