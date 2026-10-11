---
title: "Assignment 06 — Keep identity during a refactor"
description: "Solve an independent CourseOps problem with acceptance criteria, hints and instructor feedback."
keywords: [CourseOps, assignment, assessment]
kind: assignment
track: core
---

# Assignment 06 — Keep identity during a refactor

<div class="lesson-goal"><strong>Independent practice · 40 minutes</strong><p>Demonstrate the section outcome with evidence before comparing the reference solution.</p></div>

[Download the lab bundle](/downloads/courseops-labs.zip) and open `courseops/assignments/06`. In a repository checkout the same files live under `labs/courseops`. Paths below refer to that bundle.


**Problem:** The middle service in a positional list is being retired, but the other services must retain their identities. First migrate addresses; then remove the service in a separate change. Budget: 40 minutes.

Copy `starter` to `work/assignment-06`, initialize, apply, and record `terraform output -json ids` privately. Do not run the reference in a fresh directory: the exercise needs the original state.

## Acceptance criteria

1. Replace `count` with a stable `for_each` key for each service; include three explicit `moved` blocks.
2. Save a refactor plan. It must report **0 add, 0 change, 0 destroy**, with address moves. IDs must be unchanged after apply.
3. For a machine check, run `terraform show -json refactor.tfplan | python3 ../../scripts/verify-plan.py` from `work/assignment-06`.
4. In a second reviewed plan, remove `billing` from the default set. Exactly one resource is destroyed; `status` and `search` retain IDs. Apply only after checking that evidence.
5. Explain why simply changing a list can replace later `count` instances when `triggers_replace` depends on the list value.
6. Destroy the remaining local resources.

Submit the two plan summaries, migration HCL, and explanation. Keep raw plan/state private. Reference: `reference/main.tf`; notes: `../../instructor/06.md`.

## Graduated hints

1. Keys should describe a stable identity, not a position.
2. Existing addresses are `[0]`, `[1]`, and `[2]`.
3. Map each old address to its original service name before removing any element.

## Feedback and reflection

[Browse starter files](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/assignments/06) · [Instructor solution — after your attempt](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/06.md) · [Assessment rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md)

<details class="knowledge-check"><summary>What should I explain before marking this assignment complete?</summary><p>State your prediction, show the evidence that supports or contradicts it, explain one limit of your checks, and record cleanup. Correct an error and retry if an acceptance criterion is unmet.</p></details>
