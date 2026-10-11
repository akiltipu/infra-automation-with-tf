# Assignment 04 — Prove isolation

**Problem:** A production reviewer asks for evidence that a development change cannot silently edit production's state. Start with `starter/dev`; create a sibling `prod` root. Budget: 40 minutes. This is a local exercise, not proof of AWS IAM isolation.

Copy `assignments/04/starter` to `work/assignment-04`. Run commands from that copy:

```bash
terraform -chdir=dev init
terraform -chdir=dev apply
# Implement prod before continuing.
terraform -chdir=prod init
terraform -chdir=prod apply
terraform -chdir=prod output -raw id
terraform -chdir=dev apply -var='message=Development changed'
terraform -chdir=prod plan -detailed-exitcode
terraform -chdir=prod output -raw id
```

## Acceptance criteria

- Distinct directories contain distinct state files; outputs say `dev` and `prod` respectively.
- The production ID and message remain unchanged after the dev update; the prod plan exits 0 (2 means changes; 1 means error).
- Draw the cloud equivalent using separate backend keys **and** separate roles/accounts. Explain why keys alone do not enforce access boundaries.
- Identify a secret that must never go in committed `.tfvars`. Explain why `sensitive = true` does not remove a value from state.
- Destroy both local roots individually after recording evidence.

Submit the two configurations, sanitized comparison, and the proposed IAM/state boundaries. Reference: `reference/`; explanation: `../../instructor/04.md`.

## Graduated hints

1. Each root must initialize its own working directory.
2. An environment variable is an input channel, not a security boundary.
3. The production copy needs an explicit production environment value; changing only the folder name changes no HCL behavior.
