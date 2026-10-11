---
title: "Module Sources, Public Registry & Version Pinning"
description: "Master referencing modules from the Terraform Registry, Git repositories with tag pinning, and managing private enterprise module registries."
keywords:
  - Module Sources
  - Terraform Registry
  - Git Module Source
  - Semantic Versioning
  - Version Pinning
kind: concept
track: extension
---

# Module Sources, Public Registry & Version Pinning

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Distinguish exact module versions from allowed provider ranges.</p></div>

<div class="project-connection"><strong>CourseOps · Section 05</strong><p>Extension reading: return after the core workshop. <a href="/lessons/day-3-terraform-modules/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-3-terraform-modules/mini-assignment">mini assignment</a>.</p></div>

Terraform modules can be sourced from local file paths, the official **Terraform Registry**, Git repositories, or private organizational registries.

---

## 1. Supported Module Source Types


| Source | Selection mechanism |
| :--- | :--- |
| Local path | Version with the parent repository. |
| Public registry | Use version for an exact release or explicit range. |
| Git HTTPS/SSH | Use ref for a tag or immutable commit. |
| Private registry | Use registry versions and authenticated access. |


---

## 2. Using Verified Modules from the Terraform Registry

The [Terraform Registry](https://registry.terraform.io) hosts thousands of community and vendor-maintained modules.

### Example: Community AWS VPC Module
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0" # Teaching example: select and test an exact release

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


## Apply the idea: review an upgrade deliberately

An exact registry module version chooses one release. A constraint such as ~> 5.0 permits compatible-range 5.x releases; the provider lockfile records a concrete provider choice, but does not lock modules. For a Git source, a full immutable commit reference is stronger than a movable tag.

<details class="knowledge-check">
<summary>Check your understanding: What should you inspect after init -upgrade?</summary>
<p>Review the lockfile/provider change, module release notes and compatibility, then a plan for each consuming environment. Installing successfully does not prove that the upgrade is behaviorally safe.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/files/dependency-lock).

## 4. Summary & Next Steps

The provider lockfile does not lock remote module versions. Exact registry versions and immutable Git commit references make module selection repeatable; tags may be moved. Version constraints such as `~> 5.0` permit upgrades within that range. Review module/provider compatibility and release notes before upgrading. In the next lesson, we will examine **Enterprise Module Composition and Architecture Patterns**.
