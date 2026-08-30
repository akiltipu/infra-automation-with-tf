---
title: "Building Production-Grade Infrastructure Modules"
description: "Step-by-step hands-on guide to building an enterprise-ready AWS VPC and networking module complete with public/private subnets, NAT gateways, and outputs."
keywords:
  - Custom Module
  - Production Module
  - VPC Module
  - cidrsubnet
  - Module Outputs
---

# Building Production-Grade Infrastructure Modules

Let us construct a production-ready **AWS Networking Module** from scratch, supporting configurable CIDR blocks, multi-AZ public and private subnets, and NAT gateways.

---

## 1. Defining Module Inputs (`variables.tf`)

```hcl
# modules/aws-network/variables.tf

variable "vpc_cidr" {
  type        = string
  description = "Base CIDR block for the VPC"
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrnetmask(var.vpc_cidr))
    error_message = "Must be a valid IPv4 CIDR block."
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

## 5. Summary & Next Steps

You have built a reusable, production-grade networking module with automated CIDR calculation and standard outputs. In the next lesson, we will explore **Module Sources, the Public Terraform Registry, and Version Pinning**.
