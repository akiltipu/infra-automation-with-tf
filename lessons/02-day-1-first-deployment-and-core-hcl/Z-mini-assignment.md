---
title: "Assignment 02 — A service contract"
description: "Solve an independent CourseOps problem with acceptance criteria, hints and instructor feedback."
keywords: [CourseOps, assignment, assessment]
kind: assignment
track: core
---

# Assignment 02 — A service contract

<div class="lesson-goal"><strong>Independent practice · 40 minutes</strong><p>Demonstrate the section outcome with evidence before comparing the reference solution.</p></div>

[Download the lab bundle](/downloads/courseops-labs.zip) and open `courseops/assignments/02`. In a repository checkout the same files live under `labs/courseops`. Paths below refer to that bundle.


**Problem:** A teammate needs an unambiguous object describing the CourseOps environment. Implement the TODOs in `starter/main.tf`, without an AWS account. Budget: 40 minutes.

From `labs/courseops`, copy `assignments/02/starter` to `work/assignment-02`. All commands below run from that copy.

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -var=environment=dev
terraform apply -var=environment=dev
terraform output -json service
terraform plan -var=environment=dev
```

## Acceptance criteria

- `service` is `{project = "courseops", environment = "dev", port = 80}` and `id` is nonempty.
- A second plan reports no changes.
- `-var=environment=production`, `-var=port=0`, and `-var=port=80.5` each fail validation (supply a valid environment for port checks).
- Changing the port to 8080 plans one **update**, not a replacement. Explain why the ID is retained with `input`.
- Destroy the local object with `terraform destroy -var=environment=dev` after recording evidence.

Submit your HCL, sanitized output, and three sentences explaining variable → resource input → output. Do not submit state. Terraform creates a local state record here, not a real web service.

## Graduated hints

<details class="assignment-hint"><summary>Hint 1</summary><p>Use <code>terraform_data</code>; Terraform includes its provider.</p></details>
<details class="assignment-hint"><summary>Hint 2</summary><p>Use <code>contains</code> for allowed environments and <code>floor</code> to reject fractional ports.</p></details>
<details class="assignment-hint"><summary>Hint 3</summary><p>Return <code>terraform_data.service.output</code>; read the ID separately.</p></details>

Reference: `reference/main.tf`. Instructor explanation: `../../instructor/02.md`.

## Feedback and reflection

[Browse starter files](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/assignments/02) · [Instructor solution — after your attempt](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/02.md) · [Assessment rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md)

<details class="knowledge-check"><summary>What should I explain before marking this assignment complete?</summary><p>State your prediction, show the evidence that supports or contradicts it, explain one limit of your checks, and record cleanup. Correct an error and retry if an acceptance criterion is unmet.</p></details>

## Return to this idea later

Tomorrow, explain the main decision without looking at the reference. About a week later, change one input or requirement and predict the result. Record what you needed to look up in your learning log; the aim is to identify your next practice step.
