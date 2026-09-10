---
title: "Live Lab: CI/CD Failure, Recovery & Postmortem"
description: "Build a locally testable Terraform quality gate, reproduce a broken change, design a safe production pipeline, and complete an actionable postmortem."
keywords:
  - Terraform CI/CD
  - GitHub Actions
  - Terraform Validate
  - Incident Postmortem
  - Pipeline Guardrails
---

# Live Lab: CI/CD Failure, Recovery & Postmortem

<div class="lab-banner"><strong>Scenario:</strong> a pull request passes review but contains an invalid Terraform reference. We will build the smallest useful quality gate, watch it fail, fix it, then analyze a more serious stale-plan incident.</div>

## 1. What a Terraform pipeline must prove

Each stage answers a different question:

| Stage | Question | Needs cloud credentials? |
| :--- | :--- | :--- |
| `fmt -check` | Is formatting consistent? | No |
| `init -backend=false` | Can providers/modules initialize without touching the backend? | Usually no |
| `validate` | Is the configuration internally valid? | No |
| Lint/security/policy | Does it meet team rules? | No for static checks |
| `plan` | What will change in this exact environment? | Usually yes |
| Approval | Is this reviewed change acceptable now? | Human/control-plane decision |
| Apply saved plan | Execute exactly what was reviewed | Yes |

`validate` does not prove permissions, quotas, policy acceptance, runtime health, or that a plan is still appropriate.

## 2. Build a local quality gate

```bash
mkdir pipeline-lab
cd pipeline-lab
```

Create `main.tf`:

```hcl
terraform { required_version = ">= 1.4.0" }

variable "environment" {
  type    = string
  default = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Choose dev, staging, or prod."
  }
}

resource "terraform_data" "release" {
  input = {
    application = "checkout"
    environment = var.environment
  }
}
```

Run the same commands CI will run:

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

## 3. Break it on purpose

Change `var.environment` inside the resource to `var.enviroment`, then run `terraform validate`.

Read the diagnostic as evidence:

1. The summary identifies an undeclared input variable.
2. The source range points to the exact expression.
3. The detail explains which declaration is missing.

Fix the spelling and rerun the gate. A useful gate is fast enough that students and developers run it before pushing.

## 4. Add the GitHub Actions workflow

Create `.github/workflows/terraform-checks.yml`:

```yaml
name: Terraform checks

on:
  pull_request:
    paths:
      - "**/*.tf"
      - ".github/workflows/terraform-checks.yml"

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.10.5"
      - run: terraform fmt -check -recursive
      - run: terraform init -backend=false
      - run: terraform validate
```

Pin actions to full commit SHAs in a hardened production repository. Version tags are kept here for readability during class.

## 5. The stale-plan incident

Imagine this timeline:

1. Pipeline A creates plan A from state serial 40.
2. Pipeline B creates and applies plan B, producing state serial 41.
3. A reviewer approves plan A without noticing that the environment changed.
4. Pipeline A tries to apply its saved plan.

State locking prevents simultaneous writes, but locking alone does not make an old decision current. Terraform will reject some stale state conditions; the delivery system should also expire plans, serialize environment deployments, and require a new plan after relevant changes.

Use GitHub Actions concurrency for one environment:

```yaml
concurrency:
  group: terraform-production
  cancel-in-progress: false
```

For a full production workflow:

- Generate a binary plan and its human-readable rendering in one trusted job.
- Store the plan as a short-lived artifact; never accept a plan uploaded from an untrusted fork.
- Bind approval to the commit SHA and environment.
- Apply the saved binary plan, not a newly calculated unreviewed plan.
- Prevent another apply to the same state while the workflow runs.
- Use short-lived OIDC credentials and minimum permissions.

## 6. Postmortem: wrong change reached production

### Impact

The production deployment used a newly calculated plan rather than the reviewed plan. A security-group rule was removed, causing seven minutes of failed health checks before rollback.

### Root cause

The apply job ran `terraform apply -auto-approve` with no saved plan argument. Approval covered an earlier text plan, not the exact actions executed.

### Contributing conditions

- Plan and apply ran in separate workflows.
- The environment changed between those workflows.
- No concurrency group serialized production changes.
- The approval UI did not display the commit SHA or plan digest.

### Recovery

1. Pause further deployments to the affected state.
2. Restore service using a reviewed corrective plan.
3. Verify application health and dependent systems.
4. Preserve plan, apply, state-backend, and cloud audit logs.
5. Resume deployments only after the unsafe path is disabled.

### Corrective actions

| Action | Owner | Verification |
| :--- | :--- | :--- |
| Apply only a saved binary plan | Platform | Job fails when plan artifact is missing |
| Bind artifact to commit SHA | Platform | SHA and digest are checked before apply |
| Add per-environment concurrency | DevOps | Two test runs cannot apply concurrently |
| Add production environment approval | Security | Approval record identifies reviewer and SHA |
| Run rollback game day | Service team | Recovery time and gaps are recorded |

“Engineer ran the wrong command” is not a root cause. A mature postmortem asks why the system allowed one command to bypass the reviewed change.

## 7. Clean up

```bash
terraform destroy -auto-approve
cd ..
```

The course endpoint is not “Terraform ran.” It is a delivery system where intent is reviewable, identity is short-lived, changes are reproducible, and recovery has been rehearsed.

