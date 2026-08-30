---
title: "Advanced Control Flow: count vs for_each Meta-Arguments"
description: "A comprehensive deep dive into iteration in Terraform, understanding the index-shift destruction bug of count, and when to use for_each on sets and maps."
keywords:
  - count
  - for_each
  - Index Shifting Bug
  - Conditional Creation
  - each.key
  - each.value
---

# Advanced Control Flow: `count` vs `for_each` Meta-Arguments

Terraform provides two meta-arguments for creating multiple instances of a resource: **`count`** and **`for_each`**. Choosing the wrong one can cause unintentional destruction of production infrastructure.

---

## 1. The Mechanics of `count` & The Index Shifting Bug

`count` accepts an integer and creates resources referenced by an **array index (`[0]`, `[1]`, `[2]`)**:

```hcl
variable "usernames" {
  type    = list(string)
  default = ["alice", "bob", "charlie"]
}

resource "aws_iam_user" "users" {
  count = length(var.usernames)
  name  = var.usernames[count.index]
}
```
State mappings created:
- `aws_iam_user.users[0]` ──► `alice`
- `aws_iam_user.users[1]` ──► `bob`
- `aws_iam_user.users[2]` ──► `charlie`

### The Disaster Scenario (Index Shift):
Suppose someone removes `"bob"` from the list: `["alice", "charlie"]`.

```
BEFORE REMOVAL:               AFTER REMOVING "bob":
[0] = alice                   [0] = alice (No change)
[1] = bob          ──►        [1] = charlie (Terraform updates/destroys bob to become charlie!)
[2] = charlie                 [2] = DELETED! (Terraform terminates charlie!)
```
> [!CAUTION]
> If these were RDS databases or EC2 instances, removing an item from the middle of the list causes Terraform to **destroy and recreate every subsequent resource in the list**!

---

## 2. The Solution: `for_each` with Maps and Sets

`for_each` identifies resources by a **stable string key** rather than an integer index. Removing an item only deletes that specific item, leaving all other resources completely untouched:

```hcl
variable "users" {
  type = map(object({
    department = string
    role       = string
  }))
  default = {
    "alice" = { department = "engineering", role = "admin" }
    "bob"   = { department = "product",     role = "editor" }
    "charlie" = { department = "security",  role = "viewer" }
  }
}

resource "aws_iam_user" "team" {
  for_each = var.users # Iterates over map keys

  name = each.key # "alice", "bob", "charlie"
  tags = {
    Department = each.value.department
    Role       = each.value.role
  }
}
```
State mappings created:
- `aws_iam_user.team["alice"]`
- `aws_iam_user.team["bob"]`
- `aws_iam_user.team["charlie"]`

Removing `"bob"` only removes `aws_iam_user.team["bob"]`!

---

## 3. When is `count` Still Appropriate?

The primary valid use case for `count` in production is **Conditional Resource Creation (Boolean Switch)**:

```hcl
variable "enable_monitoring" {
  type    = bool
  default = true
}

resource "aws_cloudwatch_metric_alarm" "cpu_alarm" {
  count = var.enable_monitoring ? 1 : 0 # Creates resource if true, skips if false

  alarm_name          = "high-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 80
}
```

---

## 4. Summary & Next Steps

Use `for_each` for collections of named resources and reserve `count` for boolean toggles. In the next lesson, we will master **Expressions, Built-in Functions, and Dynamic Blocks**.
