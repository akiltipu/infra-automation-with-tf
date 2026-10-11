# Capstone: deliver CourseOps with evidence

## Brief

A small team needs a repeatable status website for its development sandbox. Another engineer must be able to reproduce, change, recover and remove it from your documentation. Deliver the core design, then explain which controls would be required before production.

## Required outcomes

1. A named environment and typed module contract with a no-change second plan.
2. Separate state for dev and the local prod simulation; show caller identity for any AWS run.
3. A demonstrated non-destructive address migration with preserved object IDs.
4. A failing test followed by a meaningful fix; show why it failed.
5. The actual status-page template rendered with the intended environment. AWS path: also demonstrate `/healthz`, verified SSH, and repeat-run behavior.
6. A delivery decision showing the reviewed commit, planned actions, approval boundary, and exact saved-plan apply command. A diagram alone is not a working AWS pipeline.
7. An incident write-up and a cleanup record. Explain state recovery versus data recovery.

## Submission

Submit a Git commit/link or ZIP of authored non-secret code, `evidence.md`, an architecture sketch, and a five-minute demonstration. Do not include state, saved plans, credentials, private keys, generated inventories, or full plan JSON. Redact account IDs and IPs where appropriate. Summaries and selected non-secret assertions are sufficient.

## Acceptance and scoring (100 points)

| Area | Points | Evidence |
| --- | --- | --- |
| Reproducibility | 20 | Another learner follows instructions and obtains the expected outputs |
| Terraform ownership and isolation | 20 | Separate states, appropriate identity, no unintended changes |
| Tests and refactor | 20 | Negative test fails; migration preserves IDs; stable keys explained |
| Configuration and verification | 15 | Template values, idempotency; AWS health checks if that path is claimed |
| Delivery and recovery reasoning | 15 | Trusted commit/plan/approval relationship and incident response |
| Cleanup and explanation | 10 | Resource cleanup evidence and honest limits |

Suggested pass: 75/100 and correction of any credential exposure or unintended destructive plan. This threshold is an instructor choice, not a research-derived measure. Learners may revise after feedback. The cloud-free submission is assessed against local outcomes and must explicitly state that AWS runtime behavior is not verified.

## Stretch objectives (choose one)

- Private compute with a working operator path and justified egress.
- TLS behind an ALB, health-based rollout, and a cost comparison.
- A tested KMS backend policy and coordinated state-version recovery.
- Scoped OIDC delivery in a restricted repository with a real approval record.

These require extra infrastructure and time. Do not infer that finishing the core sandbox makes it production-ready. Reference implementation: `checkpoints/05-modular`, `modules`, `ansible`, and `instructor/08.md`.
