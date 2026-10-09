---
title: "Workshop: Review a release and demonstrate the capstone"
description: "Connect tests, plan policy, approval and application health to concrete release evidence."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Review a release and demonstrate the capstone

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Connect tests, plan policy, approval and application health to concrete release evidence.</p></div>

## A pipeline is a sequence of trust decisions

Formatting and tests catch some defects before planning. A plan shows proposed resource actions for a specific configuration and state. Policy can reject selected actions; a reviewer then judges intent and risk. Apply must use the reviewed saved plan, followed by application verification.

| Stage | Required evidence | Stop condition |
| --- | --- | --- |
| Source and tests | Known commit, readable diff, meaningful tests | Unknown source or failing check |
| Plan | Correct account/backend, saved plan, selected non-secret summary | Unexpected replacement or wrong target |
| Policy | Explicit allow/block results | Missing ownership or unapproved destruction |
| Approval | Reviewer and target environment | No approval for the actual plan |
| Apply | Same saved plan and source context | Stale plan or changed execution context |
| Verify | HTTP health, state and cleanup/rollback decision | Infrastructure success but unhealthy service |

## Run a gate before designing its orchestration

The bundle's `delivery/check-policy.py` reads Terraform plan JSON and rejects deletion/replacement and missing, empty or unknown instance ownership tags. Its fixtures contain no real account data. Run the tests, predict each decision, and then check your predictions.

```bash
python3 -m unittest discover -s delivery -p 'test_*.py'
python3 delivery/check-policy.py < delivery/fixtures/allowed.json
```

This small gate teaches visible decision logic. The course's OPA lesson extends that idea to a dedicated policy language. Neither tool is a complete security assessment. A rule that forbids all deletion also needs a separate, reviewed retirement procedure; silently disabling the rule is not that procedure.

## Understand the workflow boundary

The repository's actual PR workflow validates the site and cloud-free labs without AWS credentials. The lab's delivery guide explains how to extend checks to a scoped OIDC plan/apply workflow in a restricted training repository. Do not run untrusted pull-request code with cloud-write credentials, and do not publish saved plans from this public course repository: plans may include sensitive values.

Use a fixed commit, scoped identities, limited artifact access/retention, concurrency for the target state, and an environment approval. If state changes after planning, create and review a new plan. An apply failure is an incident to diagnose, not a reason to replay blindly. Application rollback and Terraform configuration rollback may require different steps.

## Assignment first, capstone second

Assignment 08 asks you to predict gate decisions, add meaningful policy fixtures, and explain a release boundary. Then complete the separate capstone in the lab bundle. Its rubric gives 100 points across reproducibility, isolation, tests/refactoring, configuration, delivery/recovery and cleanup.

A local submission must label its limits; an AWS submission must show real health and identity evidence. Another learner should reproduce your result using authored code and concise sanitized evidence. A copied architecture diagram or a green mock test alone is not a completed cloud deployment.

## Retrieval and transfer

Without your notes, explain why Terraform state is not an application backup, why `moved` can avoid replacement, and why approval must refer to the plan actually applied. Then choose one stretch objective and define its acceptance test before adding infrastructure.

## Separate three kinds of confidence

| Evidence | What it establishes | What it leaves open |
| --- | --- | --- |
| Passing mock tests | The tested configuration contract | Real cloud API behavior |
| Approved saved plan | A reviewer accepted specific proposed actions | Application health after those actions |
| HTTP health check | That endpoint responds under this check | Data correctness and recovery under every failure |

**Worked incident:** Terraform succeeds, but `/healthz` fails. Reapplying the same infrastructure blindly is unlikely to diagnose a bad Nginx configuration. Inspect the configuration and service boundary, preserve evidence, and decide whether to repair or roll back the application change.

Before the capstone, explain a change that each check would miss. This makes the final demonstration a defense of your evidence rather than a collection of green screenshots.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 08 mini assignment](/lessons/day-4-enterprise-cicd-and-policy-as-code/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>What is wrong with approving one plan and running terraform apply without the saved plan file?</summary><p>A plain apply generates a new plan. The reviewer has not necessarily approved that new set of actions; apply the reviewed saved plan or generate a new plan and repeat review.</p></details>

## Primary references

- [Saved plans](https://developer.hashicorp.com/terraform/cli/commands/plan)
- [GitHub OIDC with AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
