---
title: "Managing Secrets & Environment Variables Securely"
description: "Best practices for injecting secrets, using TF_VAR environment variables, .tfvars files, and fetching runtime secrets from AWS Secrets Manager and SSM."
keywords:
  - Secrets Management
  - TF_VAR
  - AWS Secrets Manager
  - SSM Parameter Store
  - Sensitive Variables
  - Security Best Practices
kind: concept
track: core
---

# Managing Secrets & Environment Variables Securely

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Keep secrets out of Git and identify where Terraform can persist them.</p></div>

<div class="project-connection"><strong>CourseOps · Section 04</strong><p>Apply this concept in the connected project. <a href="/lessons/day-2-multi-environment-sdlc/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-2-multi-environment-sdlc/mini-assignment">mini assignment</a>.</p></div>

Hardcoded secrets in infrastructure code represent one of the most critical security vulnerabilities in cloud engineering. Let us explore how to manage variables and secrets securely across environments.

---

## 1. Environment-Specific `.tfvars` Files

In directory-based or shared module structures, values are separated into `.tfvars` files:

```
environments/
├── dev.tfvars        (Committed to Git - non-sensitive dev settings)
├── prod.tfvars       (Committed to Git - non-sensitive prod settings)
└── secrets.tfvars    (NEVER committed to Git - listed in .gitignore)
```

### Applying with a Variable File:
```bash
terraform apply -var-file="prod.tfvars"
```

---

## 2. Using `TF_VAR_*` Environment Variables in CI/CD

In automated pipelines (such as GitHub Actions or GitLab CI), inject secrets directly into the environment using the `TF_VAR_` prefix:

```bash
# Setting environment variables
export TF_VAR_db_password="${SECRET_DB_PASSWORD}"
export TF_VAR_api_key="${SECRET_API_KEY}"

# Terraform automatically maps TF_VAR_db_password to var.db_password
terraform plan
```

---

## 3. Dynamic Secrets from AWS Secrets Manager & SSM

A secret manager keeps values out of Git. However, ordinary Terraform data sources and resource password arguments can still persist those values in state and saved plans. `sensitive = true` redacts normal CLI display; it does not encrypt or omit stored values.

The following is an **illustrative fragment**, not a complete database deployment. Prefer application runtime secret retrieval, service-managed credentials, or supported ephemeral/write-only provider features when secret material must stay out of state:

```hcl
# Read Database Password from AWS Secrets Manager
data "aws_secretsmanager_secret" "db_secret" {
  name = "production/rds/master-credentials"
}

data "aws_secretsmanager_secret_version" "db_secret_val" {
  secret_id = data.aws_secretsmanager_secret.db_secret.id
}

locals {
  # Parse JSON payload from Secrets Manager
  db_credentials = jsondecode(data.aws_secretsmanager_secret_version.db_secret_val.secret_string)
}

# Provision RDS with the dynamically fetched secret
resource "aws_db_instance" "database" {
  allocated_storage = 20
  engine            = "postgres"
  instance_class    = "db.t3.micro"
  username          = local.db_credentials.username
  password          = local.db_credentials.password # Sensitive
  skip_final_snapshot = false # Supply a unique final_snapshot_identifier in the full configuration
}
```

---


## Apply the idea: follow a secret through the system

Passing a secret via TF_VAR avoids hardcoding, but an ordinary resource argument can still put it in state. Reading it from a secret-manager data source has the same persistence concern. Prefer passing a secret ARN to the application, which retrieves the value at runtime with its own scoped role when the architecture permits.

<details class="knowledge-check">
<summary>Check your understanding: Which feature merely redacts display: sensitive or ephemeral?</summary>
<p>sensitive redacts normal display. Ephemeral values require Terraform 1.10+ and supported contexts; managed-resource write-only arguments require Terraform 1.11+ and provider support. They are not drop-in options for every argument.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/manage-sensitive-data).

## Prove the environment boundary

Continue to the environment workshop and assignment. Demonstrate separate local states, then explain which account and role boundaries the cloud version would need. A refresh-only operation updates Terraform records; it does not by itself resolve configuration intent.
