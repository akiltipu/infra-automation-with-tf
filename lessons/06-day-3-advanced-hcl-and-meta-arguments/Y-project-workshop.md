---
title: "Workshop: Make changes without losing resource identity"
description: "Use stable keys, review replacements, and reason about private-network extensions."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Make changes without losing resource identity

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Use stable keys, review replacements, and reason about private-network extensions.</p></div>

## Identity is part of the interface

CourseOps subnet pairs use `for_each` keys such as `a` and `b`. Their names should remain stable when values change. A positional `count` index describes location in a list, which is not always the identity you want to preserve.

Assignment 06 uses local service objects and `triggers_replace` to make the consequences observable. First record the IDs, then migrate each count address to its named key with `moved` blocks. Apply that zero-mutation refactor. Only then retire the middle service in a separate change. Separating those decisions makes the plan easier to review.

## Read the plan as a change contract

`~` means update; `-/+` or `+/-` indicates replacement. A replacement may interrupt service even if the new object has the same name. `create_before_destroy` changes ordering where the provider permits it; it does not guarantee capacity, unique-name compatibility, traffic switching or health.

`prevent_destroy` blocks a planned destruction when the lifecycle rule is present in configuration. Removing the entire resource block removes that rule too. `ignore_changes` delegates selected fields and can hide drift; it is not a general cure for a noisy plan.

## Guided private-network design

The core creates private subnets but puts the one teaching host in a public subnet. Before moving it, identify two separate needs: how the host reaches required services and how the operator reaches the host.

| Option | What it solves | What it does not solve |
| --- | --- | --- |
| Per-AZ NAT gateway | Outbound IPv4 access for package downloads | Inbound SSH or application ingress |
| S3 gateway endpoint | Private route to S3 in the region | Ubuntu apt repositories or arbitrary internet traffic |
| Baked image and approved repositories | Reduces configuration-time external downloads | Operator access and all future updates |
| VPN, managed session access or controlled bastion | A chosen operator access path | Application ingress and package egress by itself |

The network module has optional NAT and S3 gateway endpoint switches. NAT defaults off and incurs charges when enabled; the module creates one per subnet pair to keep each private route with its pair. Review EIP/NAT resource actions and costs before enabling it. A working private deployment also needs an explicitly designed operator path and any associated IAM/endpoints.

## Avoid an accidental second project

Keep the core web module on its public-subnet path for the four-day course. A private-host extension needs deliberate changes to public-IP behavior, inventory/connection method, egress and application ingress. Simply passing a private subnet ID to the existing public-host module is not the complete solution.

Finish the stable-address assignment, then use the upgrade guide to propose one controlled extension, its acceptance check and its cleanup plan.

## Predict a list edit before applying it

With `count`, `status`, `billing`, `search` occupy indices 0, 1 and 2. Removing `billing` shifts `search` into index 1. If a replacement-triggering value depends on the list item, the old billing object can be replaced as search and the old index 2 can be destroyed.

With `for_each`, the names are addresses: removing `"billing"` leaves `"status"` and `"search"` stable. Moving existing bindings comes first; selecting `for_each` in an empty directory does not demonstrate migration.

**Transfer:** would a mutable display name be a good key? Usually not if renaming the display should preserve the object. Prefer a durable identifier and model a display name as a value. Review any deliberate key rename with an explicit move.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 06 mini assignment](/lessons/day-3-advanced-hcl-and-meta-arguments/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>Does a NAT gateway let an operator initiate SSH into a private instance?</summary><p>No. It provides outbound connectivity and return traffic for connections initiated behind it. The operator needs a separately designed access path.</p></details>

## Primary references

- [Lifecycle rules](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle)
- [NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
