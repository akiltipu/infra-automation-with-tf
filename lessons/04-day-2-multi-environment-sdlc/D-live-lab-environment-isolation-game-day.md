---
title: "Live Lab: Environment Isolation Game Day"
description: "Build isolated dev and production state, simulate an operator mistake, recover safely, and write a practical incident postmortem."
keywords:
  - Terraform Environments
  - State Isolation
  - Incident Game Day
  - Terraform Postmortem
  - Live Lab
---

# Live Lab: Environment Isolation Game Day

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Prove isolation and record a useful incident finding.</p></div>

<div class="lab-banner"><strong>Scenario:</strong> two environments use the same module. A rushed operator runs a command from the wrong directory. We will add guardrails, recreate the mistake safely with local-only resources, and turn it into a blameless postmortem.</div>

This lab requires Terraform 1.4 or later and no cloud credentials.

## 1. The production question

An environment is not just a variable named `environment`. Strong isolation has three parts:

| Boundary | Dev and production should have... | Why |
| :--- | :--- | :--- |
| State | Different state keys or backends | A dev command cannot mutate production bindings |
| Credentials | Different roles/accounts | The wrong configuration still lacks permission |
| Delivery | Different approval rules | Production changes receive independent review |

Changing only `environment = "prod"` does not create an isolation boundary.

## 2. Build one reusable module

Create this structure:

```text
environment-game-day/
├── modules/service/main.tf
└── live/
    ├── dev/main.tf
    └── prod/main.tf
```

```bash
mkdir -p environment-game-day/modules/service environment-game-day/live/dev environment-game-day/live/prod
cd environment-game-day
```

Create `modules/service/main.tf`:

```hcl
variable "environment" {
  type = string

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be dev or prod."
  }
}

resource "terraform_data" "service" {
  input = {
    name        = "checkout-api"
    environment = var.environment
  }
}

output "service" {
  value = terraform_data.service.output
}
```

Create `live/dev/main.tf`:

```hcl
terraform { required_version = ">= 1.4.0" }

module "service" {
  source      = "../../modules/service"
  environment = "dev"
}

output "service" { value = module.service.service }
```

Create `live/prod/main.tf` with the same content, changing only `"dev"` to `"prod"`.

## 3. Apply and prove the states are separate

```bash
terraform -chdir=live/dev init
terraform -chdir=live/dev apply -auto-approve
terraform -chdir=live/prod init
terraform -chdir=live/prod apply -auto-approve

terraform -chdir=live/dev output
terraform -chdir=live/prod output
```

Both directories contain a resource at the same address:

```bash
terraform -chdir=live/dev state list
terraform -chdir=live/prod state list
```

The addresses match, but the state files and object IDs do not. The full identity is effectively **backend + workspace + resource address**, not the address alone.

## 4. Simulate the incident

Ask the class to predict what this command targets:

```bash
terraform -chdir=live/prod plan -destroy
```

Nothing is deleted because this is only a plan. The lesson is that the directory selected the state before Terraform considered the word `prod` inside the configuration.

Now add a safety variable to `live/prod/main.tf`:

```hcl
variable "confirm_production" {
  type      = bool
  default   = false
  nullable  = false
}

resource "terraform_data" "production_guard" {
  lifecycle {
    precondition {
      condition     = var.confirm_production
      error_message = "Production requires -var='confirm_production=true'."
    }
  }
}
```

Run:

```bash
terraform -chdir=live/prod plan
terraform -chdir=live/prod plan -var='confirm_production=true'
```

This precondition blocks this normal plan when confirmation is absent. It is not a destroy guard: destroy planning does not evaluate resource preconditions. It is not a security boundary. IAM and pipeline approvals must enforce the real boundary.

## 5. Recover and clean up

Because we stopped at `plan -destroy`, recovery is simply to reject the plan. If an apply had started against real infrastructure:

1. Stop initiating additional writes.
2. Preserve the CI logs, plan artifact, state version, and cloud audit events.
3. Determine which operations completed; do not assume the apply was atomic.
4. Restore state only when the state itself is corrupt. If real objects were deleted, re-apply reviewed configuration instead.
5. Validate application data recovery separately from infrastructure recreation.

Clean up the local lab:

```bash
terraform -chdir=live/dev destroy -auto-approve
terraform -chdir=live/prod destroy -auto-approve -var='confirm_production=true'
cd ..
```

## 6. Complete postmortem

### Incident summary

An operator prepared a destroy plan while their terminal targeted the production root module. The plan was detected before apply, so customer impact was avoided.

### Timeline

| Time | Event |
| :--- | :--- |
| 10:02 | Operator intended to reset dev |
| 10:03 | Shell history/autocomplete selected `live/prod` |
| 10:04 | Plan showed production objects marked for destruction |
| 10:05 | Operator stopped and notified the team |

### Root cause

The workflow relied on the operator's current directory and attention as the primary environment control.

### Contributing factors

- Dev and production commands looked nearly identical.
- The shell prompt did not display the target account/environment.
- Production planning was possible from a general-purpose role.
- There was no required CI approval boundary.

### What worked

- A saved plan was reviewed before apply.
- No automatic `-auto-approve` path existed for production.
- The operator escalated immediately.

### Corrective actions

| Action | Type | Evidence of completion |
| :--- | :--- | :--- |
| Run production only in CI with OIDC | Prevent | Local role cannot assume the production deploy role |
| Require environment approval | Prevent | Two-person approval recorded in pipeline logs |
| Show account ID in pre-plan output | Detect | CI log prints and verifies the expected account |
| Enable backend versioning | Recover | A prior state version can be retrieved in a drill |
| Run this game day quarterly | Learn | Drill date and findings are documented |

The postmortem is complete only when the actions have owners, due dates, and verification—not when the document is published.

## Apply the idea: collect evidence from both roots

Before the simulated mistake, record each root path, state address, and terraform_data object ID. After the destroy plan, verify the dev output remains unchanged. Identical resource addresses are expected across independent states; identical remote IDs would need investigation.

<details class="knowledge-check">
<summary>Check your understanding: Will the confirmation precondition prevent plan -destroy?</summary>
<p>No. It is a teaching check for normal planning, not a destroy authorization control. Restrict production roles and require trusted deployment approval. Never test a destructive guard against real production.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/expressions/custom-conditions).
