---
title: "Workshop: Give CourseOps environments independent state"
description: "Prove dev/prod separation and distinguish naming, state selection and authorization."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Give CourseOps environments independent state

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Prove dev/prod separation and distinguish naming, state selection and authorization.</p></div>

## One module, multiple ownership boundaries

An environment is more than a variable named `environment`. The configuration chooses desired values; the backend chooses a state record; the cloud identity limits what the caller may access. All three need to agree before a change.

| Boundary | Local exercise | AWS extension |
| --- | --- | --- |
| Inputs | Explicit `dev` or `prod` value | Reviewed environment-specific values |
| State | Separate initialized root directories | Separate backend keys with scoped access |
| Authorization | Same local user; no IAM isolation | Separate accounts/roles and trust policies |
| Review | Compare IDs and plans | Approval for the correct target and commit |

## Worked example: the same address can mean different objects

The bundle includes `local/live/dev` and `local/live/prod`, both using the same reusable local module. Initialize and apply each independently. Compare their `service` and `id` outputs. The logical address can be identical while each state binds it to a different object.

```bash
terraform -chdir=local/live/dev init
terraform -chdir=local/live/dev apply
terraform -chdir=local/live/prod init
terraform -chdir=local/live/prod apply
terraform -chdir=local/live/prod plan -detailed-exitcode
```

Interpret the last exit code correctly: 0 means no changes, 2 means a plan with changes, and 1 means an error. A CI script must not treat every nonzero code as the same event.

## Before selecting a cloud target

Confirm caller identity, account guard, backend bucket/key and inputs. Do not copy dev state into staging. Initialize a new root with its own key and scoped credentials. Backend blocks cannot read normal Terraform input variables; use reviewed backend configuration at initialization.

CLI workspaces select separate states in a backend, but they are not an IAM boundary by themselves. A folder named production is equally unable to prevent a role from changing another account. Match the access model to the required separation.

## Handle secrets at their actual boundaries

An environment variable can supply a value without committing it, but the provider or state may still store it. `sensitive = true` redacts normal display; it does not encrypt or omit the value from state. Restrict state and saved-plan access and avoid secret-bearing outputs. Prefer the application's runtime secret retrieval rather than injecting credentials through this simple status-page project.

The project needs no application password. SSH private keys stay on the operator machine/agent; only the public key is an input. The inventory contains non-secret connection data but is still ignored to avoid publishing machine details.

## Guided variation and independent proof

Predict what happens if you change only the directory name, leaving `environment = "dev"` inside it. Then predict what happens if two different folders point to the same S3 key. Assignment 04 asks you to build and test two local roots and explain the stronger AWS boundaries you would add.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 04 mini assignment](/lessons/day-2-multi-environment-sdlc/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>Can two folders pointing to the same S3 key be treated as isolated environments?</summary><p>No. They share the selected state record. Distinct keys separate records, and scoped credentials are also needed to enforce who may access each environment.</p></details>

## Primary references

- [Workspace use cases](https://developer.hashicorp.com/terraform/cli/workspaces)
- [Sensitive data](https://developer.hashicorp.com/terraform/language/manage-sensitive-data)
