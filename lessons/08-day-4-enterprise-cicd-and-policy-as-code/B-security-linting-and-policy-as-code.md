---
title: "Security Scanning, Linting & Policy as Code"
description: "Shift security left using tflint, static security analysis with Trivy/tfsec, and guardrail enforcement using Open Policy Agent (OPA) and Conftest."
keywords:
  - Security Scanning
  - tflint
  - tfsec
  - Trivy
  - Policy as Code
  - OPA Rego
kind: concept
track: core
---

# Security Scanning, Linting & Policy as Code

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Distinguish formatting, schema checks, misconfiguration scans, and policy.</p></div>

<div class="project-connection"><strong>CourseOps · Section 08</strong><p>Apply this concept in the connected project. <a href="/lessons/day-4-enterprise-cicd-and-policy-as-code/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-4-enterprise-cicd-and-policy-as-code/mini-assignment">mini assignment</a>.</p></div>

Catching security misconfigurations and policy violations before `terraform apply` executes is known as **Shifting Security Left**.

---

## 1. The 3 Tiers of Infrastructure Security


| Gate | What it checks | What it cannot prove |
| :--- | :--- | :--- |
| Linting | Provider-aware style and validation rules | Runtime authorization or health |
| IaC security scan | Known configuration misconfigurations | Installed package vulnerabilities |
| Policy | Organization-specific plan constraints | Every operational failure mode |


---

## 2. Tier 1: Advanced HCL Linting with `tflint`

`tflint` catches provider-specific errors that `terraform validate` misses (such as invalid AWS EC2 instance type names or deprecated parameters):

```bash
# Install and run tflint
brew install tflint
tflint --init
tflint
```

```hcl
# .tflint.hcl
plugin "aws" {
  enabled = true
  version = "0.30.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

rule "aws_instance_invalid_type" {
  enabled = true
}
```

---

## 3. Tier 2: Static Security Scanning with `Trivy` / `tfsec`

`Trivy` scans your code for common security misconfigurations:

```bash
trivy config --exit-code 1 --severity HIGH,CRITICAL ./
```

### Example misconfigurations:

Rule IDs and coverage depend on the installed scanner version. IaC scanning does not scan the packages running inside an instance.
- S3 bucket without server-side encryption (`AVD-AWS-0088`).
- Security group allowing `0.0.0.0/0` on SSH port 22 (`AVD-AWS-0107`).
- EC2 instance with IMDSv1 enabled (vulnerable to SSRF attacks) (`AVD-AWS-0028`).

---

## 4. Tier 3: Guardrail Enforcement with Open Policy Agent (OPA)

With **Policy as Code**, compliance teams write enforceable rules in **Rego**:

This Rego v1 example deliberately scopes the rule to S3 buckets and EC2 instances, which support tags. It requires both tags, skips pure deletions, and treats unknown required tag values as a reason to defer approval. Expand the allowlist with resource-specific tests.

```rego
# policy/enforce_tags.rego
package main

import rego.v1

deny contains msg if {
  resource := input.resource_changes[_]
  resource.mode == "managed"
  resource.type in {"aws_s3_bucket", "aws_instance"}
  resource.change.after != null
  some key in {"Environment", "Owner"}
  tags := object.get(resource.change.after, "tags_all", {})
  not valid_tag(tags, key)
  msg := sprintf("%s requires a known non-empty %s tag", [resource.address, key])
}

valid_tag(tags, key) if {
  value := tags[key]
  is_string(value)
  trim_space(value) != ""
}
```

### Evaluating Policies with Conftest:
```bash
# Convert plan to JSON
terraform show -json tfplan > plan.json

# Evaluate plan against Rego policies
conftest test plan.json -p policy/ # package main is the default namespace
# FAIL - Resource 'aws_s3_bucket.data' is missing mandatory tag: 'Environment'
```

---


## Apply the idea: test a policy as code

A useful policy has passing and failing fixtures. Test a resource with both required tags, one with an absent tag, one with an unknown planned tag, and a deletion. Unknown values require an explicit decision; silently treating them as approved undermines the guardrail.

<details class="knowledge-check">
<summary>Check your understanding: Will trivy config scan installed packages for CVEs?</summary>
<p>No. This command scans infrastructure configuration for misconfiguration. Image/filesystem vulnerability scans use other Trivy modes. Each gate proves a different property, and exit status must be configured to block delivery.</p>
</details>

**Read further:** [Official documentation](https://www.openpolicyagent.org/docs/policy-language).

## 5. Summary & Next Steps

Linters, scanners, and policy checks reduce risk when failures block deployment. Their coverage is limited; they do not replace runtime controls or operational review. In the final lesson, we review the **Course Capstone, Cost Optimization with Infracost, and the Production Readiness Scorecard**.
