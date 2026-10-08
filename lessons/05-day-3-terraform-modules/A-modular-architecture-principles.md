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

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Design a module as a typed interface with explicit ownership.</p></div>

In Terraform, any directory containing `.tf` files is technically a **Module**. As architectures grow, structuring infrastructure into reusable, self-contained **Child Modules** prevents code duplication and enforces organizational standards.

---

## 1. Root Modules vs. Child Modules


| Module role | Responsibility |
| :--- | :--- |
| Root | Selects backend, providers, inputs, and child modules. |
| Child | Implements a reusable interface of variables and outputs. |


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

| Contract element | Example | Responsibility |
| :--- | :--- | :--- |
| Input | `vpc_cidr`, `environment` | Caller supplies a typed, validated value. |
| Implementation | VPC and subnet resource blocks | Module owns internal resource identities. |
| Output | `vpc_id`, `subnet_ids` | Caller consumes only the exposed interface. |



### Key Design Principles:
1. **Single Responsibility**: A module should manage a cohesive unit of infrastructure (e.g., `vpc`, `eks-cluster`, `postgres-rds`), not an entire company's infrastructure in one mega-file.
2. **Sensible Defaults with Custom Overrides**: Provide standard production defaults while allowing callers to override specific parameters.
3. **Never Hardcode Provider Blocks inside Child Modules**: Child modules should inherit providers from the root caller.

---


## Apply the idea: review a module contract

A networking module accepts CIDRs and availability-zone choices and returns subnet IDs. Consumers use those outputs rather than reaching into internal resources. Renaming an output breaks callers; changing internal resource addresses can cause replacements unless you provide migration declarations.

<details class="knowledge-check">
<summary>Check your understanding: Does each child module get its own state file?</summary>
<p>No. Child resources normally live in the root module state with module-prefixed addresses. A separate root/backend is needed for an independent state and deployment lifecycle.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/modules/develop).

## 4. Summary & Next Steps

Modular design is the backbone of scalable infrastructure code. In the next lesson, we will **build a focused AWS VPC and public-subnet module, then identify the controls needed to extend it**.
