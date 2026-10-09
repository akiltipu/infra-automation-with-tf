---
title: "Assignment 03 — Recover a partial apply"
description: "Solve an independent CourseOps problem with acceptance criteria, hints and instructor feedback."
keywords: [CourseOps, assignment, assessment]
kind: assignment
track: core
---

# Assignment 03 — Recover a partial apply

<div class="lesson-goal"><strong>Independent practice · 40 minutes</strong><p>Demonstrate the section outcome with evidence before comparing the reference solution.</p></div>

[Download the lab bundle](/downloads/courseops-labs.zip) and open `courseops/assignments/03`. In a repository checkout the same files live under `labs/courseops`. Paths below refer to that bundle.


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

<details class="assignment-hint"><summary>Hint 1</summary><p>Failure is not an all-or-nothing transaction.</p></details>
<details class="assignment-hint"><summary>Hint 2</summary><p>Read the variable default and the dependent precondition together.</p></details>
<details class="assignment-hint"><summary>Hint 3</summary><p>Try <code>terraform plan -var=readiness=ready -out=recovery.tfplan</code>, review it, and then apply that file.</p></details>

Reference reasoning and expected resource actions: `../../instructor/03.md`.

## Feedback and reflection

[Browse starter files](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/assignments/03) · [Instructor solution — after your attempt](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/03.md) · [Assessment rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md)

<details class="knowledge-check"><summary>What should I explain before marking this assignment complete?</summary><p>State your prediction, show the evidence that supports or contradicts it, explain one limit of your checks, and record cleanup. Correct an error and retry if an acceptance criterion is unmet.</p></details>

## Return to this idea later

Tomorrow, explain the main decision without looking at the reference. About a week later, change one input or requirement and predict the result. Record what you needed to look up in your learning log; the aim is to identify your next practice step.
