---
title: "Enterprise CI/CD Pipelines with GitHub Actions"
description: "Separate untrusted PR validation from trusted planning, review saved plan artifacts, and apply with scoped OIDC roles and environment approval."
keywords:
  - CI/CD Pipelines
  - GitHub Actions
  - OIDC Authentication
  - PR Plan Comments
  - Automated Apply
  - Environment Protection
kind: concept
track: core
---

# Enterprise CI/CD Pipelines with GitHub Actions

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Bind a reviewed saved plan to a trusted commit and deployment approval.</p></div>

<div class="project-connection"><strong>CourseOps · Section 08</strong><p>Apply this concept in the connected project. <a href="/lessons/day-4-enterprise-cicd-and-policy-as-code/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-4-enterprise-cicd-and-policy-as-code/mini-assignment">mini assignment</a>.</p></div>

For shared production infrastructure, a controlled deployment pipeline makes identity, review, and execution auditable. Route normal infrastructure changes through automated **Continuous Integration & Continuous Deployment (CI/CD)** pipelines.

---

## 1. Separate code validation from deployment authority

A pull request is untrusted code until reviewed. It can contain executable providers, modules, and scripts, so even a plan job needs a trust boundary. Run credential-free validation on PRs; generate a deployment plan from the protected main branch after merge. Never use `pull_request_target` to check out and execute untrusted PR code with deployment credentials.

![A PR validation path has no cloud credentials; trusted main creates a plan that passes through review before apply.](/images/lesson-diagrams/delivery.svg)

## 2. Prerequisites outside the workflow

Before adopting this example, configure:

- A protected `main` branch and required code review.
- A `production` GitHub environment with required reviewers, self-review prevention where available, and main-only deployment rules. Referencing an environment in YAML does not create its protection rules.
- An S3 backend with native locking; a committed provider lockfile; Terraform code under `environments/prod`.
- AWS OIDC trust with audience `sts.amazonaws.com`. The plan role trusts only `repo:OWNER/REPO:ref:refs/heads/main`; the apply role trusts only `repo:OWNER/REPO:environment:production`. Replace OWNER/REPO with the actual repository.
- A plan role scoped to required reads plus backend locking, and a separate apply role scoped to the intended resources. Put their ARNs in repository variables `AWS_PLAN_ROLE_ARN` and `AWS_APPLY_ROLE_ARN`.

State and binary/JSON plans can contain secrets. The artifact example below is appropriate only in a repository with suitable restricted access. For a public infrastructure repository, use a restricted external artifact store or a controlled remote execution service rather than uploading sensitive plans to broadly readable Actions artifacts.

## 3. Example workflow for a restricted deployment repository

Action major-version tags keep the lesson readable. Resolve and pin reviewed full commit SHAs before production use. The Terraform version is an example course baseline; select a supported, tested release for your environment.

```yaml
name: Reviewed Terraform deployment
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
permissions:
  contents: read

# PR checks do not occupy the production deployment group.
concurrency:
  group: terraform-${{ github.event_name == 'push' && 'production' || github.ref }}
  cancel-in-progress: false

jobs:
  validate:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: environments/prod
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: '1.10.5'
      - run: terraform fmt -check -recursive
      - run: terraform init -backend=false -input=false -lockfile=readonly
      - run: terraform validate

  plan:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: validate
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    defaults:
      run:
        working-directory: environments/prod
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.sha }}
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: '1.10.5'
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_PLAN_ROLE_ARN }}
          aws-region: us-east-1
      - run: terraform init -input=false -lockfile=readonly
      - run: terraform plan -input=false -lock-timeout=5m -out=tfplan
      - name: Prepare review evidence
        run: |
          terraform show -no-color tfplan > plan.txt
          sha256sum tfplan > tfplan.sha256
          printf '%s\n' "$GITHUB_SHA" > commit.txt
      - uses: actions/upload-artifact@v4
        with:
          name: production-plan-${{ github.sha }}
          path: |
            environments/prod/tfplan
            environments/prod/plan.txt
            environments/prod/tfplan.sha256
            environments/prod/commit.txt
          retention-days: 1
          if-no-files-found: error

  apply:
    needs: plan
    runs-on: ubuntu-latest
    environment: production
    permissions:
      contents: read
      id-token: write
    defaults:
      run:
        working-directory: environments/prod
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.sha }}
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: '1.10.5'
      - uses: actions/download-artifact@v4
        with:
          name: production-plan-${{ github.sha }}
          path: environments/prod
      - name: Verify commit and plan integrity
        run: |
          test "$(cat commit.txt)" = "$GITHUB_SHA"
          sha256sum --check tfplan.sha256
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_APPLY_ROLE_ARN }}
          aws-region: us-east-1
      - run: terraform init -input=false -lockfile=readonly
      - run: terraform apply -input=false -lock-timeout=5m tfplan
```

The reviewer opens `plan.txt` from this run and checks its commit and target before approving the environment job. The checksum detects corruption; it is not a signature and cannot make an untrusted producer trustworthy. Downloading without another run ID scopes retrieval to this workflow run.

The concurrency group serializes this workflow's deployments. S3 locking coordinates other Terraform writers; neither mechanism blocks console edits. If state or intent changes, discard the plan and create a new reviewed run. A saved plan does not imply an application health check, so add workload-specific verification after apply.

## Apply the idea: distinguish two reviews

PR validation reviews code without deployment credentials. After merge, a trusted job plans from that commit against the target state. The deployment reviewer checks that exact plan; the apply job checks out the same commit and consumes the same run artifact. A stale plan must be regenerated and reviewed.

<details class="knowledge-check">
<summary>Check your understanding: Does id-token: write by itself grant AWS access?</summary>
<p>No. It allows requesting an OIDC token. AWS role trust must validate the issuer, audience, and allowed subject; role policies define permitted AWS actions. Restrict both the GitHub environment and AWS trust.</p>
</details>

**Read further:** [Official documentation](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).

## 3. Summary & Next Steps

OIDC authentication eliminates static secret leakage, and PR comments provide transparent team collaboration. In the next lesson, we will integrate **Security Scanning, Linting (`tflint`), and Policy as Code**.
