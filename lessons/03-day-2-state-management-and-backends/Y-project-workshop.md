---
title: "Workshop: Protect CourseOps state and recover a failed change"
description: "Migrate the existing state deliberately and recover a partial apply using evidence."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Protect CourseOps state and recover a failed change

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Migrate the existing state deliberately and recover a partial apply using evidence.</p></div>

## State is an ownership record

CourseOps state binds addresses such as `aws_instance.web` to remote object IDs. Configuration says what you want; state records what Terraform manages; the provider reads what exists. Losing state is therefore different from losing an EC2 disk, and reverting Git is different from rolling back a database.

![State incident decision tree: identify lock, partial apply, missing binding or data loss before choosing recovery.](/images/lesson-diagrams/courseops-recovery.svg)

## Bootstrap is a separate lifecycle

The S3 bucket must exist before the application backend can use it. The project has a separate `bootstrap` root with versioning, encryption, blocked public access, TLS-only access and `prevent_destroy`. Keep its local state safe. It intentionally grants no broad caller permissions: your identity needs a scoped policy for the chosen state object and lock.

Follow the README's migration steps on the **existing** `work/dev` root. Pause other writers, secure a state backup, add `backend.tf`, and initialize with `-migrate-state` and the reviewed bucket/key configuration. Confirm the same object IDs and a no-change plan afterward. `-reconfigure` changes backend configuration without performing the same migration operation.

Terraform >=1.10 supports the S3 `use_lockfile` mechanism used here. Grant Get/Put on the state and Get/Put/Delete on its `.tflock` sibling, plus scoped bucket listing. The backend authenticates separately from the AWS provider, so a provider account guard does not by itself verify backend identity.

## Rehearse recovery locally first

Assignment 03 deliberately creates a foundation and then fails a dependent precondition. The foundation remains in state. Terraform does not automatically reverse every successful action when a later action fails.

Write down what exists, what failed, and which assumption needs correction. A fresh plan after the fix should use the existing foundation. Do not delete state or replay a stale saved plan. This exercise needs no AWS account and gives you a real partial-apply event to explain.

## Choose the right response

| Evidence | Response |
| --- | --- |
| An active job owns the lock | Coordinate and wait; do not force-unlock an active writer |
| Part of an apply succeeded | Inspect state and remote status; fix the cause and plan again |
| A real object exists but its binding is missing | Verify ownership and configuration; import the correct object |
| State is corrupt or accidentally overwritten | Freeze writers and use the coordinated version-recovery runbook |
| Runtime data is gone | Use the application's backup/restore procedure |

Restoring an older state version changes Terraform's records; it does not rewind AWS. A stale snapshot can forget real changes, so reconcile identities and review a fresh plan before permitting writes. The lab's recovery runbook includes checkpoints and stop conditions.

## Guided explanation

A teammate proposes `terraform state rm` after every apply error. Explain what that command removes, what it leaves in AWS, and why the next plan could try to create duplicate resources. Then attempt the recovery assignment and keep the incident evidence concise.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 03 mini assignment](/lessons/day-2-state-management-and-backends/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>Why must you review a new plan after recovering state?</summary><p>The recovered record may predate real infrastructure changes. A fresh read and plan exposes mismatches; applying from a stale record can propose unintended creation, replacement or deletion.</p></details>

## Primary references

- [S3 backend and locking](https://developer.hashicorp.com/terraform/language/backend/s3)
- [State purpose](https://developer.hashicorp.com/terraform/language/state/purpose)
