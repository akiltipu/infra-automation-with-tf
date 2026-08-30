---
title: "Modular Architecture Principles & Standard Structure"
description: "Learn the foundational principles of Terraform modules, understanding root vs child modules, standard file conventions, encapsulation, and contract design."
keywords:
  - Terraform Modules
  - Root Module
  - Child Module
  - Module Contract
  - Encapsulation
---

# Modular Architecture Principles & Standard Structure

In Terraform, any directory containing `.tf` files is technically a **Module**. As architectures grow, structuring infrastructure into reusable, self-contained **Child Modules** prevents code duplication and enforces organizational standards.

---

## 1. Root Modules vs. Child Modules

```
┌─────────────────────────────────────────────────────────────┐
│                    ROOT MODULE                              │
│   (The working directory where you execute terraform apply) │
│                                                             │
│   module "vpc" {                                            │
│     source = "./modules/vpc"  ──►  CHILD MODULE             │
│   }                                                         │
│   module "rds" {                                            │
│     source = "./modules/rds"  ──►  CHILD MODULE             │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
```

- **Root Module**: The top-level directory where `terraform init`, `plan`, and `apply` are executed.
- **Child Module**: A reusable package instantiated by another module via a `module` block.

---

## 2. The Standard Module Anatomy

The HashiCorp standard module convention consists of three core files and documentation:

```
modules/aws-vpc/
├── README.md          # Usage examples, inputs/outputs documentation
├── main.tf            # Core resource declarations
├── variables.tf       # Parameter inputs with types, defaults & validation
├── outputs.tf         # Exposed return values (IDs, ARNs, endpoints)
└── versions.tf        # Minimum Terraform & provider version constraints
```

---

## 3. Designing a Clean Module Contract

Think of a Terraform module like a function in software engineering:

```
    ┌──────────────────────┐
    │  INPUTS              │  (variables.tf)
    │  - vpc_cidr          │
    │  - environment       │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  MODULE BLACK BOX    │  (main.tf)
    │  Creates VPC, Subnet,│
    │  Route Tables, etc.  │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  OUTPUTS             │  (outputs.tf)
    │  - vpc_id            │
    │  - subnet_ids        │
    └──────────────────────┘
```

### Key Design Principles:
1. **Single Responsibility**: A module should manage a cohesive unit of infrastructure (e.g., `vpc`, `eks-cluster`, `postgres-rds`), not an entire company's infrastructure in one mega-file.
2. **Sensible Defaults with Custom Overrides**: Provide standard production defaults while allowing callers to override specific parameters.
3. **Never Hardcode Provider Blocks inside Child Modules**: Child modules should inherit providers from the root caller.

---

## 4. Summary & Next Steps

Modular design is the backbone of scalable infrastructure code. In the next lesson, we will **build a complete, production-grade AWS VPC, Subnet, and Security Group module from scratch**.
