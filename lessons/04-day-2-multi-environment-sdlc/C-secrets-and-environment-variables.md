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
---

# Managing Secrets & Environment Variables Securely

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

The most secure pattern is to store secrets in a managed vault (AWS Secrets Manager or AWS Systems Manager Parameter Store) and read them dynamically via Data Sources:

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
  skip_final_snapshot = true
}
```

---

## 4. Day 2 Wrap-up & Transition to Day 3

You have completed **Day 2: State Management & Multi-Environment SDLC Architecture**:
- Understood state JSON internals, serial counters, and lineage tracking.
- Built an encrypted S3 remote backend with DynamoDB distributed state locking.
- Mastered state refactoring with `state mv`, unmanaged resources with `state rm`, and resolved drift with `refresh-only`.
- Imported brownfield resources with declarative `import {}` blocks and automatic code generation.
- Designed multi-environment directory layouts, multi-account topologies with `assume_role`, and secure secrets handling.

In **Day 3**, we will dive into **Reusable Modules & Advanced HCL Expressions**!
