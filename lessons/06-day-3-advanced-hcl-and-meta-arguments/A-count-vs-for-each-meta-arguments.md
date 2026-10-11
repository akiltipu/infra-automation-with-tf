---
title: "Advanced Control Flow: count vs for_each Meta-Arguments"
description: "A comprehensive deep dive into iteration in Terraform, understanding the index-shift identity risk of count, and when to use for_each on sets and maps."
keywords:
  - count
  - for_each
  - Index Shifting Risk
  - Conditional Creation
  - each.key
  - each.value
kind: concept
track: core
---

# Advanced Control Flow: `count` vs `for_each` Meta-Arguments

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Choose durable resource keys and predict index-shift consequences.</p></div>

<div class="project-connection"><strong>CourseOps · Section 06</strong><p>Apply this concept in the connected project. <a href="/lessons/day-3-advanced-hcl-and-meta-arguments/project-workshop">Open the section workshop</a>, then solve the <a href="/lessons/day-3-advanced-hcl-and-meta-arguments/mini-assignment">mini assignment</a>.</p></div>

![Count shifts index identity while for_each preserves named keys](/images/lesson-diagrams/addresses.svg)

Terraform provides two meta-arguments for creating multiple instances of a resource: **`count`** and **`for_each`**. Choosing the wrong one can cause unintentional destruction of production infrastructure.

---

## 1. The Mechanics of `count` & The Index Shifting Risk

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
> If these were RDS databases or EC2 instances, removing a middle item shifts later identities. Attributes may update in place or require replacement depending on the resource schema, and the final index is removed. Inspect the plan; replacement is not universal.

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

One useful case for `count` is **Conditional Resource Creation (Boolean Switch)**:

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


## Apply the idea: compare identity, not syntax

With count, removing bob shifts charlie from index 2 to index 1. Terraform sees changed attributes at [1] and a removed [2]; the provider determines whether changed attributes update or replace. With for_each, removing the bob key leaves the charlie address stable.

<details class="knowledge-check">
<summary>Check your understanding: Can a newly created resource ID be a for_each key in the same plan?</summary>
<p>Keys must be known before apply. Prefer stable configuration keys such as service names; computed IDs can be values. Sensitive values are also unsuitable as exposed instance keys.</p>
</details>

**Read further:** [Official documentation](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each).

## 4. Summary & Next Steps

Use `for_each` for durable named identities; `count` is also suitable for conditional or genuinely interchangeable instances. In the next lesson, we will master **Expressions, Built-in Functions, and Dynamic Blocks**.
