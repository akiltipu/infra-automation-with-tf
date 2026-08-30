---
title: "HashiCorp Configuration Language (HCL) Anatomy"
description: "Master the structure of HCL2: blocks, labels, arguments, primitive and structural data types, string interpolation, and heredoc syntax."
keywords:
  - HCL Syntax
  - HCL2 Anatomy
  - Terraform Blocks
  - Data Types
  - String Interpolation
  - Heredoc
---

# HashiCorp Configuration Language (HCL) Anatomy

**HCL (HashiCorp Configuration Language)** is a declarative domain-specific language designed to be human-readable and machine-friendly. It combines the readability of YAML with the structural rigor of JSON.

---

## 1. The Anatomy of an HCL Block

Every HCL file consists of top-level **Blocks**. Each block follows a strict grammatical structure:

```hcl
block_type "label_one" "label_two" {
  argument_key = "argument_value" # Argument
  
  nested_block {                  # Nested Block
    nested_key = 123
  }
}
```

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  block_type  │ │  label_one   │ │  label_two   │
│ (e.g.resource│ │(e.g.aws_vpc) │ │ (e.g. main)  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
   What kind       The provider     Your custom
   of block is     resource type    logical name
   being created?  definition       for reference
```

### Real-World Example:
```hcl
resource "aws_security_group" "web_sg" {
  name        = "web-server-sg"
  description = "Security group for HTTPS web traffic"
  vpc_id      = "vpc-0123456789abcdef0"

  ingress {
    description = "Allow TLS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Environment = "production"
    Team        = "Platform"
  }
}
```

---

## 2. The 7 Primary Top-Level Block Types

| Block Type | Purpose | Example |
| :--- | :--- | :--- |
| `terraform` | Configures Terraform runtime settings, required versions, and provider requirements | `terraform { required_version = ">= 1.5.0" }` |
| `provider` | Configures authentication and plugins for a specific cloud/service | `provider "aws" { region = "us-east-1" }` |
| `resource` | Declares infrastructure components to be created and managed | `resource "aws_s3_bucket" "data" {}` |
| `data` | Queries read-only information about existing resources in the cloud | `data "aws_ami" "ubuntu" {}` |
| `variable` | Defines parameterized inputs passed into configuration | `variable "environment" { type = string }` |
| `output` | Exposes computed values to the CLI or downstream modules | `output "vpc_id" { value = aws_vpc.main.id }` |
| `locals` | Defines reusable, computed local constants within a module | `locals { name_prefix = "${var.project}-${var.env}" }` |

---

## 3. Data Types in HCL

HCL supports both primitive types and complex structural types:

### A. Primitive Types
```hcl
is_production = true             # bool (true or false)
instance_count = 3                # number (integers and floating-point)
cluster_name   = "prod-cluster"   # string (UTF-8 text)
```

### B. Collection Types
```hcl
# List (Ordered collection of elements of the same type, accessed by 0-based index)
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Set (Unordered collection of unique elements)
allowed_roles = toset(["admin", "developer", "auditor"])

# Map (Key-value pairs where all values share the same type)
environment_tags = {
  Environment = "production"
  CostCenter  = "Engineering-804"
}
```

### C. Structural Types (Object and Tuple)
```hcl
# Object (Key-value pairs where each value can have a different type schema)
server_config = {
  hostname = "web-01"
  port     = 8080
  enabled  = true
}

# Tuple (Ordered sequence where each element index can have a different type)
mixed_tuple = ["subnet-abc", 443, true]
```

---

## 4. String Interpolation and Heredocs

### String Interpolation:
Embed dynamic variables or resource attributes inside strings using `${...}` syntax:
```hcl
locals {
  app_name    = "payment-gateway"
  environment = "production"
  bucket_name = "${local.app_name}-${local.environment}-logs-${var.aws_region}"
}
```

### Multiline Heredocs (`<<-EOT`):
When injecting shell scripts, cloud-init user data, or JSON policies, use the trimmed heredoc marker (`<<-EOT`), which strips leading indentation:
```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  user_data = <<-EOT
    #!/bin/bash
    echo "Starting Web Server Initialization"
    apt-get update -y
    apt-get install -y nginx
    systemctl enable --now nginx
  EOT
}
```

---

## 5. Summary & Next Steps

HCL provides a clean, expressive grammar for defining cloud architecture. In the next lesson, we will execute our **First Terraform Deployment and examine the full workflow lifecycle** (`init`, `plan`, `apply`, `destroy`, `fmt`, and `validate`).
