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
---

# Security Scanning, Linting & Policy as Code

Catching security vulnerabilities and compliance violations before `terraform apply` executes is known as **Shifting Security Left**.

---

## 1. The 3 Tiers of Infrastructure Security

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    SHIFT-LEFT SECURITY PYRAMID                             │
├─────────────────────────┬──────────────────────────────────────────────────┤
│ TIER 3: Policy as Code  │ Open Policy Agent (OPA), Checkov, Sentinel       │
│                         │ (Enforces organizational guardrails & compliance)│
├─────────────────────────┼──────────────────────────────────────────────────┤
│ TIER 2: Static Analysis │ Trivy, tfsec                                     │
│                         │ (Scans for CVEs, unencrypted disks, open ports)  │
├─────────────────────────┼──────────────────────────────────────────────────┤
│ TIER 1: HCL Linting     │ tflint                                           │
│                         │ (Detects deprecated syntax, invalid instance IDs)│
└─────────────────────────┴──────────────────────────────────────────────────┘
```

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
trivy config ./
```

### Common Vulnerabilities Caught:
- S3 bucket without server-side encryption (`AVD-AWS-0088`).
- Security group allowing `0.0.0.0/0` on SSH port 22 (`AVD-AWS-0107`).
- EC2 instance with IMDSv1 enabled (vulnerable to SSRF attacks) (`AVD-AWS-0028`).

---

## 4. Tier 3: Guardrail Enforcement with Open Policy Agent (OPA)

With **Policy as Code**, compliance teams write enforceable rules in **Rego**:

```rego
# policy/enforce_tags.rego
package terraform.security

# Deny any AWS resource that lacks a mandatory 'Environment' and 'Owner' tag
deny[msg] {
  resource := input.resource_changes[_]
  resource.mode == "managed"
  tags := resource.change.after.tags

  not tags.Environment
  msg := sprintf("Resource '%v' is missing mandatory tag: 'Environment'", [resource.address])
}
```

### Evaluating Policies with Conftest:
```bash
# Convert plan to JSON
terraform show -json tfplan > plan.json

# Evaluate plan against Rego policies
conftest test plan.json -p policy/
# FAIL - Resource 'aws_s3_bucket.data' is missing mandatory tag: 'Environment'
```

---

## 5. Summary & Next Steps

Integrating linters, scanners, and policy as code prevents insecure infrastructure from ever reaching cloud environments. In the final lesson, we review the **Course Capstone, Cost Optimization with Infracost, and the Production Readiness Scorecard**.
