---
title: "Assignment 05 — Repair a module contract"
description: "Solve an independent CourseOps problem with acceptance criteria, hints and instructor feedback."
keywords: [CourseOps, assignment, assessment]
kind: assignment
track: core
---

# Assignment 05 — Repair a module contract

<div class="lesson-goal"><strong>Independent practice · 40 minutes</strong><p>Demonstrate the section outcome with evidence before comparing the reference solution.</p></div>

[Download the lab bundle](/downloads/courseops-labs.zip) and open `courseops/assignments/05`. In a repository checkout the same files live under `labs/courseops`. Paths below refer to that bundle.


**Problem:** A module accepts an impossible TCP port. Its consumer must learn about the error before infrastructure is changed. Copy `starter` to `work/assignment-05`. Budget: 40 minutes.

```bash
terraform init
terraform test
# Expect the negative port test to fail before your repair.
```

## Acceptance criteria

- Fix the module, not the existing failing test. All supplied tests then pass.
- Add a test rejecting a fractional port, and a positive test accepting port 65535.
- Keep the existing environment and output contract stable.
- Explain what `command = plan`, `command = apply`, and `expect_failures` verify.
- In the AWS project, run the mock tests in `modules/network` and `modules/web`. State one thing a mock cannot verify (for example IAM permission or an actual route).

The local test uses the built-in provider and cleans its own test state. Read cleanup warnings if a test is interrupted. Submit HCL, tests, and the before/after result; do not submit generated state.

## Graduated hints

1. Type `number` accepts fractions.
2. Reject invalid input at `var.port`, which is the address listed in `expect_failures`.
3. Combine range checks with `floor(var.port) == var.port`.

Compare `reference/` after the attempt. Instructor notes: `../../instructor/05.md`.

## Feedback and reflection

[Browse starter files](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/assignments/05) · [Instructor solution — after your attempt](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/05.md) · [Assessment rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md)

<details class="knowledge-check"><summary>What should I explain before marking this assignment complete?</summary><p>State your prediction, show the evidence that supports or contradicts it, explain one limit of your checks, and record cleanup. Correct an error and retry if an acceptance criterion is unmet.</p></details>
