---
title: "Input Variables, Custom Validation Rules, Outputs & Locals"
description: "Master input variables, custom validation blocks with regex, sensitive outputs, local computed values, and variable precedence hierarchy."
keywords:
  - Terraform Variables
  - Variable Validation
  - Sensitive Outputs
  - Local Values
  - Variable Precedence
  - DRY Terraform
---

# Input Variables, Custom Validation Rules, Outputs & Locals

Hardcoded values make infrastructure code fragile and non-reusable. To build enterprise-grade configurations, we use **Input Variables**, **Outputs**, and **Local Values**.

---

## 1. Input Variables & Custom Validation Rules

Variables allow configurations to be customized without altering the underlying code.

### Standard Variable Declaration:
```hcl
# variables.tf

variable "aws_region" {
  type        = string
  description = "The target AWS region for deployment"
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"

  # Custom Validation Block
  validation {
    condition     = can(cidrnetmask(var.vpc_cidr))
    error_message = "The vpc_cidr value must be a valid CIDR address (e.g. 10.0.0.0/16)."
  }
}

variable "environment" {
  type        = string
  description = "Deployment environment tier"

  # Enforce Allowed Values via Validation
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "The environment must be one of: dev, staging, prod."
  }
}

variable "database_password" {
  type        = string
  description = "Master password for RDS database"
  sensitive   = true # Prevents value from being printed in CLI logs or plans
}
```

---

## 2. Variable Value Precedence Order

When the same variable is defined in multiple places, Terraform resolves the final value using this strict **precedence hierarchy** (highest priority wins):

```
1. CLI Arguments: terraform apply -var="environment=prod"              (HIGHEST)
   ▲
2. Variable files: *.auto.tfvars or *.auto.tfvars.json
   ▲
3. Default variable file: terraform.tfvars or terraform.tfvars.json
   ▲
4. Environment Variables: export TF_VAR_environment="prod"
   ▲
5. Default value in variable declaration: default = "dev"               (LOWEST)
```

---

## 3. Local Values (`locals`) for DRY Configurations

While variables are user-supplied inputs, **Locals** are internal computed expressions. Use locals to avoid repeating complex string formatting or tagging conventions:

```hcl
# locals.tf

locals {
  project_name = "fintech-core"
  env          = var.environment
  name_prefix  = "${local.project_name}-${local.env}"

  # Common tags merged across all resources
  common_tags = {
    Project     = local.project_name
    Environment = local.env
    ManagedBy   = "Terraform"
    Owner       = "Platform-Team"
  }
}

# Usage in Resource
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}
```

---

## 4. Outputs & Sensitive Flag

Outputs expose values after provisioning. They are essential for displaying connection strings, feeding downstream CI/CD jobs, or sharing data between modules.

```hcl
# outputs.tf

output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block assigned to VPC"
  value       = aws_vpc.main.cidr_block
}

output "db_connection_string" {
  description = "Database connection URI"
  value       = "postgres://${aws_db_instance.main.username}:${var.database_password}@${aws_db_instance.main.endpoint}/appdb"
  sensitive   = true # Redacts value in CLI stdout (shows <sensitive>)
}
```

### Accessing Outputs via CLI:
```bash
# Query all outputs in JSON format
terraform output -json

# Query a specific output directly
terraform output -raw vpc_id
```

---

## 5. Summary & Next Steps

Variables, locals, and outputs provide parameterization, data sanitization, and interface boundaries. In the next lesson, we will explore **Data Sources, Provider Configurations, and Local State Mechanics**.
