---
title: "Workshop: Configure and verify CourseOps with an Ansible role"
description: "Trace the Terraform-to-Ansible handoff, predict variable precedence, and demonstrate idempotency."
keywords: [CourseOps, Terraform, guided practice]
kind: workshop
track: core
---

# Configure and verify CourseOps with an Ansible role

<div class="lesson-goal"><strong>By the end of this workshop</strong><p>Trace the Terraform-to-Ansible handoff, predict variable precedence, and demonstrate idempotency.</p></div>

## Separate resource ownership from guest configuration

Terraform provides the host and outputs a small `web` object. `scripts/inventory.py` validates the public IP/environment and produces a static JSON inventory understood by Ansible's YAML inventory parser. Terraform never needs the private SSH key, and the playbook does not create EC2 instances.

Follow the README to generate the inventory, verify the host fingerprint through an authenticated source, and activate the Ansible virtual environment. Do not disable host-key checking. The play waits for SSH, waits for cloud-init to finish, gathers facts, and then applies the role.

## Read the role as a reusable unit

| Role directory | CourseOps responsibility |
| --- | --- |
| `defaults/` | Low-precedence title, environment, message and port settings |
| `tasks/` | Validate assumptions, install Nginx, render files, ensure the service runs |
| `templates/` | One escaped HTML page and one server configuration |
| `handlers/` | Validate changed Nginx configuration, then reload it |

Inventory sets the host's environment. Role defaults provide fallback values; extra variables supplied with `-e` override them. Use that override deliberately for a demonstration, then keep regular environment values in reviewed inventory/group configuration. Avoid defining the same setting in many places without a reason.

## Predict the second run

A template task changes only if the rendered file differs. The static page task needs no reload. The Nginx configuration task notifies validation and reload handlers, which are coalesced and normally run at the end of the play. If validation fails, fix the configuration before expecting a successful reload.

The second run should report no application changes while the package-cache window remains valid. Then change only the status message and predict which task will change. Verify both `/` and `/healthz`; a green playbook recap alone is not an HTTP health check.

## Check mode is a forecast

`--check --diff` is helpful for a configured host, but modules differ in check-mode support and commands may be skipped. A first-time package installation can leave dependent checks without the files they expect. Use an actual disposable-host run to verify first-install behavior.

For secret templates, prevent output with `no_log: true` and `diff: false` where appropriate. Ansible Vault protects encrypted source at rest; decrypted values still need safe handling during execution. CourseOps contains no application secret, so do not invent a password merely to demonstrate storage.

## Practice without a cloud host

From the bundle's `ansible` directory, run `ansible-playbook render-test.yml`. It renders the **same role page** locally and asserts the environment. Assignment 07 then asks you to complete a smaller template, prove escaping, repeat-run behavior and check-mode behavior. These establish templating skills, not Nginx installation or SSH reachability.

## Predict exactly which task changes

![Ansible page and configuration changes take different paths: the page is served directly, while changed configuration is validated and reloaded.](/images/lesson-diagrams/ansible-idempotence.svg)

| Change | Expected task effect | Handler effect |
| --- | --- | --- |
| Same inputs, valid apt cache | Existing content already matches | No reload |
| New status message | Page template changes | No reload needed |
| New server configuration | Configuration template changes | Validate, then reload |
| Later task fails | Host's remaining execution may stop | Notified handlers are not guaranteed to run |

Handlers normally run after the relevant play section and execute in definition order, not notification order. Do not assume the page is healthy from a recap. Inspect the configuration and service after a failure, correct the cause and rerun. For production, validate a candidate configuration before replacing the active one where the deployment design supports it.

## Project files and next problem

[Download all CourseOps labs](/downloads/courseops-labs.zip) · [Browse the project source](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops) · [Read the complete runbook](https://github.com/akiltipu/infra-automation-with-tf/tree/main/labs/courseops/README.md)

Next: [Section 07 mini assignment](/lessons/day-4-ansible-integration-and-orchestration/mini-assignment). Try it before opening the instructor solution.

<details class="knowledge-check"><summary>Why does changing the status message not need an Nginx reload?</summary><p>Nginx serves the static file content on requests. Only the server configuration task notifies the validation and reload handlers; a page-content update does not change that configuration.</p></details>

## Primary references

- [Ansible roles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html)
- [Check and diff mode](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_checkmode.html)
