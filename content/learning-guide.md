# Your guide to learning the course

Build a habit you can reuse: predict the change, inspect the evidence, explain the result, and clean up. You can read every page without an account. Lab files are available in the [project download](/downloads/courseops-labs.zip).

## Choose your path

| Path | Start here | Evidence you can claim |
| --- | --- | --- |
| Cloud-free | Terraform, Git, Python 3.11+, a terminal; the bundle's `local/` and assignment directories | Local state, validation, identity-preserving refactors, template behavior and policy decisions |
| AWS sandbox | The above plus AWS CLI, a scoped sandbox identity, an SSH key and a cost agreement | Actual cloud provisioning, host access and application health, when tested |
| Extension | Finish the core first; choose one architecture or delivery improvement | Only the behavior you implement and verify |

A local model is useful practice, but it cannot prove AWS routing or permissions. For the cloud path, read the README before applying anything. Keep the one `work/dev` state through the project; checkpoint folders are reference snapshots, not stacks to apply one after another.

## Check your starting point

Try these before the first live session. If a step is unfamiliar, ask for a short preparatory exercise before adding cloud resources.

1. Create a directory, enter it, edit a text file, and explain its absolute path.
2. Make a Git commit, change the file, and inspect the diff. Explain why a commit is not a deployment.
3. Explain what an IP address, port and subnet identify. Distinguish an inbound rule from an outbound route.
4. Run `terraform version`, `git --version` and `python3 --version`. Compare them with the lab README's requirements.
5. AWS path only: identify the account and role from `aws sts get-caller-identity`. Do not proceed if the target is unexpected.

The bundle uses Terraform >=1.10 and <2; CI tests its teaching baseline at 1.10.5. This is a compatibility baseline, not a claim that it is the latest production release. Check the README and release notes before upgrading tools together.

## Use each lesson type deliberately

| Label | What to do | When you are ready to continue |
| --- | --- | --- |
| Core | Read for one decision you need to understand | Explain the checkpoint in your own words |
| Workshop | Follow the guided CourseOps change and inspect its output | Connect the concept to the project's files and resource IDs |
| Assignment | Attempt the independent problem before opening a reference | Meet its acceptance criteria and explain the evidence |
| Extension | Return after the core, or use an extended schedule | State which additional assumption or control you tested |

Reading times are rough estimates from text length. They exclude installations, troubleshooting and practice. The four-day instructor schedule includes guided work and assignments; the capstone needs additional demonstration or take-home time. Progress marks are self-assessment saved in this browser. They are not exam scores and do not sync between devices.

## Make the practice count

**Before running:** write your prediction. Will Terraform create, update, replace, destroy, or do nothing? Which account and state are selected?

**After running:** compare the observation with the prediction. Record only the relevant, non-secret lines. A green exit code does not by itself explain what was checked.

**When stuck:** use the first hint, retry, then use the next. If you read the reference solution, close it and reconstruct the reasoning with a changed input.

**After a delay:** explain one idea without notes the next day and again about a week later. Those intervals are a practical teaching choice, not a universal optimum. Try a transfer question: what changes if a service is renamed, a different account is selected, or an apply fails halfway?

The lab bundle includes `LEARNING-LOG.md`. Use it for predictions, evidence, feedback and later recall. Keep raw state, saved plans, full plan JSON, credentials and private keys out of submissions.

## Read a plan with four questions

1. **Target:** Is this the intended root, backend key, workspace and cloud identity?
2. **Action:** Which addresses are being created, updated, replaced, moved or deleted?
3. **Reason:** Which code, input, provider or observed change explains each action?
4. **Consequence:** Could it interrupt traffic, lose data, change access or create ongoing cost?

| Plan signal | Interpretation | Next question |
| --- | --- | --- |
| `+` | Create an object | Is this a new requirement or a lost binding? |
| `~` | Update an existing object | What operational behavior changes? |
| `-/+` or `+/-` | Replace an object | What preserves service and data during replacement? |
| Address move with no mutations | Rebind the address to the existing object | Does the move preserve the correct business identity? |
| No changes | No actions under the evaluated configuration and observations | Which health or external behavior remains untested? |

`terraform plan -detailed-exitcode` uses 0 for no changes, 2 for changes, and 1 for an error. Do not accidentally classify a plan with changes as a failed Terraform command.

## Troubleshoot from the first failed boundary

| Symptom | Inspect first | Evidence to gather |
| --- | --- | --- |
| Command not found | Installation and shell PATH | Version command and executable location |
| Provider initialization failure | Network, lockfile, platform and plugin startup | The first error from `init`; no credentials in screenshots |
| Unexpected resource actions | Root, state, inputs, versions and moved addresses | Selected action summary and the relevant source diff |
| Lock error | Whether the original writer is still active | Job owner, target key and process status |
| SSH timeout | Current operator IP, route, public IP and security group | Reachability checks; do not widen access blindly |
| SSH host-key mismatch | Expected replacement or possible wrong host | Fingerprint verified through an authenticated channel |
| Playbook succeeds but page fails | Nginx config, service status and HTTP path | `/healthz`, `nginx -t`, service logs and the allowed client address |

Change one assumption at a time. If you cannot explain the selected account or state, stop the cloud operation and resolve that first.

## A glossary you can use while building

| Term | Meaning in CourseOps |
| --- | --- |
| Root module | The working directory where you run Terraform, such as `work/dev` |
| Child module | A reusable configuration called by the root, such as `modules/network` |
| Provider | The plugin that translates Terraform operations into service API calls |
| Resource address | Terraform's logical name, such as `module.web.aws_instance.web` |
| Remote ID | The service's identifier for the actual object; it is not its Terraform address |
| State | The record binding addresses to managed objects and their known attributes |
| Backend | The mechanism that stores state and may support coordination/locking |
| Drift | A difference caused by changes outside the managed configuration workflow |
| Plan | Proposed actions after evaluating configuration, state and provider observations |
| Dependency | An ordering relationship, usually inferred from an attribute reference |
| Idempotence | Repeating the same operation converges without unnecessary additional changes |
| Inventory | Ansible's host/group connection and variable data |
| Handler | An Ansible task notified by a change; usually runs later in the play |
| OIDC | A way to federate job identity for temporary credentials under an explicit trust policy |
| Mock | A substitute for provider behavior that checks configuration without proving cloud behavior |
| Blast radius | The resources or users that a failed change could affect |

## What finishing means

You can reproduce a small project, explain its ownership boundaries, repair a failure, preserve identities during a refactor and review a change using evidence. The capstone rubric tests these outcomes. A production service also needs workload-specific availability, TLS, identity controls, observability, backups, cost ownership and tested recovery.

If an assignment does not meet its criteria, use feedback and retry. If it does, change one condition and explain what should happen before touching the keyboard.

## Sources behind this guide

- [IES practice guide: instruction, worked examples and retrieval](https://ies.ed.gov/ncee/wwc/practiceguide/1)
- [HashiCorp: Terraform's core workflow](https://developer.hashicorp.com/terraform/intro/core-workflow)
- [HashiCorp: planning modes and exit codes](https://developer.hashicorp.com/terraform/cli/commands/plan)
- [HashiCorp: provider mocking and its scope](https://developer.hashicorp.com/terraform/language/tests/mocking)
- [Ansible: handlers and execution order](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html)
