---
title: "Course Capstone, Cost Optimization & Production Checklist"
description: "Review the full 4-day course capstone architecture, calculate cloud costs using Infracost, and evaluate your infrastructure against the enterprise production readiness scorecard."
keywords:
  - Course Capstone
  - Production Checklist
  - Infracost
  - FinOps
  - Cloud Readiness
  - Course Conclusion
kind: concept
track: core
---

# Course Capstone, Cost Optimization & Production Checklist

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Demonstrate production readiness with evidence rather than checkmarks.</p></div>

<div class="project-connection"><strong>CourseOps · Section 08</strong><p>Apply this concept in the connected project. <a href="/lessons/day-4-enterprise-cicd-and-policy-as-code/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-4-enterprise-cicd-and-policy-as-code/mini-assignment">mini assignment</a>.</p></div>

Congratulations on completing the 4-day **Infrastructure Automation with Terraform & Ansible** curriculum! Let us synthesize everything you have built into a unified production capstone and review the **Enterprise Production Readiness Scorecard**.

---

## 1. The Capstone Architecture Overview

This is the target design to build and demonstrate. TLS, private networking, KMS, and all delivery gates are capstone extensions; the earlier single-host HTTP lab does not implement them.


| Layer | Capstone evidence |
| :--- | :--- |
| Delivery | Scoped OIDC, reviewed plan, approval, cost and policy gates. |
| Provisioning | Network, compute, protected state, recovery procedure. |
| Configuration | Scoped inventory, verified SSH, TLS, repeatable playbook. |


---

## 2. FinOps & Cost Optimization with Infracost

Before merging infrastructure pull requests, evaluate cloud cost implications using **Infracost**:

```bash
# Install and run Infracost
brew install infracost
infracost breakdown --path .
```

### Illustrative Infracost Output:

These are example numbers, not current pricing or a quote. Run an authenticated Infracost estimate for your region and usage; include public IPv4, traffic, storage, and idle resources. A successful deployment is not evidence that any checklist item below is complete.
```
Project: production-workload

Name                                                Monthly Qty  Unit         Monthly Cost

aws_instance.web_cluster[0]
├─ Instance usage (Linux, on-demand, t3.medium)             730  hours              $30.37
└─ Root volume (gp3)                                         50  GB                  $4.00

aws_nat_gateway.nat_gw[0]
├─ NAT gateway usage                                        730  hours              $32.85
└─ Data processed                                           100  GB                  $4.50

OVERALL TOTAL                                                                       $71.72
```

---

## 3. The Enterprise Production Readiness Scorecard

Use this 15-point checklist before deploying any Terraform & Ansible workload to production:

| Category | Requirement | Status |
| :--- | :--- | :--- |
| **State & Security** | Remote backend in S3 with KMS encryption and versioning enabled | [ ] |
| **State & Security** | S3 native state locking enabled with `use_lockfile = true` | [ ] |
| **State & Security** | `.gitignore` excludes `*.tfstate`, `*.tfvars`, and `.terraform/` | [ ] |
| **Architecture** | Directory-based environment separation for Dev, Staging, and Production | [ ] |
| **Architecture** | Reusable child modules adhere to single responsibility | [ ] |
| **Architecture** | All external module sources pin exact Git tags or semantic versions | [ ] |
| **Code Quality** | `for_each` used for resource collections (avoiding `count` index shift) | [ ] |
| **Code Quality** | Input variables include explicit types, descriptions, and validation blocks | [ ] |
| **Lifecycle** | Production stateful databases protected with `prevent_destroy = true` | [ ] |
| **Lifecycle** | Replacement overlap, health checks, and traffic cutover tested | [ ] |
| **Configuration** | Ansible playbooks adhere to idempotency (`changed: 0` on repeat runs) | [ ] |
| **Configuration** | Host inventories dynamically generated or queried via AWS EC2 plugin | [ ] |
| **CI/CD** | GitHub Actions / GitLab CI uses passwordless AWS OIDC authentication | [ ] |
| **Compliance** | Automated linting (`tflint`) and security scanning (`Trivy`/`tfsec`) | [ ] |
| **FinOps** | Pull requests include Infracost budget impact reports | [ ] |

---


## Apply the idea: turn the checklist into a review

For each unchecked item, attach evidence and an owner: backend encryption configuration, a blocked concurrent run, a restore drill result, an approval record, or a scoped IAM denial. Estimate idle and usage-driven costs before deploying. Mark an item complete only after its expected behavior is demonstrated.

<details class="knowledge-check">
<summary>Check your understanding: Can restoring Terraform state restore deleted application data?</summary>
<p>No. State records infrastructure bindings. Database backups, object versions, replication, restore procedures, and application health checks must establish data recovery separately.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/backend/s3).

## 4. Course Summary: Your 4-Day Journey

- **Day 1: Terraform Foundations, Architecture & Core Workflow**: Practiced IaC fundamentals, why Terraform exists, internal engine mechanics, cross-platform installation, HCL block anatomy, and full CLI lifecycle.
- **Day 2: State Management & Multi-Environment Architecture**: Built S3 native-locking remote backends, state disaster recovery (`state mv`, `refresh-only`), brownfield imports (`import {}`), and multi-account topologies.
- **Day 3: Reusable Modules & Advanced HCL Expressions**: Created reusable VPC teaching modules, versioned registries, `count` vs `for_each`, dynamic blocks, and lifecycle rules.
- **Day 4: Ansible Integration, Enterprise CI/CD & Policy as Code**: Integrated Ansible configuration management, built hands-on orchestration pipelines, deployed GitHub Actions with OIDC, and enforced shift-left security.

*You are now fully equipped to design, build, and orchestrate enterprise-grade cloud automation!*


## CourseOps assessment and reference implementation

Use the [CourseOps capstone brief and 100-point rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/CAPSTONE.md) for the connected project. Submit reproducible non-secret code, selected evidence, a recovery explanation and cleanup records. Complete the [section assignment](/lessons/day-4-enterprise-cicd-and-policy-as-code/mini-assignment) before the final demonstration. The [instructor guide](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md) includes pacing, feedback and local/cloud grading distinctions.
