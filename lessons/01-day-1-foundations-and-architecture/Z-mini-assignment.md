---
title: "Assignment 01 — Design before deploying"
description: "Solve an independent CourseOps problem with acceptance criteria, hints and instructor feedback."
keywords: [CourseOps, assignment, assessment]
kind: assignment
track: core
---

# Assignment 01 — Design before deploying

<div class="lesson-goal"><strong>Independent practice · 40 minutes</strong><p>Demonstrate the section outcome with evidence before comparing the reference solution.</p></div>

[Download the lab bundle](/downloads/courseops-labs.zip) and open `courseops/assignments/01`. In a repository checkout the same files live under `labs/courseops`. Paths below refer to that bundle.


Work individually for 30–40 minutes. No AWS account is required.

**Problem:** A team edits its status-page server manually. Nobody can reproduce it, and staging changes have affected production. Design CourseOps so another engineer can rebuild it and explain who may change what.

Copy `starter/decision-record.md` and complete it. Read the project README and draw your own annotated architecture; do not copy the reference diagram without explanation.

## Acceptance criteria

1. Identify the VPC, two public/private subnet pairs, one development web instance, Terraform state, and Ansible role.
2. Trace an operator's HTTP request and SSH connection. Explain why a route alone does not make an instance reachable.
3. Allocate resource creation to Terraform and package/page configuration to Ansible.
4. Separate source code, state, credentials, and runtime application data. Give each an owner and storage location.
5. State the limits of the core lab: one web instance, restricted operator access, no high availability or public TLS service.

## Submit

A diagram, the completed decision record, and a 60-second explanation of one failure path. Use hypothetical identifiers only. Grade with the common 10-point rubric in `instructor/TEACHING-GUIDE.md`.

## Hints — open one at a time

1. Start at the browser and identify every route and security rule needed to reach port 80.
2. State records resource identities; it is not a server disk backup.
3. Ansible can run again after Terraform without creating a second EC2 instance.

After attempting the problem, compare `../../instructor/01.md`.

## Feedback and reflection

[Browse starter files](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/assignments/01) · [Instructor solution — after your attempt](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/01.md) · [Assessment rubric](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/instructor/TEACHING-GUIDE.md)

<details class="knowledge-check"><summary>What should I explain before marking this assignment complete?</summary><p>State your prediction, show the evidence that supports or contradicts it, explain one limit of your checks, and record cleanup. Correct an error and retry if an acceptance criterion is unmet.</p></details>
