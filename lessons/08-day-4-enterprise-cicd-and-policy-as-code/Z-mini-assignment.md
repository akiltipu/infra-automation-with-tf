---
title: "Assignment 08 — Be the release reviewer"
description: "Solve an independent CourseOps problem with acceptance criteria, hints and instructor feedback."
keywords: [CourseOps, assignment, assessment]
kind: assignment
track: core
---

# Assignment 08 — Be the release reviewer

<div class="lesson-goal"><strong>Independent practice · 40 minutes</strong><p>Demonstrate the section outcome with evidence before comparing the reference solution.</p></div>

[Download the lab bundle](/downloads/courseops-labs.zip) and open `courseops/assignments/08`. In a repository checkout the same files live under `labs/courseops`. Paths below refer to that bundle.


**Problem:** A pipeline passed formatting checks but proposed a replacement and an instance with no accountable owner. Build a release decision using plan evidence, then defend it. Budget: 40 minutes before the capstone.

From the project root:

```bash
python3 -m unittest discover -s delivery -p 'test_*.py'
python3 delivery/check-policy.py < delivery/fixtures/allowed.json
python3 delivery/check-policy.py < delivery/fixtures/replace.json
# Last command must exit 1, which means the gate blocked it.
```

## Acceptance criteria

1. Before running the script, predict allow/block for all five fixtures and explain each result.
2. Add a fixture for an update with an empty `Environment`, and add a test that fails if it is allowed.
3. Add a fixture for an unrelated, nondestructive `terraform_data` change and test that it is allowed.
4. Trace a production release from commit to plan to policy to approval to application of the **same saved plan**, identifying the cloud identity at each stage.
5. Explain why a passing gate does not prove an application is healthy, and why a policy exception needs a specific reviewer and scope.
6. Complete `CAPSTONE.md` using the cloud or clearly labeled local track. The capstone is a separate project assessment; it is not expected to fit into this 40-minute assignment.

Submit the prediction table, fixtures/tests, and a release checklist. The simple Python gate makes the decision logic visible; the policy lesson introduces OPA for broader reusable policy. Neither is a complete security scanner.

## Graduated hints

1. Replacements include both `delete` and `create` actions; ordering can vary.
2. Missing, empty, and unknown ownership values should fail closed.
3. No-op refactoring uses the stricter `scripts/verify-plan.py` gate; ordinary changes use a different policy.

Instructor explanation and capstone feedback: `../../instructor/08.md`.

## Feedback and reflection

[Browse starter files](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/assignments/08) · [Instructor solution — after your attempt](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/08.md) · [Assessment rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md)

<details class="knowledge-check"><summary>What should I explain before marking this assignment complete?</summary><p>State your prediction, show the evidence that supports or contradicts it, explain one limit of your checks, and record cleanup. Correct an error and retry if an acceptance criterion is unmet.</p></details>
