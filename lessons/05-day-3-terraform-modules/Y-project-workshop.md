---
title: "Workshop: Refactor CourseOps into tested modules"
description: "Preserve existing resource identities while introducing small modules with explicit contracts."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Refactor CourseOps into tested modules

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Preserve existing resource identities while introducing small modules with explicit contracts.</p></div>

## Start from the running stack

A module is a configuration interface, not a new deployment by definition. CourseOps separates networking from the web host: the network module returns the VPC and subnet IDs; the web module consumes a selected subnet and returns connection details. The root composes them and keeps the same external `web` output for Ansible.

Inputs should express decisions the caller owns. Internal implementation details should stay internal. For example, the caller chooses the VPC CIDR, subnet map and operator /32; the module computes CIDRs and creates the related routing resources.

## Refactor without recreating the project

Use the complete `checkpoints/05-modular` snapshot exactly as described in the README. Replace authored source in the same `work/dev` directory while retaining its inputs, backend, state and provider lockfile. Module source paths rely on this directory depth.

`moved.tf` maps the old root resources into the modules. A move changes the address associated with an existing object; it should not replace that object merely to reorganize files.

```hcl
moved {
  from = aws_instance.web
  to   = module.web.aws_instance.web
}
```

The project also moves the network collections. Review the whole mapping, not just the instance. Save the plan and run the supplied no-mutation verifier. Expected: address moves with **0 add, 0 change, 0 destroy**. Compare before/after IDs; stop if the plan differs.

## Test the contract at several levels

| Check | What it can establish | What remains unverified |
| --- | --- | --- |
| Format and validate | Readable syntax and configuration consistency | Correct behavior |
| Local contract test | Allowed inputs, outputs and negative cases | AWS behavior |
| Mock provider test | Planned subnet logic and configured security properties | Real IAM, quotas, AMI availability, packet flow |
| Sandbox integration | Actual resource creation and application reachability | Production-scale behavior and disaster recovery |

Terraform tests can run plans or applies. Real-provider apply tests can create billable infrastructure; the supplied AWS module tests explicitly use `mock_provider "aws"`. Provider downloads and schema loading are still needed. The provider-free service tests can run offline after Terraform itself is installed.

## Repair a real defect

Assignment 05 supplies a module that accepts an invalid port and a failing test that exposes it. Fix the input validation, keep the output contract stable, and add boundary cases. The useful learning outcome is explaining why the negative test failed, not making the output green by deleting it.

## Upgrade one layer at a time

Terraform CLI, providers and modules have different compatibility boundaries. Commit the provider dependency lockfile for runnable roots; a module version is selected in its source/version configuration, not pinned by that file. Follow `runbooks/upgrades.md`: change one layer, inspect its release notes and plan, and rehearse with representative state. Preserve move history for supported upgrade paths.

## A module move is not a second server

![A Terraform resource moves from a root address to a module address while retaining the same remote object ID.](/images/lesson-diagrams/resource-identity.svg)

The original EC2 has an AWS ID. After extraction, its Terraform address gains a module prefix. Without a move, Terraform can interpret the new address as a different binding. With the correct move, the existing object is associated with the new address.

**Worked review:** match the old address, new address and remote ID; then inspect the planned actions. A zero-mutation plan alone does not tell you whether you mapped the correct business object. For collections, stable keys such as `"a"` and `"b"` remain part of that mapping. Keep migration blocks for supported upgrade paths.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 05 mini assignment](/lessons/day-3-terraform-modules/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>Why is a passing mock test insufficient to approve an AWS rollout?</summary><p>Mocks substitute provider responses. They can check configuration and contracts but cannot establish real permissions, resource availability or network and application behavior.</p></details>

## Primary references

- [Module refactoring](https://developer.hashicorp.com/terraform/language/modules/develop/refactoring)
- [Provider mocks](https://developer.hashicorp.com/terraform/language/tests/mocking)
