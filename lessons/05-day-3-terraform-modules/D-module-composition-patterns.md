---
title: "Enterprise Module Composition & Architecture Patterns"
description: "Architect scalable infrastructure using Flat vs Nested module composition, service wrapper patterns, and avoiding common module anti-patterns."
keywords:
  - Module Composition
  - Flat vs Nested
  - Service Wrappers
  - Golden Paths
  - Module Anti-Patterns
---

# Enterprise Module Composition & Architecture Patterns

As cloud systems grow, the question arises: how should multiple modules interact with each other? Let us examine the architectural patterns used by high-performing DevOps organizations.

---

## 1. Pattern 1: Flat Composition (Recommended)

In **Flat Composition**, the root module acts as a smart orchestrator. It instantiates foundational modules and wires their outputs directly into downstream consumer modules:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              ROOT MODULE                               │
│                                                                        │
│   ┌────────────────────┐                   ┌───────────────────────┐   │
│   │ module "network"   │                   │ module "compute"      │   │
│   │                    ├─► vpc_id, subnets ┼─►                     │   │
│   │ (AWS VPC, Subnets) │                   │ (EC2, Auto Scaling)   │   │
│   └────────────────────┘                   └───────────────────────┘   │
│             │                                          │               │
│             │                                          ▼               │
│             │                              ┌───────────────────────┐   │
│             │                              │ module "database"     │   │
│             └──────────► subnet_ids ───────┼─►                     │   │
│                                            │ (PostgreSQL RDS)      │   │
│                                            └───────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Why Flat Composition Wins:
- **Maximum Reusability**: The networking module has zero knowledge of the database or compute modules.
- **Easy Testing**: Each module can be unit-tested in complete isolation.
- **Clear Dependency Flow**: The root module explicitly shows how data flows across components.

---

## 2. Pattern 2: Service Wrapper ("Golden Path") Pattern

Platform engineering teams often create **Service Wrappers** that bundle networking, security groups, IAM roles, and compute into an opinionated, compliant service for application teams:

```hcl
# modules/standard-web-service/main.tf (Platform Engineering Golden Path)

module "security_group" {
  source = "../aws-sg"
  # Injected corporate compliance rules
}

module "app_instances" {
  source = "../aws-ec2-cluster"
  # Enforces IMDSv2, EBS encryption, standard logging agent
}
```

Application engineers simply invoke the service wrapper:
```hcl
module "payments_api" {
  source       = "git::https://github.com/company/golden-paths.git//web-service?ref=v1.0.0"
  service_name = "payments"
  tier         = "production"
}
```

---

## 3. Module Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correction |
| :--- | :--- | :--- |
| **Monolithic "Kitchen Sink" Module** | Putting VPC, RDS, Redis, and EKS in one module makes small changes risky. | Decompose into independent, focused modules. |
| **Deep Module Nesting (4+ Levels)** | Passing variables down 4 layers creates debugging nightmares. | Keep nesting shallow (maximum 1–2 levels). |
| **Hardcoding Providers in Child Modules** | Breaks multi-region and multi-account reusability. | Inherit providers from the root module caller. |

---

## 4. Summary & Next Steps

Module composition allows you to build sophisticated, decoupled platforms. In **Section 06: Advanced HCL Logic & Dynamic Blocks**, we will unlock advanced language features: **`count` vs `for_each`**, **Dynamic Blocks**, and **Lifecycle Meta-Arguments**.
