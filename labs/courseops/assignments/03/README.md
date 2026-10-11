# Assignment 03 — Recover a partial apply

**Problem:** A release failed after its foundation was created. Recover without deleting state or recreating that foundation. This intentionally failing exercise uses only local `terraform_data` resources. Budget: 40 minutes.

Copy `assignments/03/starter` to `work/assignment-03` from the project root; enter the copy.

```bash
terraform init
terraform plan -out=first.tfplan
terraform apply first.tfplan
# Expected: foundation created, then the release precondition fails.
terraform state list
terraform state show terraform_data.foundation
```

The readiness check depends on a value unknown until the first apply. A successful plan therefore does not guarantee every apply-time check passes.

## Your task and acceptance criteria

1. Explain the failed condition, the one existing state binding, and why Terraform did not roll it back.
2. Record the foundation ID privately. Correct readiness through an input, then create and review a **new** saved plan.
3. The recovery plan must update the foundation and create the release. Do not use `state rm`, `-target`, manual state edits, or the stale first plan.
4. Apply the reviewed recovery plan. Confirm that the foundation ID is unchanged and the next plan with the same input has no changes.
5. Contrast this with a missing state binding and a lost database disk. Use `runbooks/recovery.md` to choose a different response for each.
6. Run `terraform destroy -var=readiness=ready` in this disposable local directory.

Submit a short incident report: symptom, evidence, diagnosis, action, verification, prevention. Keep state and plan files private.

## Graduated hints

1. Failure is not an all-or-nothing transaction.
2. Read the variable default and the dependent precondition together.
3. Try `terraform plan -var=readiness=ready -out=recovery.tfplan`, review it, and then apply that file.

Reference reasoning and expected resource actions: `../../instructor/03.md`.
