---
title: "Data Sources, Provider Configuration & Local State Mechanics"
description: "Learn how to query live cloud data using Data Sources, configure multiple provider aliases, and understand how local state records infrastructure."
keywords:
  - Data Sources
  - aws_ami
  - Provider Aliases
  - terraform.tfstate
  - Local State Mechanics
kind: concept
track: extension
---

# Data Sources, Provider Configuration & Local State Mechanics

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Explain when a data source reads an object without owning it.</p></div>

<div class="project-connection"><strong>CourseOps · Section 02</strong><p>Extension reading: return after the core workshop. <a href="/lessons/day-1-first-deployment-and-core-hcl/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-1-first-deployment-and-core-hcl/mini-assignment">mini assignment</a>.</p></div>

Real-world cloud architectures rarely exist in a vacuum. You frequently need to reference existing cloud assets (such as official Ubuntu AMIs, standard VPCs, or DNS zones) without managing their lifecycle in your current Terraform code.

---

## 1. Data Sources: Reading Existing Infrastructure

A **Data Source** allows Terraform to read metadata from the cloud provider at runtime. Unlike `resource` blocks, Terraform will **never create, modify, or destroy** resources defined in a `data` block.


| Declaration | Operation | Ownership |
| :--- | :--- | :--- |
| resource "aws_instance" "web" | Create/read/update/delete | This state manages the instance. |
| data "aws_ami" "ubuntu" | Read/query | The image lifecycle is owned elsewhere. |


### Finding the Latest Ubuntu 22.04 LTS AMI Dynamically:
Instead of hardcoding brittle AMI IDs like `ami-0c55b159cbfafe1f0`, use a data source:

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical (Official Ubuntu Owner ID)

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Reference the dynamically discovered AMI ID
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}
```

---

## 2. Provider Aliases (Multi-Region / Multi-Account Setup)

Sometimes you need to provision resources across multiple AWS regions (e.g., primary in `us-east-1` and disaster recovery replica in `us-west-2`) within the same code module:

```hcl
# Default Provider (us-east-1)
provider "aws" {
  region = "us-east-1"
}

# Alternate Provider with Alias (us-west-2)
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

# Resource in Default Region (us-east-1)
resource "aws_s3_bucket" "primary_bucket" {
  bucket = "my-company-primary-storage-8921"
}

# Resource in Secondary Region (us-west-2) using provider alias
resource "aws_s3_bucket" "dr_bucket" {
  provider = aws.west
  bucket   = "my-company-dr-storage-8921"
}
```

---

## 3. Local State Mechanics & Limitations

With the default local backend and workspace, Terraform writes `terraform.tfstate` in your working directory after an apply that persists state.

### Inside `terraform.tfstate` (JSON):
```json
{
  "version": 4,
  "terraform_version": "1.10.5",
  "serial": 12,
  "lineage": "e7b4a2f8-9a3d-4c5e-8b1a-2c3d4e5f6a7b",
  "resources": [
    {
      "mode": "managed",
      "type": "aws_vpc",
      "name": "app_vpc",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "schema_version": 1,
          "attributes": {
            "id": "vpc-0abc123def456",
            "cidr_block": "10.0.0.0/16",
            "enable_dns_hostnames": true
          }
        }
      ]
    }
  ]
}
```

### Why Local State Fails in Teams:
1. **Concurrency Conflicts**: Local state supports locking on the same filesystem, but separate laptop copies can diverge and manage overlapping objects without a shared lock.
2. **Secrets in Plaintext**: State files contain sensitive database passwords and private keys in clear text JSON. Storing them locally on laptops or checking them into Git is a critical security vulnerability.
3. **No Centralized History**: Teammates cannot see recent infrastructure changes made by others.

---


## Apply the idea: make ami selection deliberate

A most_recent AMI query can resolve to a new image on a later plan even when your HCL is unchanged. Because changing an EC2 AMI generally requires replacement, review this as an image rollout. For controlled releases, promote a reviewed AMI ID per region through environment inputs.

<details class="knowledge-check">
<summary>Check your understanding: Will deleting the aws_ami data block delete the AMI?</summary>
<p>No. A data source does not own that image lifecycle. However, removing a reference or changing its result can change the resources that consume it.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/data-sources).

## Before moving to state management

Use the section workshop to connect the syntax to CourseOps, then complete the service-contract assignment. Explain the second no-change plan and the difference between a variable, a local value and an output. Reading the reference material alone is not evidence of a completed deployment.
