---
title: "Enterprise CI/CD Pipelines with GitHub Actions"
description: "Build an enterprise CI/CD pipeline using GitHub Actions, OIDC passwordless AWS authentication, automated PR speculative plan comments, and merge gates."
keywords:
  - CI/CD Pipelines
  - GitHub Actions
  - OIDC Authentication
  - PR Plan Comments
  - Automated Apply
  - Environment Protection
---

# Enterprise CI/CD Pipelines with GitHub Actions

In enterprise organizations, engineers do not run `terraform apply` from their local laptops. All infrastructure changes pass through automated **Continuous Integration & Continuous Deployment (CI/CD)** pipelines.

---

## 1. The Enterprise CI/CD Pipeline Workflow

```
┌─────────────────────────┐
│ Engineer Opens PR       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PULL REQUEST VALIDATION JOB (Speculative)                                   │
│  1. terraform fmt -check (Style check)                                      │
│  2. terraform validate   (Static validation)                                │
│  3. Security Scan        (tfsec / Trivy)                                    │
│  4. terraform plan       (Posts speculative diff as PR comment)             │
└───────────────────────────┬─────────────────────────────────────────────────┘
                            │
                            │ Peer Code Review & PR Approval
                            ▼
┌─────────────────────────┐
│ PR Merged to 'main'     │
└───────────┬─────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PRODUCTION DEPLOYMENT JOB (Execution)                                       │
│  1. Environment Protection Gate (Required Senior Approver)                  │
│  2. terraform apply -auto-approve                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Passwordless AWS Authentication with OIDC

Never store static `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in GitHub Secrets. Use **AWS OpenID Connect (OIDC)** to dynamically assume temporary IAM roles:

```yaml
# .github/workflows/terraform.yml

name: "Terraform CI/CD Pipeline"

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  id-token: write # Required for AWS OIDC authentication
  contents: read
  pull-requests: write # Required to comment plan diff on PR

jobs:
  terraform:
    name: "Terraform Plan & Apply"
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsTerraformRole
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.10.5"

      - name: Terraform Format Check
        run: terraform fmt -check

      - name: Terraform Init
        run: terraform init

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan (On Pull Request)
        if: github.event_name == 'pull_request'
        id: plan
        run: |
          terraform plan -no-color -out=tfplan
          terraform show -no-color tfplan > plan_output.txt

      - name: Post Plan to GitHub PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const plan = fs.readFileSync('plan_output.txt', 'utf8');
            const body = `### 📋 Speculative Terraform Plan Diff\n\`\`\`hcl\n${plan.slice(0, 65000)}\n\`\`\``;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });

      - name: Terraform Apply (On Merge to Main)
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve
```

---

## 3. Summary & Next Steps

OIDC authentication eliminates static secret leakage, and PR comments provide transparent team collaboration. In the next lesson, we will integrate **Security Scanning, Linting (`tflint`), and Policy as Code**.
