---
title: "Live Lab: Refactor count to for_each Without Recreation"
description: "Observe the count index-shift problem, migrate resource addresses with moved blocks, and verify that a safe refactor creates no infrastructure changes."
keywords:
  - Terraform count
  - Terraform for_each
  - moved block
  - State Refactoring
  - Live Lab
---

# Live Lab: Stable Resource Addresses

<div class="lab-banner"><strong>Scenario:</strong> a team manages three named services with <code>count</code>. Removing the middle item causes addresses to shift. We will first see the dangerous plan, then refactor to stable keys without recreating objects.</div>

This provider-free lab requires Terraform 1.4 or later.

## 1. Why addresses matter

Terraform tracks a resource instance by its address—not by the human meaning of its attributes.

```text
terraform_data.service[0]          # position-based identity
terraform_data.service["billing"] # key-based identity
```

For identical cattle-like instances, an index may be acceptable. For named services, accounts, databases, or subnets, a stable key usually matches the domain better.

## 2. Create the count version

```bash
mkdir stable-address-lab
cd stable-address-lab
```

Create `main.tf`:

```hcl
terraform { required_version = ">= 1.4.0" }

locals {
  services = ["accounts", "billing", "catalog"]
}

resource "terraform_data" "service" {
  count = length(local.services)

  input = {
    name = local.services[count.index]
  }

  # Makes identity changes visible as replacement in this demonstration.
  triggers_replace = local.services[count.index]
}
```

```bash
terraform init
terraform apply -auto-approve
terraform state list
```

You should see `[0]`, `[1]`, and `[2]`. Ask: “Which address means billing?” Terraform knows only that billing currently occupies index 1.

## 3. Expose the index-shift failure

Remove `"billing"` from the list, leaving `accounts` and `catalog`, then run:

```bash
terraform plan
```

Read the plan carefully. `catalog` moves from index 2 to index 1, so one address changes identity and another disappears. With replace-sensitive cloud resources, this can become an unnecessary destroy/create operation.

Do **not** apply this plan. Restore all three names.

## 4. Refactor with explicit moves

Replace the resource with:

```hcl
locals {
  services = toset(["accounts", "billing", "catalog"])
}

resource "terraform_data" "service" {
  for_each = local.services

  input = {
    name = each.key
  }

  triggers_replace = each.key
}

moved {
  from = terraform_data.service[0]
  to   = terraform_data.service["accounts"]
}

moved {
  from = terraform_data.service[1]
  to   = terraform_data.service["billing"]
}

moved {
  from = terraform_data.service[2]
  to   = terraform_data.service["catalog"]
}
```

Format and plan:

```bash
terraform fmt
terraform plan
```

The plan should report address moves and **0 to add, 0 to change, 0 to destroy**. Apply so the new addresses are recorded:

```bash
terraform apply -auto-approve
terraform state list
```

## 5. Repeat the original change

Remove `"billing"` again and run:

```bash
terraform plan
```

Now only `terraform_data.service["billing"]` is selected for destruction. `catalog` keeps its own stable address.

## 6. What the moved block actually does

A `moved` block changes Terraform's recorded address during planning. It does not call a cloud API to rename an object, and it does not copy infrastructure. Keep the block in version control long enough for every supported upgrade path to pass through the migration.

Use `terraform state mv` mainly for exceptional operator-led repair. Prefer `moved` blocks for code-reviewed, repeatable module refactors.

## 7. Failure drills

### Drill A — omit one move

Temporarily remove the `billing` moved block while all three names exist. The plan should propose destroying the old indexed instance and creating the keyed instance. Restore the block before applying.

### Drill B — map to the wrong key

Swap the destinations for billing and catalog. The plan exposes replacements because `triggers_replace` no longer agrees with the identity. This is why each move must be reviewed against state and domain meaning.

## 8. Clean up and decision rule

```bash
terraform destroy -auto-approve
cd ..
```

Choose `for_each` when instances have durable names. Choose `count` when instances are truly positional or interchangeable. Never choose based only on which syntax is shorter.

