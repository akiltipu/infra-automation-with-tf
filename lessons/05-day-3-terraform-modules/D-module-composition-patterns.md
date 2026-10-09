---
title: "Enterprise Module Composition & Architecture Patterns"
description: "Architect scalable infrastructure using Flat vs Nested module composition, service wrapper patterns, and avoiding common module anti-patterns."
keywords:
  - Module Composition
  - Flat vs Nested
  - Service Wrappers
  - Golden Paths
  - Module Anti-Patterns
kind: concept
track: core
---

# Enterprise Module Composition & Architecture Patterns

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Compose modules through outputs without broad dependency coupling.</p></div>

<div class="project-connection"><strong>CourseOps · Section 05</strong><p>Apply this concept in the connected project. <a href="/lessons/day-3-terraform-modules/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-3-terraform-modules/mini-assignment">mini assignment</a>.</p></div>

As cloud systems grow, the question arises: how should multiple modules interact with each other? Let us examine the architectural patterns used by high-performing DevOps organizations.

---

## 1. Pattern 1: Flat Composition (Recommended)

In **Flat Composition**, the root module acts as a smart orchestrator. It instantiates foundational modules and wires their outputs directly into downstream consumer modules:

![Network outputs feed compute and database inputs](/images/lesson-diagrams/composition.svg)


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


## Apply the idea: wire only the required dependency

Pass module.network.vpc_id into the security module and module.network.private_subnet_ids into the database module when those outputs exist. A direct reference establishes the needed dependency. A blanket depends_on on an entire module may serialize unrelated resources and defer data-source reads.

<details class="knowledge-check">
<summary>Check your understanding: Does a flat module structure guarantee independent deployments?</summary>
<p>No. Modules in one root share a state and apply lifecycle. Separate roots can support independent delivery, but require a deliberate interface for exchanging outputs and coordinating changes.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/modules/develop/composition).

## 4. Summary & Next Steps

Module composition allows you to build sophisticated, decoupled platforms. In **Section 06: Advanced HCL Logic & Dynamic Blocks**, we will unlock advanced language features: **`count` vs `for_each`**, **Dynamic Blocks**, and **Lifecycle Meta-Arguments**.
