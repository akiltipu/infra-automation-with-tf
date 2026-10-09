# Assignment 05 — Repair a module contract

**Problem:** A module accepts an impossible TCP port. Its consumer must learn about the error before infrastructure is changed. Copy `starter` to `work/assignment-05`. Budget: 40 minutes.

```bash
terraform init
terraform test
# Expect the negative port test to fail before your repair.
```

## Acceptance criteria

- Fix the module, not the existing failing test. All supplied tests then pass.
- Add a test rejecting a fractional port, and a positive test accepting port 65535.
- Keep the existing environment and output contract stable.
- Explain what `command = plan`, `command = apply`, and `expect_failures` verify.
- In the AWS project, run the mock tests in `modules/network` and `modules/web`. State one thing a mock cannot verify (for example IAM permission or an actual route).

The local test uses the built-in provider and cleans its own test state. Read cleanup warnings if a test is interrupted. Submit HCL, tests, and the before/after result; do not submit generated state.

## Graduated hints

1. Type `number` accepts fractions.
2. Reject invalid input at `var.port`, which is the address listed in `expect_failures`.
3. Combine range checks with `floor(var.port) == var.port`.

Compare `reference/` after the attempt. Instructor notes: `../../instructor/05.md`.
