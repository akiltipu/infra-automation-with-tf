---
title: "Introducing Ansible in the Cloud Infrastructure Ecosystem"
description: "Understand the roles of Terraform and Ansible, comparing Infrastructure Provisioning vs Configuration Management, and analyzing Immutable vs Mutable paradigms."
keywords:
  - Ansible
  - Configuration Management
  - Terraform vs Ansible
  - Immutable Infrastructure
  - Mutable Infrastructure
  - DevOps Toolchain
---

# Introducing Ansible in the Cloud Infrastructure Ecosystem

<div class="lesson-goal"><strong>By the end of this lesson</strong><p>Assign provisioning and guest configuration to clear owners.</p></div>

In modern enterprise cloud engineering, delivering a production application involves two distinct responsibilities: **Provisioning Infrastructure** and **Configuring Software**. 

Understanding how **Terraform** and **Ansible** complement each other is key to building end-to-end automated pipelines.

---

## 1. The Separation of Responsibilities


| Owner | Typical responsibilities |
| :--- | :--- |
| Terraform | VPCs, routes, instances, IAM, security groups. |
| Ansible | Packages, templates, services, guest OS configuration. |




---

## 2. Immutable vs. Mutable Infrastructure

There are two major architectural patterns for managing virtual machine software:

### Pattern A: Mutable Infrastructure (Terraform + Ansible)
- Terraform deploys standard, generic OS images (e.g., base Ubuntu 22.04 LTS).
- Ansible connects to the running instances, updates packages, and installs the latest application version in place.
- **Advantage**: Fast feedback loops, lower AMI storage costs, flexible for on-the-fly patching.

### Pattern B: Immutable Infrastructure (Packer + Terraform)
- HashiCorp **Packer** uses Ansible during a build pipeline to bake an "Amazon Machine Image" (AMI) containing all dependencies.
- Terraform deploys instances using the pre-baked AMI.
- To update the app, a new AMI is baked, and Terraform performs a replacement coordinated with health checks and an ASG instance refresh or other rollout mechanism.
- **Advantage**: Fast auto-scaling launch times and fewer runtime package-installation dependencies.

---

## 3. Why Ansible? Key Characteristics

1. **Agentless Architecture**: Unlike Chef or Puppet, Ansible requires **no background daemon or agent** installed on target servers. It operates entirely over standard **OpenSSH** (Linux) or **WinRM** (Windows).
2. **Declarative YAML Playbooks**: Tasks describe the desired target state rather than imperative shell commands.
3. **Idempotency-aware modules**: Many Ansible modules check current state; shell commands, restart tasks, and time-dependent operations need explicit design to be repeatable. If a package is already installed or a file already contains the correct line, Ansible reports `ok: 0 changed`.
4. **Massive Module Ecosystem**: Native modules for managing `apt`, `yum`, `systemd`, `template` (Jinja2), `copy`, `user`, `git`, and Docker.

---


## Apply the idea: choose mutable or image-based delivery

For a small sandbox VM, applying a playbook in place makes the change visible. For a large fleet, bake a tested image and roll it out through health-aware replacement. Ansible can participate in either approach; the distinction is when configuration happens and how updates reach running machines.

<details class="knowledge-check">
<summary>Check your understanding: Can Terraform and Ansible both manage the same security-group rules?</summary>
<p>They can technically call the APIs, but shared ownership invites oscillation and drift. Give the rules one owner and expose only the inputs the other tool needs.</p>
</details>

**Read further:** [Official documentation](https://docs.ansible.com/ansible/latest/getting_started/index.html).

## 4. Summary & Next Steps

Terraform and Ansible together provide complete automation from raw cloud compute to running software. In the next lesson, we will master **Ansible Architecture, Inventories, Tasks, Modules, and Playbooks**.
