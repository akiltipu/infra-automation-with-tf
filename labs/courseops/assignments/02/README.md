# Assignment 02 — A service contract

**Problem:** A teammate needs an unambiguous object describing the CourseOps environment. Implement the TODOs in `starter/main.tf`, without an AWS account. Budget: 40 minutes.

From `labs/courseops`, copy `assignments/02/starter` to `work/assignment-02`. All commands below run from that copy.

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -var=environment=dev
terraform apply -var=environment=dev
terraform output -json service
terraform plan -var=environment=dev
```

## Acceptance criteria

- `service` is `{project = "courseops", environment = "dev", port = 80}` and `id` is nonempty.
- A second plan reports no changes.
- `-var=environment=production`, `-var=port=0`, and `-var=port=80.5` each fail validation (supply a valid environment for port checks).
- Changing the port to 8080 plans one **update**, not a replacement. Explain why the ID is retained with `input`.
- Destroy the local object with `terraform destroy -var=environment=dev` after recording evidence.

Submit your HCL, sanitized output, and three sentences explaining variable → resource input → output. Do not submit state. Terraform creates a local state record here, not a real web service.

## Graduated hints

1. Use `terraform_data`; Terraform includes its provider.
2. Use `contains` for allowed environments and `floor` to reject fractional ports.
3. Return `terraform_data.service.output`; read the ID separately.

Reference: `reference/main.tf`. Instructor explanation: `../../instructor/02.md`.
