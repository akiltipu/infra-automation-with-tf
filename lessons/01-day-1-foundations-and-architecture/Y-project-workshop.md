---
title: "Workshop: Design CourseOps and choose your learning path"
description: "Explain the target system, choose a cloud or local path, and predict which tool owns each change."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Design CourseOps and choose your learning path

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Explain the target system, choose a cloud or local path, and predict which tool owns each change.</p></div>

## The problem we will solve

The CourseOps team publishes a small service-status page. Manual server edits have made its environments inconsistent. Over eight sections you will describe the infrastructure, protect its state, refactor it, configure the page, and review a release. Each section ends with a problem to solve independently.

The final sandbox has one Ubuntu web instance, two public/private subnet pairs, restricted operator access, and an Ansible-managed Nginx page. Two subnet pairs let us discuss routing and future placement; they do **not** make the single instance highly available. There is no application database to back up in this project.

![CourseOps core architecture showing the operator, public instance, private subnets and separate Terraform state and Ansible ownership.](/images/lesson-diagrams/courseops-architecture.svg)

## Before class: a short readiness check

Can you navigate a terminal, explain an IP address and subnet, edit a text file, and make a Git commit? If any answer is no, practice those basics before the live course. Install Git, Terraform >=1.10 and <2, Python 3.11+, and a POSIX shell (Linux, macOS or WSL). Confirm each version in your terminal. The lab README records the tested teaching baseline.

The AWS path additionally needs AWS CLI v2, a sandbox account, reviewed permissions, an SSH key, and a budget/cleanup agreement. Use short-lived credentials and verify `aws sts get-caller-identity`. An account labeled free tier is not a promise that this lab is free.

## Choose the right evidence

| Path | You will demonstrate | You will not claim |
| --- | --- | --- |
| Cloud-free | Local Terraform state, tests, safe moves, Ansible template rendering, release gates | AWS reachability or real IAM isolation |
| AWS sandbox | All local outcomes plus VPC/EC2 provisioning, SSH, Nginx and HTTP health | Production availability, TLS or a full recovery service |
| Extension | A separately designed and verified improvement | That adding a NAT gateway alone solves private-host access |

## Get the project and establish a working habit

Download the project using the link below, extract it, and open `courseops/README.md`. A repository checkout has the same files at `labs/courseops`. All project commands assume that directory unless a step says otherwise.

The `checkpoints` are complete reference snapshots. The AWS path evolves **one** `work/dev` directory and its state; applying every snapshot as a separate root would create a different exercise. Record predictions and selected non-secret evidence in a learning log. Never commit state, saved plans or credentials.

## How to study in four days

Read the **Core** concepts, use each **Workshop** during guided practice, then attempt the **Assignment** before opening its solution. Extension pages are follow-up reading. Each section has a 150-minute teaching block; the workshop is part of that block, not additional lecture time. The capstone is a separate final demonstration or take-home assessment.

Ask yourself before every command: what should change, what evidence will show it, and how will I clean up? Tomorrow, retrieve yesterday's answer from memory before looking at your notes.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 01 mini assignment](/lessons/day-1-foundations-and-architecture/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>Why are the two subnet pairs not enough to claim high availability?</summary><p>The core has only one running web instance and no load balancer or health-based failover. Network placement options alone do not provide redundant service.</p></details>

## Primary references

- [Learning and worked examples](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)
- [Terraform workflow](https://developer.hashicorp.com/terraform/intro/core-workflow)
