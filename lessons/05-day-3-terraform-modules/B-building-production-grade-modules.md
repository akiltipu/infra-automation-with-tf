---
title: "Building a Reusable Networking Module"
description: "Build a focused VPC and public-subnet module with CIDR calculations, routing, inputs, and outputs; identify production extensions."
keywords:
  - Custom Module
  - Production Module
  - VPC Module
  - cidrsubnet
  - Module Outputs
---

# Building a Reusable Networking Module

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Explain CIDR subdivision and the resources that make a subnet public.</p></div>

Build a **public-network teaching module** with a VPC, public subnets, an internet gateway, and route associations. It does not include private subnets, NAT gateways, flow logs, or a complete production network. Add these only after deciding egress, availability, and cost requirements.

The caller supplies an AWS provider for `us-east-1`. Add `required_providers` with `hashicorp/aws` in the child and configure the provider in the root. With `newbits = 8`, use an IPv4 VPC prefix from /16 through /20 so the resulting subnets stay within AWS sizes. Keep the AZ list stable: reordering a count-based list changes address-to-subnet mappings.

---

## 1. Defining Module Inputs (`variables.tf`)

```hcl
# modules/aws-network/variables.tf

variable "vpc_cidr" {
  type        = string
  description = "Base CIDR block for the VPC"
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrnetmask(var.vpc_cidr)) && can(regex("/(1[6-9]|20)$", var.vpc_cidr))
    error_message = "Use an IPv4 CIDR with a prefix from /16 through /20 for this example."
  }
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zones for subnet distribution"
  default     = ["us-east-1a", "us-east-1b"]
}

variable "environment" {
  type        = string
  description = "Deployment environment name (e.g., dev, prod)"
}
```

---

## 2. Implementing Resources (`main.tf`)

We will use the built-in `cidrsubnet()` function to programmatically calculate non-overlapping subnet IP ranges:

```hcl
# modules/aws-network/main.tf

# 1. Main VPC
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

# 2. Public Subnets across specified AZs
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment}-public-${var.availability_zones[count.index]}"
    Tier = "Public"
  }
}

# 3. Internet Gateway
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.environment}-igw"
  }
}

# 4. Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.environment}-public-rt"
  }
}

# 5. Associate Public Subnets with Route Table
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

---

## 3. Exposing Module Outputs (`outputs.tf`)

```hcl
# modules/aws-network/outputs.tf

output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "List of IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.this.cidr_block
}
```

---

## 4. Consuming the Module in Root Code

```hcl
# environments/prod/main.tf

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "primary_network" {
  source = "../../modules/aws-network"

  vpc_cidr           = "10.50.0.0/16"
  environment        = "production"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Pass module output to other resources
resource "aws_security_group" "web_sg" {
  name   = "prod-web-sg"
  vpc_id = module.primary_network.vpc_id # Referenced cleanly via module output!
}
```

---


## Apply the idea: calculate before provisioning

For cidrsubnet("10.0.0.0/16", 8, 2), adding 8 prefix bits produces /24 networks, and network number 2 is 10.0.2.0/24. The example uses indices 0 and 1 for the first two AZs. Route-table association, not a Public tag, gives each subnet its route to the internet gateway.

<details class="knowledge-check">
<summary>Check your understanding: Does this module provide private subnets or NAT?</summary>
<p>No. Extend it with separate subnet ranges, route tables, an explicit egress design, and outputs before describing it as a full production network. Estimate NAT and cross-AZ costs separately.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/functions/cidrsubnet).

## 5. Summary & Next Steps

You have built a reusable public-network teaching module with automated CIDR calculation and standard outputs. In the next lesson, we will explore **Module Sources, the Public Terraform Registry, and Version Pinning**.
