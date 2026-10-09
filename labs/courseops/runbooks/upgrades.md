# Controlled upgrades and stable identity

A module version, provider version, and Terraform CLI version are three different dependencies. The provider lockfile selects provider versions/checksums; it does not pin modules or the CLI. Commit reviewed lockfiles from root modules; keep state, downloaded providers and secrets out of Git.

## Upgrade rehearsal

1. Record the current CLI version, provider lockfile, module sources and a baseline no-change plan.
2. Create a branch. Change only one dependency category. Read its official release and migration notes.
3. Run `terraform init -upgrade` in the intended working root, then inspect the lockfile diff. Do not delete the lockfile just to make a conflict disappear.
4. Run formatting, validation, contract tests and mock tests. Test at least one deliberately invalid input to prove the gate can fail.
5. Review a real sandbox plan: are changes expected updates, replacements, or just address moves? A passing mock test is insufficient evidence of an AWS upgrade.
6. Apply only the reviewed plan; compare IDs, page response, `/healthz`, and the repeat-run Ansible result.
7. Promote the same versions and inputs deliberately. Rolling back source may not reverse a provider state-schema migration; preserve snapshots and consult downgrade support before attempting it.

## Resource identity experiment

The section 06 exercise begins with positional `count` instances, then moves them to named keys. Make the migration first, prove no replacement, and remove one key afterward. Combining the refactor and membership change makes it harder to distinguish intended deletion from accidental recreation.

## Networking extension decision

| Requirement | Option | Consequence |
| --- | --- | --- |
| Private VM needs general internet package repositories | NAT per AZ / approved egress proxy | Ongoing charges, routing and availability decisions |
| Private workload only needs supported S3 access | S3 gateway endpoint | Service-specific route and policy; not general internet access |
| No live package installation is allowed | Prebaked image | Image pipeline and rollout verification replace runtime installation |

CourseOps creates private subnets but keeps the teaching web host public with /32 ingress. Switching the host to private networking also requires an operator path (for example approved SSM access) and package egress. Merely enabling an S3 endpoint does not let apt reach Ubuntu repositories. The optional NAT flag creates one NAT gateway per configured pair; discuss hourly, traffic, public IPv4 and cross-AZ costs before enabling it.

References: https://developer.hashicorp.com/terraform/language/files/dependency-lock and https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html
