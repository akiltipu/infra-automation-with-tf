# Assignment 01 — Design before deploying

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
