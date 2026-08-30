---
title: "Advanced Expressions, Built-in Functions & Dynamic Blocks"
description: "Master HCL built-in functions, for comprehensions, defensive error handling with try/can, and iterating nested blocks using dynamic blocks."
keywords:
  - Built-in Functions
  - Dynamic Blocks
  - for expressions
  - lookup merge flatten
  - try and can
  - Security Group Rules
---

# Advanced Expressions, Built-in Functions & Dynamic Blocks

HCL provides a rich suite of built-in functions, list/map comprehension expressions, and dynamic block iterators for handling complex configuration logic.

---

## 1. Essential Built-in Functions

Terraform includes dozens of native functions for data transformation:

### A. Collection & Map Functions:
```hcl
locals {
  raw_tags  = { Environment = "prod" }
  team_tags = { Team = "DevOps", CostCenter = "901" }

  # merge: Combine multiple maps
  all_tags = merge(local.raw_tags, local.team_tags)

  # lookup: Safe map lookup with fallback default
  region_alias = lookup({ "us-east-1" = "virginia", "us-west-2" = "oregon" }, var.aws_region, "unknown")

  # flatten: Flattens nested lists of lists into a single list
  nested_subnets = [["subnet-1", "subnet-2"], ["subnet-3", "subnet-4"]]
  flat_subnets   = flatten(local.nested_subnets) # ["subnet-1", "subnet-2", "subnet-3", "subnet-4"]
}
```

### B. Defensive Error Handling with `try` and `can`:
```hcl
# can: Returns true if expression succeeds without error
is_valid_cidr = can(cidrhost("10.0.0.0/16", 0))

# try: Evaluates expressions in order, returning the first one that does not error
instance_type = try(var.custom_instance_type, var.default_type, "t3.micro")
```

---

## 2. `for` List & Map Comprehensions

Transform and filter collections dynamically:

### List Comprehension:
```hcl
variable "server_names" {
  default = ["web", "api", "worker", "db"]
}

# Produce uppercase list: ["WEB", "API", "WORKER", "DB"]
locals {
  upper_names = [for s in var.server_names : upper(s)]

  # Filter out "db": ["web", "api", "worker"]
  non_db_servers = [for s in var.server_names : s if s != "db"]
}
```

### Map Comprehension:
```hcl
# Convert list of users into map keyed by username
variable "user_list" {
  default = [
    { username = "alice", role = "admin" },
    { username = "bob",   role = "viewer" }
  ]
}

locals {
  user_map = { for u in var.user_list : u.username => u.role }
  # Result: { "alice" = "admin", "bob" = "viewer" }
}
```

---

## 3. Dynamic Blocks (Iterating Nested Blocks)

In HCL, some resources require nested blocks (such as `ingress` rules inside `aws_security_group` or `ebs_block_device` inside `aws_instance`). You cannot use a regular `for_each` inside a nested block. You must use a **`dynamic` block**:

```hcl
variable "web_ports" {
  type        = list(number)
  description = "List of ports to open for inbound traffic"
  default     = [80, 443, 8080]
}

resource "aws_security_group" "web" {
  name        = "dynamic-web-sg"
  description = "Security group with dynamically generated ingress ports"
  vpc_id      = "vpc-0123456789"

  # Generates 3 separate ingress blocks dynamically
  dynamic "ingress" {
    for_each = var.web_ports
    iterator = port # Custom iterator name (defaults to 'ingress')
    content {
      description = "Allow inbound port ${port.value}"
      from_port   = port.value
      to_port     = port.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

## 4. Summary & Next Steps

Built-in functions, `for` expressions, and dynamic blocks make your modules adaptable and expressive. In the next lesson, we will master **Resource Lifecycle Management and Meta-Arguments** (`create_before_destroy`, `prevent_destroy`, `ignore_changes`).
