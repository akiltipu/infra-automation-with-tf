---
title: "Resource Lifecycle Management & Meta-Arguments"
description: "Control how Terraform creates, updates, and destroys resources using lifecycle meta-arguments: create_before_destroy, prevent_destroy, ignore_changes, and depends_on."
keywords:
  - lifecycle block
  - create_before_destroy
  - prevent_destroy
  - ignore_changes
  - replace_triggered_by
  - depends_on
---

# Resource Lifecycle Management & Meta-Arguments

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Explain the limits of lifecycle rules before relying on them.</p></div>

By default, when a resource property requires recreation, Terraform **destroys the existing resource first, then creates the new one**. This causes downtime. With the **`lifecycle` block**, you can fine-tune resource replacement, protect production databases from deletion, and ignore non-critical drift.

---

## 1. Replacement Ordering: `create_before_destroy`

When updating an ASG Launch Template, Auto Scaling Group, or Security Group, you want the new resource online before the old one is terminated:

```hcl
resource "aws_security_group" "web" {
  name_prefix = "web-sg-"
  vpc_id      = "vpc-0123456789"

  lifecycle {
    create_before_destroy = true # Provisions new SG, updates references, then deletes old SG
  }
}
```

> [!NOTE]
> When using `create_before_destroy = true` with resources that have name constraints (like Security Groups or IAM roles), use a provider-supported unique-name strategy such as `name_prefix` where available. Also allow overlap in quotas and cost; this setting alone does not guarantee healthy traffic cutover or zero downtime.

---

## 2. Preventing Accidental Deletion: `prevent_destroy`

This protection disappears if you remove the resource block. It cannot stop console/API deletion. Combine it with service deletion protection, IAM, and tested backups. The resource examples here illustrate lifecycle settings and omit required surrounding configuration.

Protect critical production stateful resources (such as production RDS databases or primary S3 data lakes):

```hcl
resource "aws_db_instance" "production_db" {
  allocated_storage = 100
  engine            = "postgres"
  instance_class    = "db.r6g.xlarge"

  lifecycle {
    prevent_destroy = true # Rejects a planned destroy while this rule remains in configuration
  }
}
```

---

## 3. Ignoring External Drift: `ignore_changes`

In production, external systems often modify resource attributes. For example:
- AWS Auto Scaling dynamically adjusts `desired_capacity`.
- Kubernetes controllers add custom labels or tags.

```hcl
resource "aws_autoscaling_group" "web_asg" {
  name                 = "web-asg"
  min_size             = 2
  max_size             = 10
  desired_capacity     = 2 # Initial bootstrap value

  lifecycle {
    # Ignore changes to desired_capacity so Terraform doesn't revert Auto Scaling events
    ignore_changes = [
      desired_capacity
    ]
  }
}
```

---

## 4. Explicit Dependencies: `depends_on`

Terraform automatically detects dependencies when you reference attributes (e.g. `aws_subnet.public.id`). However, when a resource depends on an invisible background side effect (such as an IAM policy being attached before an S3 bucket or EKS node can function), use `depends_on`:

```hcl
resource "aws_iam_role_policy_attachment" "worker_node_policy" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "standard-workers"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = module.vpc.private_subnet_ids

  # Explicitly wait for IAM permissions to attach before creating the node group
  depends_on = [
    aws_iam_role_policy_attachment.worker_node_policy
  ]
}
```

---


## Apply the idea: design a replacement

Creating a replacement before destroying the old object requires two objects to coexist. Unique names, capacity quotas, dependency updates, and service health must all permit that overlap. A database still needs a separate data-migration and recovery strategy; ordering alone cannot preserve its contents.

<details class="knowledge-check">
<summary>Check your understanding: If the resource block is removed, does prevent_destroy still protect it?</summary>
<p>No. The rule is part of the configuration you removed. Keep cloud deletion protection, scoped IAM, approvals, and verified backups as independent controls.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle).

## 5. Day 3 Wrap-up & Transition to Day 4

You have completed **Day 3: Reusable Modules & Advanced HCL Expressions**:
- Designed clean root and child module contracts adhering to single responsibility and encapsulation.
- Built a reusable AWS public-network teaching module with dynamic subnet calculations.
- Mastered module sources, semantic version pinning, and public/private registries.
- Explored Flat vs Nested composition patterns and Platform Engineering Golden Paths.
- Mastered `count` vs `for_each`, built-in functions, comprehension expressions, and `dynamic` blocks.
- Configured resource lifecycles with `create_before_destroy`, `prevent_destroy`, and `ignore_changes`.

In **Day 4**, we reach the pinnacle of the course: **Introducing Ansible for Configuration Management**, building an **End-to-End Terraform + Ansible Orchestration Lab**, and deploying **Enterprise CI/CD Pipelines and Policy as Code**!
