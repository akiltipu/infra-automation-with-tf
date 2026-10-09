---
title: "Workshop: Deploy the first CourseOps stack"
description: "Read a complete root module, predict its plan, and explain the network path before configuring the application."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Deploy the first CourseOps stack

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Read a complete root module, predict its plan, and explain the network path before configuring the application.</p></div>

## From a small model to real resources

First use `local/live/dev` in the lab bundle. Its `terraform_data` object records a service contract locally. Trace the environment input into the resource and then into the output. This separates learning HCL from troubleshooting AWS credentials.

```bash
terraform -chdir=local/live/dev init
terraform -chdir=local/live/dev plan
terraform -chdir=local/live/dev apply
terraform -chdir=local/live/dev output
```

Predict the second plan: no resource changes. Now change one input and distinguish an in-place update from a replacement. Assignment 02 asks you to build this contract yourself.

## Read the AWS root before applying it

`checkpoints/02-first-stack` contains every Terraform file needed for the initial sandbox. Follow the README to copy it to `work/dev`; fill in the example inputs with your own reviewed account, Ubuntu AMI, public SSH key and operator IPv4 /32. An AMI ID is regional: a valid ID elsewhere is not evidence it exists here.

| File | Question it answers |
| --- | --- |
| `versions.tf` | Which Terraform/provider versions are compatible? |
| `provider.tf` | Which region and allowed account will receive requests? |
| `variables.tf` | Which inputs are required, typed or validated? |
| `main.tf` | Which resources and dependencies describe the design? |
| `outputs.tf` | Which non-secret values do later tools need? |

Terraform reads these files as one configuration; filename order does not control creation order. References create dependency edges. Locals name expressions; they do not create resources.

## Explain the network instead of memorizing it

The VPC is `10.42.0.0/16`. With `cidrsubnet(vpc_cidr, 8, n)`, eight additional prefix bits create /24s. Default public subnet numbers 0 and 1 produce `10.42.0.0/24` and `10.42.1.0/24`; private numbers 10 and 11 produce `10.42.10.0/24` and `10.42.11.0/24`.

A public subnet routes `0.0.0.0/0` to the internet gateway. The instance still needs a public IP, an allowed security-group source, and a listening process. The core permits SSH and HTTP only from your operator /32. Private subnet route tables have no default internet route; NAT is off.

## Predict, run, inspect

Follow the complete AWS commands in the README. The default plan has 16 managed resources with NAT and endpoints disabled. Read names and actions, not just the count. Apply the reviewed saved plan, inspect the `web` output, and run another plan. Capture IDs for later refactoring.

HTTP is not configured until the Ansible section, so an HTTP failure now is expected. Diagnose unexpected SSH failure in order: identity/key, instance readiness, current operator IP, security group, subnet route, public IP. Do not open SSH to everyone to make the exercise pass.

## Guided variation

Predict the private subnet CIDRs if their network numbers become 20 and 21. Verify the calculation without applying the change. Explain why changing a subnet CIDR for an existing deployment is different from changing a tag. Finish with the independent service-contract assignment.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 02 mini assignment](/lessons/day-1-first-deployment-and-core-hcl/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>Does a successful Terraform apply prove that the status page is reachable?</summary><p>No. It proves the provider completed the requested infrastructure actions. The application is not configured yet; routing, access, process readiness and HTTP health require separate verification.</p></details>

## Primary references

- [cidrsubnet](https://developer.hashicorp.com/terraform/language/functions/cidrsubnet)
- [Internet gateways](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)
